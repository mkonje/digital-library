// worker/routes/books.ts
import { Hono } from 'hono';
import { Env, User, Book } from '../types';
import { checkUserBookAccess } from '../payments';
import { generateUUID } from '../auth';

const booksApp = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// GET ALL BOOKS WITH ADVANCED FILTERING & PAGINATION
booksApp.get('/', async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '12', 10)));
    const offset = (page - 1) * limit;

    const categorySlug = c.req.query('category');
    const search = c.req.query('search')?.trim();
    const isPremium = c.req.query('is_premium');
    const language = c.req.query('language');
    const sort = c.req.query('sort') || 'newest';

    const conditions: string[] = ['b.is_published = 1'];
    const params: any[] = [];

    if (categorySlug && categorySlug !== 'all') {
      conditions.push('(c.slug = ? OR b.category_id = ?)');
      params.push(categorySlug, categorySlug);
    }

    if (search) {
      conditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (isPremium !== undefined && isPremium !== '') {
      conditions.push('b.is_premium = ?');
      params.push(parseInt(isPremium, 10));
    }

    if (language) {
      conditions.push('b.language = ?');
      params.push(language);
    }

    let orderBy = 'b.created_at DESC';
    if (sort === 'popular') {
      orderBy = '(b.reads_count + b.downloads_count) DESC';
    } else if (sort === 'reads') {
      orderBy = 'b.reads_count DESC';
    } else if (sort === 'downloads') {
      orderBy = 'b.downloads_count DESC';
    } else if (sort === 'title') {
      orderBy = 'b.title ASC';
    } else if (sort === 'rating') {
      orderBy = 'b.rating DESC';
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countSql = `
      SELECT COUNT(*) as total 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      ${whereClause}
    `;
    const countRes = await c.env.DB.prepare(countSql).bind(...params).first<{ total: number }>();
    const total = countRes?.total || 0;

    // Fetch records
    const selectSql = `
      SELECT b.*, c.name as category_name, c.slug as category_slug
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const books = await c.env.DB.prepare(selectSql)
      .bind(...params, limit, offset)
      .all<Book>();

    return c.json({
      books: books.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch books: ' + (err.message || 'Unknown') }, 500);
  }
});

// GET FEATURED BOOKS
booksApp.get('/featured', async (c) => {
  const books = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name, c.slug as category_slug
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     WHERE b.is_published = 1 AND b.is_featured = 1
     ORDER BY b.created_at DESC LIMIT 6`
  ).all<Book>();

  return c.json({ books: books.results || [] });
});

// GET POPULAR BOOKS
booksApp.get('/popular', async (c) => {
  const books = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name, c.slug as category_slug
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     WHERE b.is_published = 1 
     ORDER BY (b.reads_count + b.downloads_count) DESC LIMIT 8`
  ).all<Book>();

  return c.json({ books: books.results || [] });
});

// GET LATEST BOOKS
booksApp.get('/latest', async (c) => {
  const books = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name, c.slug as category_slug
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     WHERE b.is_published = 1 
     ORDER BY b.created_at DESC LIMIT 8`
  ).all<Book>();

  return c.json({ books: books.results || [] });
});

// GET BOOK BY SLUG
booksApp.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const user = c.get('user');

  const book = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name, c.slug as category_slug
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     WHERE b.slug = ? AND b.is_published = 1`
  )
    .bind(slug)
    .first<Book>();

  if (!book) {
    return c.json({ error: 'Kitabu hakikupatikana' }, 404);
  }

  // Record view asynchronously
  try {
    const viewId = generateUUID();
    await c.env.DB.prepare(
      'INSERT INTO book_views (id, book_id, user_id, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(viewId, book.id, user?.id || null, Date.now())
      .run();
  } catch {}

  // Check user entitlement
  const access = await checkUserBookAccess(c.env.DB, book.id, user);

  // Check if user favorited
  let isFavorite = false;
  let readingProgress = null;

  if (user) {
    const fav = await c.env.DB.prepare(
      'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?'
    )
      .bind(user.id, book.id)
      .first();
    isFavorite = Boolean(fav);

    readingProgress = await c.env.DB.prepare(
      'SELECT current_page, total_pages, progress_percent, last_read_at FROM reading_progress WHERE user_id = ? AND book_id = ?'
    )
      .bind(user.id, book.id)
      .first();
  }

  return c.json({
    book,
    access,
    isFavorite,
    readingProgress,
  });
});

// GET RELATED BOOKS
booksApp.get('/:id/related', async (c) => {
  const id = c.req.param('id');
  const current = await c.env.DB.prepare('SELECT category_id FROM books WHERE id = ?')
    .bind(id)
    .first<{ category_id: string }>();

  if (!current) {
    return c.json({ books: [] });
  }

  const related = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name, c.slug as category_slug
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     WHERE b.category_id = ? AND b.id != ? AND b.is_published = 1
     ORDER BY b.reads_count DESC LIMIT 4`
  )
    .bind(current.category_id, id)
    .all<Book>();

  return c.json({ books: related.results || [] });
});

export default booksApp;
