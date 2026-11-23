// worker/routes/news.ts
import { Hono } from 'hono';
import { Env, NewsArticle } from '../types';

const newsApp = new Hono<{ Bindings: Env }>();

// GET ALL PUBLISHED NEWS ARTICLES & CATEGORIES
newsApp.get('/', async (c) => {
  const categorySlug = c.req.query('category');
  const params: any[] = [];
  let filterSql = 'WHERE n.is_published = 1';

  if (categorySlug && categorySlug !== 'all') {
    filterSql += ' AND (nc.slug = ? OR n.category_id = ?)';
    params.push(categorySlug, categorySlug);
  }

  const articlesQuery = `
    SELECT n.*, nc.name as category_name, nc.slug as category_slug
    FROM news n
    LEFT JOIN news_categories nc ON n.category_id = nc.id
    ${filterSql}
    ORDER BY n.published_at DESC
  `;
  const articlesRes = await c.env.DB.prepare(articlesQuery).bind(...params).all<NewsArticle>();

  // Fetch news categories
  const categoriesRes = await c.env.DB.prepare('SELECT * FROM news_categories ORDER BY name ASC').all();

  // Find featured
  const featured = articlesRes.results?.find((a) => a.is_featured === 1) || articlesRes.results?.[0] || null;

  return c.json({
    articles: articlesRes.results || [],
    featured,
    categories: categoriesRes.results || [],
  });
});

// GET NEWS ARTICLE BY SLUG
newsApp.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const article = await c.env.DB.prepare(
    `SELECT n.*, nc.name as category_name, nc.slug as category_slug
     FROM news n
     LEFT JOIN news_categories nc ON n.category_id = nc.id
     WHERE n.slug = ? AND n.is_published = 1`
  )
    .bind(slug)
    .first<NewsArticle>();

  if (!article) {
    return c.json({ error: 'Makala hayakupatikana' }, 404);
  }

  // Get related news
  const related = await c.env.DB.prepare(
    `SELECT n.id, n.title, n.slug, n.summary, n.cover_url, n.published_at
     FROM news n
     WHERE n.id != ? AND n.is_published = 1
     ORDER BY n.published_at DESC LIMIT 3`
  )
    .bind(article.id)
    .all();

  return c.json({
    article,
    related: related.results || [],
  });
});

export default newsApp;
