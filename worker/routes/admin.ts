// worker/routes/admin.ts
import { Hono } from 'hono';
import { Env, User, Book, Category, SubscriptionPlan } from '../types';
import { requireAdmin, generateUUID, logAdminActivity } from '../auth';
import { uploadToR2, deleteFromR2, sanitizeFileName } from '../r2';

const adminApp = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// All routes in /admin require Admin privileges
adminApp.use('*', requireAdmin);

// 1. DASHBOARD OVERVIEW & REAL STATISTICS
adminApp.get('/stats', async (c) => {
  const db = c.env.DB;
  const now = Date.now();

  const [
    booksCount,
    usersCount,
    downloadsCount,
    readsSum,
    storageSum,
    premiumCount,
    freeCount,
    activeSubsCount,
  ] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM books').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM downloads').first<{ count: number }>(),
    db.prepare('SELECT SUM(reads_count) as sum FROM books').first<{ sum: number | null }>(),
    db.prepare('SELECT SUM(file_size) as sum FROM books').first<{ sum: number | null }>(),
    db.prepare('SELECT COUNT(*) as count FROM books WHERE is_premium = 1').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM books WHERE is_premium = 0').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM subscriptions WHERE status = "active" AND end_date > ?').bind(now).first<{ count: number }>(),
  ]);

  const recentUploads = await db.prepare(
    `SELECT b.id, b.title, b.author, b.created_at, b.file_size, b.is_premium, c.name as category_name 
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     ORDER BY b.created_at DESC LIMIT 5`
  ).all();

  const recentActivity = await db.prepare(
    'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10'
  ).all();

  return c.json({
    stats: {
      totalBooks: booksCount?.count || 0,
      totalUsers: usersCount?.count || 0,
      totalDownloads: downloadsCount?.count || 0,
      totalReads: readsSum?.sum || 0,
      totalStorageBytes: storageSum?.sum || 0,
      premiumBooks: premiumCount?.count || 0,
      freeBooks: freeCount?.count || 0,
      activeSubscriptions: activeSubsCount?.count || 0,
    },
    recentUploads: recentUploads.results || [],
    recentActivity: recentActivity.results || [],
  });
});

// 2. ANALYTICS (REAL DATABASE AGGREGATIONS)
adminApp.get('/analytics', async (c) => {
  const db = c.env.DB;

  // Most popular books
  const topBooks = await db.prepare(
    `SELECT id, title, author, reads_count, downloads_count, (reads_count + downloads_count) as total_interactions
     FROM books 
     ORDER BY total_interactions DESC LIMIT 6`
  ).all();

  // Books per category
  const categoryStats = await db.prepare(
    `SELECT c.name, COUNT(b.id) as count
     FROM categories c 
     LEFT JOIN books b ON c.id = b.category_id
     GROUP BY c.id ORDER BY count DESC`
  ).all();

  // Recent 14 days download activity
  const recentDownloads = await db.prepare(
    `SELECT date(created_at / 1000, 'unixepoch') as day, COUNT(*) as count
     FROM downloads
     WHERE created_at > ?
     GROUP BY day ORDER BY day ASC`
  ).bind(Date.now() - 14 * 24 * 60 * 60 * 1000).all();

  // Recent 14 days user registration
  const recentRegistrations = await db.prepare(
    `SELECT date(created_at / 1000, 'unixepoch') as day, COUNT(*) as count
     FROM users
     WHERE created_at > ?
     GROUP BY day ORDER BY day ASC`
  ).bind(Date.now() - 14 * 24 * 60 * 60 * 1000).all();

  return c.json({
    topBooks: topBooks.results || [],
    categoryStats: categoryStats.results || [],
    downloadsOverTime: recentDownloads.results || [],
    registrationsOverTime: recentRegistrations.results || [],
  });
});

// 3. FILE UPLOAD (R2 INTEGRATION)
adminApp.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'book'; // 'book', 'cover', 'news'

    if (!file) {
      return c.json({ error: 'Faili halikuwasilishwa' }, 400);
    }

    const uniqueId = generateUUID();
    const cleanName = sanitizeFileName(file.name);
    let key = '';

    if (type === 'cover') {
      key = `covers/${uniqueId}/${cleanName}`;
    } else if (type === 'news') {
      key = `news/${uniqueId}/${cleanName}`;
    } else {
      key = `books/${uniqueId}/${cleanName}`;
    }

    const arrayBuffer = await file.arrayBuffer();

    if (c.env.BOOKS_BUCKET) {
      await uploadToR2(c.env.BOOKS_BUCKET, key, arrayBuffer, file.type, {
        originalName: file.name,
        uploadedBy: c.get('user')!.id,
      });
    }

    return c.json({
      success: true,
      fileKey: key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (err: any) {
    return c.json({ error: 'Upload failed: ' + (err.message || 'Unknown') }, 500);
  }
});

