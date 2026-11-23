// worker/routes/downloads.ts
import { Hono } from 'hono';
import { Env, User, Book } from '../types';
import { checkUserBookAccess } from '../payments';
import { generateSamplePDF } from '../r2';
import { generateUUID } from '../auth';

const downloadsApp = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// SECURE FILE DOWNLOAD ENDPOINT
downloadsApp.get('/:bookId', async (c) => {
  const bookId = c.req.param('bookId');
  const user = c.get('user');

  const book = await c.env.DB.prepare('SELECT * FROM books WHERE id = ?')
    .bind(bookId)
    .first<Book>();

  if (!book) {
    return c.json({ error: 'Kitabu hakikupatikana' }, 404);
  }

  // Validate server-side access entitlement
  const access = await checkUserBookAccess(c.env.DB, book.id, user);
  if (!access.allowed) {
    return c.json(
      {
        error: access.reason,
        code: 'ACCESS_DENIED',
        is_premium: book.is_premium,
      },
      403
    );
  }

  // Record Download Event & Statistics
  try {
    const downloadId = generateUUID();
    const userAgent = c.req.header('User-Agent') || 'unknown';
    const clientIp = c.req.header('CF-Connecting-IP') || '0.0.0.0';

    // Hash client IP for privacy preservation
    const encoder = new TextEncoder();
    const ipHashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(clientIp));
    const ipHash = Array.from(new Uint8Array(ipHashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);

    await c.env.DB.prepare(
      'INSERT INTO downloads (id, user_id, book_id, ip_hash, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(downloadId, user?.id || null, book.id, ipHash, userAgent.substring(0, 200), Date.now())
      .run();

    await c.env.DB.prepare('UPDATE books SET downloads_count = downloads_count + 1 WHERE id = ?')
      .bind(book.id)
      .run();
  } catch (err) {
    console.error('Failed to log download', err);
  }

  // Retrieve file from R2 Bucket
  let pdfBytes: Uint8Array | null = null;
  let r2Stream: ReadableStream | null = null;

  if (c.env.BOOKS_BUCKET && book.file_key && !book.file_key.startsWith('demo/')) {
    const object = await c.env.BOOKS_BUCKET.get(book.file_key);
    if (object) {
      r2Stream = object.body;
    }
  }

  // If file is demo content
  if (!r2Stream) {
    pdfBytes = generateSamplePDF(book.title, book.author, book.category_id);
  }

  const cleanFilename = encodeURIComponent(
    book.title.replace(/[^a-zA-Z0-9_-]/g, '_')
  );

  return new Response(r2Stream || (pdfBytes ? (pdfBytes as unknown as BodyInit) : null), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cleanFilename}.pdf"`,
      'Cache-Control': 'private, no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});

export default downloadsApp;
