// worker/auth.ts
import { Context, MiddlewareHandler } from 'hono';
import { Env, User, Session } from './types';

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;
export const SESSION_COOKIE_NAME = 'maktaba_session';
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Convert Uint8Array to Hex string
function bufToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Secure PBKDF2 Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_BYTES * 8
  );

  const hash = new Uint8Array(derivedBits);
  return `$pbkdf2$${PBKDF2_ITERATIONS}$${bufToHex(salt)}$${bufToHex(hash)}`;
}

// Verify Password
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
    return false;
  }

  const iterations = parseInt(parts[2], 10);
  const salt = hexToBuf(parts[3]);
  const expectedHash = hexToBuf(parts[4]);

  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    expectedHash.length * 8
  );

  const actualHash = new Uint8Array(derivedBits);
  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  // Timing-safe equality comparison
  let match = 0;
  for (let i = 0; i < actualHash.length; i++) {
    match |= actualHash[i] ^ expectedHash[i];
  }
  return match === 0;
}

// Generate Secure Random Session ID
export function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bufToHex(bytes);
}

// Generate Secure Random UUID
export function generateUUID(): string {
  return crypto.randomUUID();
}

// Parse cookies from Request Header
export function getCookie(c: Context, name: string): string | null {
  const cookieHeader = c.req.header('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((v) => v.trim());
  for (const cookie of cookies) {
    const [k, ...v] = cookie.split('=');
    if (k === name) {
      return decodeURIComponent(v.join('='));
    }
  }
  return null;
}

// Set HTTP-only Cookie
export function setSessionCookie(c: Context, sessionId: string, maxAgeSeconds: number = 30 * 24 * 3600): void {
  const isProd = c.env.ENVIRONMENT === 'production';
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isProd) {
    cookieParts.push('Secure');
  }
  c.header('Set-Cookie', cookieParts.join('; '));
}

// Clear HTTP-only Cookie
export function clearSessionCookie(c: Context): void {
  const isProd = c.env.ENVIRONMENT === 'production';
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];
  if (isProd) {
    cookieParts.push('Secure');
  }
  c.header('Set-Cookie', cookieParts.join('; '));
}

// Authentication Context Middleware
export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: { user?: User; session?: Session } }> = async (
  c,
  next
) => {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (sessionId) {
    const now = Date.now();
    const sessionRes = await c.env.DB.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > ?'
    )
      .bind(sessionId, now)
      .first<Session>();

    if (sessionRes) {
      const userRes = await c.env.DB.prepare(
        'SELECT * FROM users WHERE id = ? AND status = "active"'
      )
        .bind(sessionRes.user_id)
        .first<User>();

      if (userRes) {
        c.set('user', userRes);
        c.set('session', sessionRes);
      }
    }
  }

  await next();
};

// Require Authenticated User Middleware
export const requireAuth: MiddlewareHandler<{ Bindings: Env; Variables: { user?: User; session?: Session } }> = async (
  c,
  next
) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Uthibitisho unahitajika (Authentication required)' }, 401);
  }
  await next();
};

// Require Admin Middleware
export const requireAdmin: MiddlewareHandler<{ Bindings: Env; Variables: { user?: User; session?: Session } }> = async (
  c,
  next
) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Ruhusa ya msimamizi inahitajika (Admin access required)' }, 403);
  }
  await next();
};

// Log Admin Activity
export async function logAdminActivity(
  db: D1Database,
  adminId: string,
  action: string,
  resourceType: string,
  resourceId?: string | null,
  details?: Record<string, any>
): Promise<void> {
  try {
    const id = generateUUID();
    await db
      .prepare(
        'INSERT INTO activity_logs (id, admin_id, action, resource_type, resource_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        adminId,
        action,
        resourceType,
        resourceId || null,
        details ? JSON.stringify(details) : null,
        Date.now()
      )
      .run();
  } catch (err) {
    console.error('Failed to log admin activity', err);
  }
}