// 4. BOOKS MANAGEMENT
adminApp.get('/books', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
  const offset = (page - 1) * limit;
  const search = c.req.query('search')?.trim();
  const categoryId = c.req.query('category_id');

  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    conditions.push('b.category_id = ?');
    params.push(categoryId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM books b ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const books = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name 
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     ${where}
     ORDER BY b.created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(...params, limit, offset)
    .all<Book>();

  return c.json({
    books: books.results || [],
    pagination: {
      page,
      limit,
      total: totalRes?.total || 0,
      totalPages: Math.ceil((totalRes?.total || 0) / limit),
    },
  });
});

// CREATE SINGLE BOOK
adminApp.post('/books', async (c) => {
  const admin = c.get('user')!;
  const body = await c.req.json();

  const id = generateUUID();
  const slug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + id.substring(0, 4);
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO books (
      id, title, slug, author, description, category_id, language, 
      publication_year, publisher, isbn, file_key, file_type, file_size, 
      cover_url, is_premium, price, is_featured, is_published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.title,
      slug,
      body.author,
      body.description || '',
      body.category_id,
      body.language || 'sw',
      body.publication_year || null,
      body.publisher || null,
      body.isbn || null,
      body.file_key,
      body.file_type || 'application/pdf',
      body.file_size || 0,
      body.cover_url || null,
      body.is_premium ? 1 : 0,
      body.price || 0.0,
      body.is_featured ? 1 : 0,
      body.is_published !== undefined ? (body.is_published ? 1 : 0) : 1,
      now,
      now
    )
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'CREATE_BOOK', 'book', id, { title: body.title });
  return c.json({ success: true, id, slug });
});

// BULK UPLOAD BOOKS
adminApp.post('/books/bulk', async (c) => {
  const admin = c.get('user')!;
  const body = await c.req.json();
  const items: any[] = body.items || [];

  if (!items.length) {
    return c.json({ error: 'Hakuna vitabu vilivyopokelewa' }, 400);
  }

  const createdIds: string[] = [];
  const now = Date.now();

  for (const item of items) {
    const id = generateUUID();
    const slug = (item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + id.substring(0, 4);

    await c.env.DB.prepare(
      `INSERT INTO books (
        id, title, slug, author, description, category_id, language, 
        file_key, file_type, file_size, cover_url, is_premium, price, 
        is_published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    )
      .bind(
        id,
        item.title,
        slug,
        item.author || 'Mwandishi Asiyejulikana',
        item.description || item.title,
        item.category_id,
        item.language || 'sw',
        item.file_key,
        item.file_type || 'application/pdf',
        item.file_size || 0,
        item.cover_url || null,
        item.is_premium ? 1 : 0,
        item.price || 0.0,
        now,
        now
      )
      .run();

    createdIds.push(id);
  }

  await logAdminActivity(c.env.DB, admin.id, 'BULK_UPLOAD_BOOKS', 'book', null, { count: createdIds.length });
  return c.json({ success: true, count: createdIds.length, ids: createdIds });
});

// UPDATE BOOK METADATA
adminApp.put('/books/:id', async (c) => {
  const admin = c.get('user')!;
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = Date.now();

  await c.env.DB.prepare(
    `UPDATE books SET 
      title = ?, author = ?, description = ?, category_id = ?, language = ?, 
      publication_year = ?, publisher = ?, isbn = ?, cover_url = ?, 
      is_premium = ?, price = ?, is_featured = ?, is_published = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      body.title,
      body.author,
      body.description,
      body.category_id,
      body.language || 'sw',
      body.publication_year || null,
      body.publisher || null,
      body.isbn || null,
      body.cover_url || null,
      body.is_premium ? 1 : 0,
      body.price || 0.0,
      body.is_featured ? 1 : 0,
      body.is_published ? 1 : 0,
      now,
      id
    )
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'UPDATE_BOOK', 'book', id, { title: body.title });
  return c.json({ success: true, message: 'Kitabu kimesasishwa' });
});

// DELETE BOOK
adminApp.delete('/books/:id', async (c) => {
  const admin = c.get('user')!;
  const id = c.req.param('id');

  const book = await c.env.DB.prepare('SELECT file_key FROM books WHERE id = ?').bind(id).first<Book>();
  if (book && book.file_key && c.env.BOOKS_BUCKET) {
    try {
      await deleteFromR2(c.env.BOOKS_BUCKET, book.file_key);
    } catch {}
  }

  await c.env.DB.prepare('DELETE FROM books WHERE id = ?').bind(id).run();
  await logAdminActivity(c.env.DB, admin.id, 'DELETE_BOOK', 'book', id);
  return c.json({ success: true, message: 'Kitabu kimefutwa' });
});

// 5. CATEGORIES MANAGEMENT
adminApp.get('/categories', async (c) => {
  const categories = await c.env.DB.prepare(
    `SELECT c.*, COUNT(b.id) as books_count
     FROM categories c
     LEFT JOIN books b ON c.id = b.category_id
     GROUP BY c.id ORDER BY c.sort_order ASC`
  ).all();

  return c.json({ categories: categories.results || [] });
});

adminApp.post('/categories', async (c) => {
  const admin = c.get('user')!;
  const body = await c.req.json();
  const id = 'cat_' + generateUUID().substring(0, 8);
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO categories (id, name, slug, description, icon, cover_url, sort_order, is_active, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.name,
      slug,
      body.description || null,
      body.icon || 'BookOpen',
      body.cover_url || null,
      body.sort_order || 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      now,
      now
    )
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'CREATE_CATEGORY', 'category', id, { name: body.name });
  return c.json({ success: true, id, slug });
});

