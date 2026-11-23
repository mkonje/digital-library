// worker/routes/payments.ts
import { Hono } from 'hono';
import { Env, User, PaymentTransaction } from '../types';
import { requireAuth, generateUUID } from '../auth';
import { SelcomPaymentProvider } from '../payments';

const paymentsApp = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// INITIATE DIRECT BOOK PURCHASE
paymentsApp.post('/purchase-book', requireAuth, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  const bookId = body.bookId;

  const book = await c.env.DB.prepare('SELECT id, title, price, is_premium FROM books WHERE id = ?')
    .bind(bookId)
    .first<{ id: string; title: string; price: number; is_premium: number }>();

  if (!book) {
    return c.json({ error: 'Kitabu hakikupatikana' }, 404);
  }

  if (book.is_premium === 0) {
    return c.json({ error: 'Kitabu hiki ni cha bure, hakihitaji ununuzi' }, 400);
  }

  const provider = new SelcomPaymentProvider(c.env);
  const result = await provider.initiatePayment({
    userId: user.id,
    itemType: 'book',
    itemId: book.id,
    amount: book.price,
    currency: 'TZS',
    buyerName: user.full_name,
    buyerEmail: user.email,
  });

  const txId = generateUUID();
  const now = Date.now();
  await c.env.DB.prepare(
    'INSERT INTO payment_transactions (id, user_id, reference, amount, currency, provider, item_type, item_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "selcom", "book", ?, ?, ?, ?)'
  )
    .bind(txId, user.id, result.reference, book.price, 'TZS', book.id, result.status, now, now)
    .run();

  return c.json(result);
});

// CHECK TRANSACTION STATUS
paymentsApp.get('/status/:reference', async (c) => {
  const reference = c.req.param('reference');
  const tx = await c.env.DB.prepare('SELECT * FROM payment_transactions WHERE reference = ?')
    .bind(reference)
    .first<PaymentTransaction>();

  if (!tx) {
    return c.json({ error: 'Muamala haukukutwa' }, 404);
  }

  return c.json({
    reference: tx.reference,
    status: tx.status,
    amount: tx.amount,
    currency: tx.currency,
    itemType: tx.item_type,
    updatedAt: tx.updated_at,
  });
});

// SELCOM WEBHOOK HANDLER
paymentsApp.post('/webhook', async (c) => {
  try {
    const payload = await c.req.json();
    const provider = new SelcomPaymentProvider(c.env);
    const verification = await provider.verifyWebhook(c.req.raw.headers, payload);

    if (!verification.valid) {
      return c.json({ error: 'Sahihi ya webhook haijathibitishwa (Invalid signature)' }, 400);
    }

    const tx = await c.env.DB.prepare('SELECT * FROM payment_transactions WHERE reference = ?')
      .bind(verification.reference)
      .first<PaymentTransaction>();

    if (!tx) {
      return c.json({ error: 'Muamala haukukutwa' }, 404);
    }

    // Idempotency check: don't process already successful transactions twice
    if (tx.status === 'successful') {
      return c.json({ success: true, message: 'Already processed' });
    }

    const now = Date.now();
    await c.env.DB.prepare(
      'UPDATE payment_transactions SET status = ?, updated_at = ? WHERE id = ?'
    )
      .bind(verification.status, now, tx.id)
      .run();

    if (verification.status === 'successful') {
      if (tx.item_type === 'book') {
        // Grant book purchase
        const purchaseId = generateUUID();
        await c.env.DB.prepare(
          'INSERT INTO purchases (id, user_id, book_id, amount, currency, payment_reference, status, created_at) VALUES (?, ?, ?, ?, ?, ?, "completed", ?)'
        )
          .bind(purchaseId, tx.user_id, tx.item_id, tx.amount, tx.currency, tx.reference, now)
          .run();
      } else if (tx.item_type === 'subscription') {
        // Activate subscription
        const plan = await c.env.DB.prepare('SELECT * FROM subscription_plans WHERE id = ?')
          .bind(tx.item_id)
          .first<{ id: string; duration_days: number }>();

        const durationDays = plan?.duration_days || 30;
        const subId = generateUUID();
        const endDate = now + durationDays * 24 * 60 * 60 * 1000;

        await c.env.DB.prepare(
          'INSERT INTO subscriptions (id, user_id, plan_id, status, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, "active", ?, ?, ?, ?)'
        )
          .bind(subId, tx.user_id, tx.item_id, now, endDate, now, now)
          .run();
      }
    }

    return c.json({ success: true, reference: verification.reference, status: verification.status });
  } catch (err: any) {
    return c.json({ error: 'Webhook processing error: ' + (err.message || 'Unknown') }, 500);
  }
});

export default paymentsApp;
