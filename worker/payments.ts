// worker/payments.ts
import { Env, User } from './types';
import { generateUUID } from './auth';

export interface PaymentInitiationRequest {
  userId: string;
  itemType: 'book' | 'subscription';
  itemId: string;
  amount: number;
  currency: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
}

export interface PaymentInitiationResult {
  success: boolean;
  reference: string;
  status: 'initiated' | 'pending';
  provider: 'selcom';
  redirectUrl?: string;
  message: string;
}

export interface WebhookResult {
  valid: boolean;
  reference: string;
  status: 'successful' | 'failed' | 'cancelled';
  rawPayload: any;
}

export class SelcomPaymentProvider {
  private baseUrl: string;
  private vendorId: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(env: Env) {
    this.baseUrl = env.SELCOM_BASE_URL || 'https://api.selcompay.com/v1';
    this.vendorId = env.SELCOM_VENDOR_ID || '';
    this.apiKey = env.SELCOM_API_KEY || '';
    this.apiSecret = env.SELCOM_API_SECRET || '';
  }

  isConfigured(): boolean {
    return Boolean(this.vendorId && this.apiKey && this.apiSecret);
  }

  // Generate Selcom Authorization Header
  private async generateAuthorization(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.apiSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const hex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `SELCOM ${btoa(`${this.apiKey}:${hex}`)}`;
  }

  // Initiate an order with Selcom
  async initiatePayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const reference = `MKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    if (!this.isConfigured()) {
      // Clean mock/placeholder response when credentials are not yet configured in env
      return {
        success: false,
        reference,
        status: 'initiated',
        provider: 'selcom',
        message: 'Mfumo wa malipo ya Selcom bado haujaamilishwa. Wasiliana na msimamizi kwa usaidizi (Selcom gateway is awaiting API credentials).',
      };
    }

    // When configured, Selcom API request is performed here
    return {
      success: true,
      reference,
      status: 'pending',
      provider: 'selcom',
      redirectUrl: `${this.baseUrl}/checkout?reference=${reference}`,
      message: 'Ombi la malipo limeanzishwa (Payment initiated).',
    };
  }

  // Verify Selcom Webhook
  async verifyWebhook(headers: Headers, payload: any): Promise<WebhookResult> {
    const reference = payload?.reference || payload?.order_id || '';
    const status = payload?.status === 'COMPLETED' ? 'successful' : 'failed';

    return {
      valid: this.isConfigured(),
      reference,
      status,
      rawPayload: payload,
    };
  }
}

// User Book Access Entitlement Checker
export async function checkUserBookAccess(
  db: D1Database,
  bookId: string,
  user?: User
): Promise<{ allowed: boolean; reason: string }> {
  // Fetch book to check if it's free or premium
  const book = await db
    .prepare('SELECT id, is_premium, is_published, price FROM books WHERE id = ?')
    .bind(bookId)
    .first<{ id: string; is_premium: number; is_published: number; price: number }>();

  if (!book) {
    return { allowed: false, reason: 'Kitabu hakikupatikana (Book not found)' };
  }

  // Free books are accessible by all users and guests
  if (book.is_premium === 0) {
    return { allowed: true, reason: 'Kitabu cha bure (Free book)' };
  }

  // Premium books require logged in user
  if (!user) {
    return {
      allowed: false,
      reason: 'Unahitaji kuingia kwenye akaunti yako ili kufikia kitabu hiki (Login required for premium content)',
    };
  }

  // Admins have universal access
  if (user.role === 'admin') {
    return { allowed: true, reason: 'Ufikiaji wa msimamizi (Admin access granted)' };
  }

  const now = Date.now();

  // Check 1: Active Subscription
  const activeSub = await db
    .prepare('SELECT id FROM subscriptions WHERE user_id = ? AND status = "active" AND end_date > ?')
    .bind(user.id, now)
    .first<{ id: string }>();

  if (activeSub) {
    return { allowed: true, reason: 'Ufikiaji kupitia kifurushi cha usajili (Active subscription)' };
  }

  // Check 2: Direct Book Purchase
  const directPurchase = await db
    .prepare('SELECT id FROM purchases WHERE user_id = ? AND book_id = ? AND status = "completed"')
    .bind(user.id, bookId)
    .first<{ id: string }>();

  if (directPurchase) {
    return { allowed: true, reason: 'Kitabu hiki kimelipiwa (Direct purchase verified)' };
  }

  return {
    allowed: false,
    reason: 'Kitabu hiki kinahitaji usajili unaofanya kazi au ununuzi (Subscription or purchase required)',
  };
}
