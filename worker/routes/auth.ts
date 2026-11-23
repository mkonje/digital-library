// worker/routes/auth.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { Env, User, Session } from '../types';
import {
  generateUUID,
  generateSessionId,
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  SESSION_DURATION_MS,
  requireAuth,
} from '../auth';

const authApp = new Hono<{ Bindings: Env; Variables: { user?: User; session?: Session } }>();

const registerSchema = z.object({
  email: z.string().email('Barua pepe si sahihi'),
  password: z.string().min(6, 'Nenosiri lazima liwe na herufi zisizopungua 6'),
  fullName: z.string().min(2, 'Jina kamili linahitajika'),
});

const loginSchema = z.object({
  email: z.string().min(1, 'Barua pepe au jina la mtumiaji linahitajika'),
  password: z.string().min(1, 'Nenosiri linahitajika'),
});

// REGISTER
authApp.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message }, 400);
    }

    const { email, password, fullName } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(normalizedEmail)
      .first<{ id: string }>();

    if (existing) {
      return c.json({ error: 'Akaunti yenye barua pepe hii tayari ipo' }, 409);
    }

    const userId = generateUUID();
    const hashedPassword = await hashPassword(password);
    const now = Date.now();

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, full_name, role, status, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, "user", "active", 0, ?, ?)'
    )
      .bind(userId, normalizedEmail, hashedPassword, fullName.trim(), now, now)
      .run();

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = now + SESSION_DURATION_MS;
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(sessionId, userId, expiresAt, now)
      .run();

    setSessionCookie(c, sessionId);

    const newUser: Partial<User> = {
      id: userId,
      email: normalizedEmail,
      full_name: fullName.trim(),
      role: 'user',
      status: 'active',
      email_verified: 0,
      created_at: now,
    };

    return c.json({ success: true, user: newUser });
  } catch (err: any) {
    return c.json({ error: 'Hitilafu imetokea wakati wa usajili: ' + (err.message || 'Unknown') }, 500);
  }
});

// LOGIN
authApp.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message }, 400);
    }

    const { email, password } = parsed.data;
    const identifier = email.trim().toLowerCase();
    const now = Date.now();

    // Check Environment Admin Credentials (e.g., ADMIN_USERNAME=choro)
    const adminUser = c.env.ADMIN_USERNAME?.toLowerCase() || 'choro';
    const adminPass = c.env.ADMIN_PASSWORD;

    if (
      adminPass &&
      (identifier === adminUser || identifier === `${adminUser}@maktabayetu.co.tz`) &&
      password === adminPass
    ) {
      // Find or create admin in D1
      let adminRecord = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? OR full_name = ?')
        .bind(`${adminUser}@maktabayetu.co.tz`, adminUser)
        .first<User>();

      let adminId: string;
      if (!adminRecord) {
        adminId = generateUUID();
        const hashedAdminPass = await hashPassword(adminPass);
        await c.env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, full_name, role, status, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, "admin", "active", 1, ?, ?)'
        )
          .bind(adminId, `${adminUser}@maktabayetu.co.tz`, hashedAdminPass, adminUser, now, now)
          .run();
      } else {
        adminId = adminRecord.id;
      }

      const sessionId = generateSessionId();
      const expiresAt = now + SESSION_DURATION_MS;
      await c.env.DB.prepare(
        'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
      )
        .bind(sessionId, adminId, expiresAt, now)
        .run();

      setSessionCookie(c, sessionId);

      return c.json({
        success: true,
        user: {
          id: adminId,
          email: `${adminUser}@maktabayetu.co.tz`,
          full_name: adminUser,
          role: 'admin',
          status: 'active',
        },
      });
    }

    // Standard User Database Lookup
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? OR full_name = ?'
    )
      .bind(identifier, identifier)
      .first<User>();

    if (!user) {
      return c.json({ error: 'Barua pepe au nenosiri si sahihi' }, 401);
    }

    if (user.status === 'suspended') {
      return c.json({ error: 'Akaunti yako imesimamishwa. Wasiliana na msimamizi.' }, 403);
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Barua pepe au nenosiri si sahihi' }, 401);
    }

    // Create new session
    const sessionId = generateSessionId();
    const expiresAt = now + SESSION_DURATION_MS;
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(sessionId, user.id, expiresAt, now)
      .run();

    setSessionCookie(c, sessionId);

    const { password_hash, ...safeUser } = user;
    return c.json({ success: true, user: safeUser });
  } catch (err: any) {
    return c.json({ error: 'Hitilafu wakati wa kuingia: ' + (err.message || 'Unknown') }, 500);
  }
});

// LOGOUT
authApp.post('/logout', async (c) => {
  const session = c.get('session');
  if (session) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(session.id).run();
  }
  clearSessionCookie(c);
  return c.json({ success: true, message: 'Umetoka kwa mafanikio' });
});

// GET CURRENT USER (/me)
authApp.get('/me', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ user: null });
  }

  // Check active subscription
  const now = Date.now();
  const sub = await c.env.DB.prepare(
    `SELECT s.*, p.name as plan_name 
     FROM subscriptions s 
     JOIN subscription_plans p ON s.plan_id = p.id 
     WHERE s.user_id = ? AND s.status = 'active' AND s.end_date > ? 
     ORDER BY s.end_date DESC LIMIT 1`
  )
    .bind(user.id, now)
    .first<any>();

  const { password_hash, ...safeUser } = user;
  return c.json({
    user: safeUser,
    subscription: sub || null,
  });
});

// UPDATE PROFILE
authApp.put('/profile', requireAuth, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  const fullName = body.fullName?.trim();
  const avatarUrl = body.avatarUrl?.trim() || null;

  if (!fullName) {
    return c.json({ error: 'Jina linahitajika' }, 400);
  }

  const now = Date.now();
  await c.env.DB.prepare(
    'UPDATE users SET full_name = ?, avatar_url = ?, updated_at = ? WHERE id = ?'
  )
    .bind(fullName, avatarUrl, now, user.id)
    .run();

  return c.json({ success: true, message: 'Wasifu umesasishwa' });
});

// CHANGE PASSWORD
authApp.post('/change-password', requireAuth, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return c.json({ error: 'Nenosiri jipya lazima liwe na herufi zisizopungua 6' }, 400);
  }

  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    return c.json({ error: 'Nenosiri la sasa si sahihi' }, 401);
  }

  const newHash = await hashPassword(newPassword);
  const now = Date.now();
  await c.env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .bind(newHash, now, user.id)
    .run();

  return c.json({ success: true, message: 'Nenosiri limebadilishwa kwa mafanikio' });
});

// FORGOT PASSWORD ARCHITECTURE
authApp.post('/forgot-password', async (c) => {
  const body = await c.req.json();
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return c.json({ error: 'Barua pepe inahitajika' }, 400);
  }

  // Security best practice: don't disclose whether email exists
  return c.json({
    success: true,
    message: 'Ikiwa barua pepe hii imesajiliwa, maelekezo ya kuweka upya nenosiri yametumwa.',
  });
});

export default authApp;