adminApp.put('/categories/:id', async (c) => {
  const admin = c.get('user')!;
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = Date.now();

  await c.env.DB.prepare(
    `UPDATE categories SET 
      name = ?, slug = ?, description = ?, icon = ?, cover_url = ?, 
      sort_order = ?, is_active = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      body.name,
      body.slug,
      body.description || null,
      body.icon || 'BookOpen',
      body.cover_url || null,
      body.sort_order || 0,
      body.is_active ? 1 : 0,
      now,
      id
    )
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'UPDATE_CATEGORY', 'category', id, { name: body.name });
  return c.json({ success: true, message: 'Kategoria imesasishwa' });
});

adminApp.delete('/categories/:id', async (c) => {
  const admin = c.get('user')!;
  const id = c.req.param('id');

  const booksCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM books WHERE category_id = ?')
    .bind(id)
    .first<{ count: number }>();

  if (booksCount && booksCount.count > 0) {
    return c.json({ error: `Huwezi kufuta kategoria hii kwa sababu ina vitabu ${booksCount.count}. Hamisha vitabu kwanza.` }, 400);
  }

  await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  await logAdminActivity(c.env.DB, admin.id, 'DELETE_CATEGORY', 'category', id);
  return c.json({ success: true, message: 'Kategoria imefutwa' });
});

// 6. USERS MANAGEMENT
adminApp.get('/users', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
  const offset = (page - 1) * limit;
  const search = c.req.query('search')?.trim();

  let where = '';
  const params: any[] = [];
  if (search) {
    where = 'WHERE u.email LIKE ? OR u.full_name LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const total = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM users u ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const users = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.full_name, u.role, u.status, u.email_verified, u.created_at,
            (SELECT COUNT(*) FROM reading_progress WHERE user_id = u.id) as reads_count,
            (SELECT COUNT(*) FROM downloads WHERE user_id = u.id) as downloads_count,
            (SELECT COUNT(*) FROM subscriptions WHERE user_id = u.id AND status = 'active') as active_subs_count
     FROM users u
     ${where}
     ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    users: users.results || [],
    pagination: {
      page,
      limit,
      total: total?.count || 0,
      totalPages: Math.ceil((total?.count || 0) / limit),
    },
  });
});

adminApp.put('/users/:id/status', async (c) => {
  const admin = c.get('user')!;
  const id = c.req.param('id');
  const body = await c.req.json();
  const status = body.status === 'suspended' ? 'suspended' : 'active';

  await c.env.DB.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, Date.now(), id)
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'UPDATE_USER_STATUS', 'user', id, { status });
  return c.json({ success: true, status });
});

adminApp.put('/users/:id/role', async (c) => {
  const admin = c.get('user')!;
  const id = c.req.param('id');
  const body = await c.req.json();
  const role = body.role === 'admin' ? 'admin' : 'user';

  await c.env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
    .bind(role, Date.now(), id)
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'UPDATE_USER_ROLE', 'user', id, { role });
  return c.json({ success: true, role });
});

// 7. SUBSCRIPTIONS MANAGEMENT
adminApp.get('/subscriptions', async (c) => {
  const subs = await c.env.DB.prepare(
    `SELECT s.*, u.email as user_email, u.full_name as user_name, p.name as plan_name, p.price, p.currency
     FROM subscriptions s
     JOIN users u ON s.user_id = u.id
     JOIN subscription_plans p ON s.plan_id = p.id
     ORDER BY s.created_at DESC LIMIT 50`
  ).all();

  return c.json({ subscriptions: subs.results || [] });
});

adminApp.post('/subscriptions/grant', async (c) => {
  const admin = c.get('user')!;
  const body = await c.req.json();
  const { userId, planId, durationDays = 30 } = body;

  const user = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
  if (!user) return c.json({ error: 'Mtumiaji hakupatikana' }, 404);

  const subId = generateUUID();
  const now = Date.now();
  const endDate = now + durationDays * 24 * 60 * 60 * 1000;

  await c.env.DB.prepare(
    'INSERT INTO subscriptions (id, user_id, plan_id, status, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, "active", ?, ?, ?, ?)'
  )
    .bind(subId, userId, planId, now, endDate, now, now)
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'GRANT_SUBSCRIPTION', 'subscription', subId, { userId, planId, durationDays });
  return c.json({ success: true, id: subId, endDate });
});

// 8. NEWS MANAGEMENT
adminApp.get('/news', async (c) => {
  const news = await c.env.DB.prepare(
    `SELECT n.*, nc.name as category_name 
     FROM news n 
     LEFT JOIN news_categories nc ON n.category_id = nc.id 
     ORDER BY n.created_at DESC`
  ).all();

  return c.json({ news: news.results || [] });
});

adminApp.post('/news', async (c) => {
  const admin = c.get('user')!;
  const body = await c.req.json();
  const id = generateUUID();
  const slug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + id.substring(0, 4);
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO news (id, title, slug, summary, content, cover_url, category_id, author_name, is_featured, is_published, published_at, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.title,
      slug,
      body.summary,
      body.content,
      body.cover_url || null,
      body.category_id || null,
      body.author_name || admin.full_name,
      body.is_featured ? 1 : 0,
      body.is_published ? 1 : 0,
      body.is_published ? now : (body.published_at || now),
      now,
      now
    )
    .run();

  await logAdminActivity(c.env.DB, admin.id, 'CREATE_NEWS', 'news', id, { title: body.title });
  return c.json({ success: true, id, slug });
});

adminApp.delete('/news/:id', async (c) => {
  const admin = c.get('user')!;
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
  await logAdminActivity(c.env.DB, admin.id, 'DELETE_NEWS', 'news', id);
  return c.json({ success: true, message: 'Makala yamefutwa' });
});

// 9. DOWNLOAD AUDIT LOGS
adminApp.get('/downloads', async (c) => {
  const logs = await c.env.DB.prepare(
    `SELECT d.*, b.title as book_title, u.email as user_email
     FROM downloads d
     JOIN books b ON d.book_id = b.id
     LEFT JOIN users u ON d.user_id = u.id
     ORDER BY d.created_at DESC LIMIT 50`
  ).all();

  return c.json({ downloads: logs.results || [] });
});

// 10. ACTIVITY LOGS
adminApp.get('/activity-logs', async (c) => {
  const logs = await c.env.DB.prepare(
    `SELECT a.*, u.email as admin_email, u.full_name as admin_name
     FROM activity_logs a
     LEFT JOIN users u ON a.admin_id = u.id
     ORDER BY a.created_at DESC LIMIT 100`
  ).all();

  return c.json({ activityLogs: logs.results || [] });
});

// 11. PLATFORM SETTINGS
adminApp.get('/settings', async (c) => {
  const settings = await c.env.DB.prepare('SELECT * FROM settings').all();
  return c.json({ settings: settings.results || [] });
});

adminApp.put('/settings', async (c) => {
  const admin = c.get('user')!;
  const body = await c.req.json();
  const updates: Record<string, string> = body.settings || {};
  const now = Date.now();

  for (const [key, value] of Object.entries(updates)) {
    await c.env.DB.prepare(
      'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?'
    )
      .bind(key, String(value), now, String(value), now)
      .run();
  }

  await logAdminActivity(c.env.DB, admin.id, 'UPDATE_SETTINGS', 'settings', null, updates);
  return c.json({ success: true, message: 'Mipangilio imesasishwa' });
});

export default adminApp;
