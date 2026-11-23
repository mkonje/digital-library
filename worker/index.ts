// worker/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env, User, Session } from './types';
import { authMiddleware } from './auth';

import authApp from './routes/auth';
import booksApp from './routes/books';
import categoriesApp from './routes/categories';
import newsApp from './routes/news';
import userApp from './routes/user';
import readerApp from './routes/reader';
import downloadsApp from './routes/downloads';
import subscriptionsApp from './routes/subscriptions';
import paymentsApp from './routes/payments';
import adminApp from './routes/admin';

const app = new Hono<{ Bindings: Env; Variables: { user?: User; session?: Session } }>();

// Logging & CORS
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Global Authentication Context
app.use('/api/*', authMiddleware);

// API Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'MaktabaYetu Digital Library API',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

// Mount Routes
app.route('/api/auth', authApp);
app.route('/api/books', booksApp);
app.route('/api/categories', categoriesApp);
app.route('/api/news', newsApp);
app.route('/api/user', userApp);
app.route('/api/read', readerApp);
app.route('/api/download', downloadsApp);
app.route('/api/subscriptions', subscriptionsApp);
app.route('/api/payments', paymentsApp);
app.route('/api/admin', adminApp);

// Global 404 for API
app.all('/api/*', (c) => {
  return c.json({ error: 'Njia haijulikani (API endpoint not found)' }, 404);
});

// Static Assets Fallback (Cloudflare Workers Assets for Frontend SPA)
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status === 404 && !c.req.path.includes('.')) {
      const indexUrl = new URL('/', c.req.url);
      const indexReq = new Request(indexUrl.toString(), c.req.raw);
      return await c.env.ASSETS.fetch(indexReq);
    }
    return res;
  }
  return c.text('MaktabaYetu API Server. Run Vite frontend for UI.', 200);
});

export default app;
