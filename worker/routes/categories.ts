// worker/routes/categories.ts
import { Hono } from 'hono';
import { Env, Category, Book } from '../types';

const categoriesApp = new Hono<{ Bindings: Env }>();

// GET ALL ACTIVE CATEGORIES WITH BOOK COUNTS
categoriesApp.get('/', async (c) => {
  const query = `
    SELECT c.*, COUNT(b.id) as books_count
    FROM categories c
    LEFT JOIN books b ON c.id = b.category_id AND b.is_published = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `;
  const result = await c.env.DB.prepare(query).all<Category>();
  return c.json({ categories: result.results || [] });
});

// GET CATEGORY DETAILS BY SLUG
categoriesApp.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const category = await c.env.DB.prepare(
    'SELECT * FROM categories WHERE slug = ? AND is_active = 1'
  )
    .bind(slug)
    .first<Category>();

  if (!category) {
    return c.json({ error: 'Kategoria haikupatikana' }, 404);
  }

  // Get books in this category
  const books = await c.env.DB.prepare(
    `SELECT b.*, c.name as category_name, c.slug as category_slug
     FROM books b 
     JOIN categories c ON b.category_id = c.id 
     WHERE b.category_id = ? AND b.is_published = 1
     ORDER BY b.created_at DESC`
  )
    .bind(category.id)
    .all<Book>();

  return c.json({
    category,
    books: books.results || [],
  });
});

export default categoriesApp;
