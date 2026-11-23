// worker/routes/subscriptions.ts
import { Hono } from 'hono';
import { Env, User, SubscriptionPlan } from '../types';
import { requireAuth, generateUUID } from '../auth';
import { SelcomPaymentProvider } from '../payments';

const subscriptionsApp = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// GET ALL ACTIVE SUBSCRIPTION PLANS
subscriptionsApp.get('/plans', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price ASC'
  ).all<SubscriptionPlan>();

  const plans = (result.results || []).map((p) => {
    let featuresArray = [];
    try {
      featuresArray = JSON.parse(p.features);
    } catch {
      featuresArray = [p.features];
    }
    return {
      ...p,
      features: featuresArray,
    };
  });

  return c.json({ plans });
});

// SUBSCRIBE TO A PLAN (INITIATE PAYMENT)
subscriptionsApp.post('/subscribe', requireAuth, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  const planId = body.planId;

  const plan = await c.env.DB.prepare('SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1')
    .bind(planId)
    .first<SubscriptionPlan>();

  if (!plan) {
    return c.json({ error: 'Kifurushi hakikupatikana' }, 404);
  }

  const provider = new SelcomPaymentProvider(c.env);
  const result = await provider.initiatePayment({
    userId: user.id,
    itemType: 'subscription',
    itemId: plan.id,
    amount: plan.price,
    currency: plan.currency,
    buyerName: user.full_name,
    buyerEmail: user.email,
  });

  // Record transaction in D1
  const txId = generateUUID();
  const now = Date.now();
  await c.env.DB.prepare(
    'INSERT INTO payment_transactions (id, user_id, reference, amount, currency, provider, item_type, item_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "selcom", "subscription", ?, ?, ?, ?)'
  )
    .bind(txId, user.id, result.reference, plan.price, plan.currency, plan.id, result.status, now, now)
    .run();

  return c.json(result);
});

export default subscriptionsApp;
