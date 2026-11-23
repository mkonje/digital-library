// worker/routes/reader.ts
import { Hono } from 'hono';
import { Env, User, Book } from '../types';
import { checkUserBookAccess } from '../payments';
import { generateSamplePDF } from '../r2';

const readerApp = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// GET BOOK READER METADATA
readerApp.get('/:bookId/info', async (c) => {
  const bookId = c.req.param('bookId');
  const user = c.get('user');

  const book = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name 
     FROM books b 
     LEFT JOIN categories c ON b.category_id = c.id 
     WHERE b.id = ?`
  )
    .bind(bookId)
    .first<Book>();

  if (!book) {
    return c.json({ error: 'Kitabu hakikupatikana' }, 404);
  }

  const access = await checkUserBookAccess(c.env.DB, book.id, user);

  let readingProgress = null;
  if (user) {
    readingProgress = await c.env.DB.prepare(
      'SELECT current_page, total_pages, progress_percent FROM reading_progress WHERE user_id = ? AND book_id = ?'
    )
      .bind(user.id, book.id)
      .first();
  }

  return c.json({
    book: {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      category: (book as any).category_name,
      is_premium: book.is_premium,
      cover_url: book.cover_url,
    },
    access,
    readingProgress,
  });
});

// STREAM SECURE PDF FOR ONLINE READER
readerApp.get('/:bookId/file', async (c) => {
  const bookId = c.req.param('bookId');
  const user = c.get('user');

  const book = await c.env.DB.prepare('SELECT * FROM books WHERE id = ?')
    .bind(bookId)
    .first<Book>();

  if (!book) {
    return c.json({ error: 'Kitabu hakikupatikana' }, 404);
  }

  // Strict Server-Side Access Control Check
  const access = await checkUserBookAccess(c.env.DB, book.id, user);
  if (!access.allowed) {
    return c.json(
      {
        error: access.reason,
        code: 'ACCESS_DENIED',
        is_premium: book.is_premium,
        price: book.price,
      },
      403
    );
  }

  // Increment reads count
  try {
    await c.env.DB.prepare('UPDATE books SET reads_count = reads_count + 1 WHERE id = ?')
      .bind(book.id)
      .run();
  } catch {}

  // Fetch from R2 Storage
  let pdfBytes: Uint8Array | null = null;
  let r2Stream: ReadableStream | null = null;

  if (c.env.BOOKS_BUCKET && book.file_key && !book.file_key.startsWith('demo/')) {
    const object = await c.env.BOOKS_BUCKET.get(book.file_key);
    if (object) {
      r2Stream = object.body;
    }
  }

  // If file is demo content or bucket object is not yet populated
  if (!r2Stream) {
    pdfBytes = generateSamplePDF(book.title, book.author, book.category_id);
  }

  const cleanFilename = encodeURIComponent(
    book.title.replace(/[^a-zA-Z0-9_-]/g, '_')
  );

  return new Response(r2Stream || (pdfBytes ? (pdfBytes as unknown as BodyInit) : null), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${cleanFilename}.pdf"`,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});

export default readerApp;
