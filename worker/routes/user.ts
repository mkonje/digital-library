// worker/routes/user.ts
import { Hono } from 'hono';
import { Env, User, Book } from '../types';
import { requireAuth, generateUUID } from '../auth';

const userApp = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// All routes here require authentication
userApp.use('*', requireAuth);

// GET USER FAVORITES
userApp.get('/favorites', async (c) => {
  const user = c.get('user')!;
  const query = `
    SELECT b.*, c.name as category_name, c.slug as category_slug, f.created_at as favorited_at
    FROM favorites f
    JOIN books b ON f.book_id = b.id
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;
  const result = await c.env.DB.prepare(query).bind(user.id).all<Book & { favorited_at: number }>();
  return c.json({ favorites: result.results || [] });
});

// TOGGLE FAVORITE
userApp.post('/favorites/:bookId', async (c) => {
  const user = c.get('user')!;
  const bookId = c.req.param('bookId');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?'
  )
    .bind(user.id, bookId)
    .first<{ id: string }>();

  if (existing) {
    await c.env.DB.prepare('DELETE FROM favorites WHERE id = ?').bind(existing.id).run();
    return c.json({ isFavorite: false, message: 'Imeondolewa kwenye vipendwa' });
  } else {
    const id = generateUUID();
    await c.env.DB.prepare(
      'INSERT INTO favorites (id, user_id, book_id, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(id, user.id, bookId, Date.now())
      .run();
    return c.json({ isFavorite: true, message: 'Imeongezwa kwenye vipendwa' });
  }
});

// GET READING PROGRESS LIST
userApp.get('/reading-progress', async (c) => {
  const user = c.get('user')!;
  const query = `
    SELECT rp.*, b.title, b.slug, b.author, b.cover_url, b.is_premium, c.name as category_name
    FROM reading_progress rp
    JOIN books b ON rp.book_id = b.id
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE rp.user_id = ?
    ORDER BY rp.last_read_at DESC
  `;
  const result = await c.env.DB.prepare(query).bind(user.id).all();
  return c.json({ progress: result.results || [] });
});

// UPDATE READING PROGRESS
userApp.post('/reading-progress/:bookId', async (c) => {
  const user = c.get('user')!;
  const bookId = c.req.param('bookId');
  const body = await c.req.json();

  const currentPage = Math.max(1, parseInt(body.currentPage || '1', 10));
  const totalPages = Math.max(1, parseInt(body.totalPages || '1', 10));
  const progressPercent = Math.min(100, Math.round((currentPage / totalPages) * 100));
  const now = Date.now();

  const existing = await c.env.DB.prepare(
    'SELECT id FROM reading_progress WHERE user_id = ? AND book_id = ?'
  )
    .bind(user.id, bookId)
    .first<{ id: string }>();

  if (existing) {
    await c.env.DB.prepare(
      'UPDATE reading_progress SET current_page = ?, total_pages = ?, progress_percent = ?, last_read_at = ? WHERE id = ?'
    )
      .bind(currentPage, totalPages, progressPercent, now, existing.id)
      .run();
  } else {
    const id = generateUUID();
    await c.env.DB.prepare(
      'INSERT INTO reading_progress (id, user_id, book_id, current_page, total_pages, progress_percent, last_read_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(id, user.id, bookId, currentPage, totalPages, progressPercent, now)
      .run();
  }

  return c.json({ success: true, currentPage, totalPages, progressPercent });
});

// GET USER DOWNLOAD HISTORY
userApp.get('/downloads', async (c) => {
  const user = c.get('user')!;
  const query = `
    SELECT d.id as download_id, d.created_at as downloaded_at, b.id, b.title, b.slug, b.author, b.cover_url, b.file_size, c.name as category_name
    FROM downloads d
    JOIN books b ON d.book_id = b.id
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `;
  const result = await c.env.DB.prepare(query).bind(user.id).all();
  return c.json({ downloads: result.results || [] });
});

// GET USER SUBSCRIPTIONS & PURCHASES
userApp.get('/subscriptions', async (c) => {
  const user = c.get('user')!;
  const subscriptions = await c.env.DB.prepare(
    `SELECT s.*, p.name as plan_name, p.billing_interval, p.price, p.currency
     FROM subscriptions s
     JOIN subscription_plans p ON s.plan_id = p.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC`
  )
    .bind(user.id)
    .all();

  const purchases = await c.env.DB.prepare(
    `SELECT pur.*, b.title as book_title, b.slug as book_slug, b.cover_url
     FROM purchases pur
     JOIN books b ON pur.book_id = b.id
     WHERE pur.user_id = ?
     ORDER BY pur.created_at DESC`
  )
    .bind(user.id)
    .all();

  return c.json({
    subscriptions: subscriptions.results || [],
    purchases: purchases.results || [],
  });
});

export default userApp;
