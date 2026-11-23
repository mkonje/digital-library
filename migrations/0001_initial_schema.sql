-- 0001_initial_schema.sql
-- MaktabaYetu Digital Library D1 Database Schema

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended'
    avatar_url TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    cover_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Books
CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'sw', -- 'sw', 'en'
    publication_year INTEGER,
    publisher TEXT,
    isbn TEXT,
    file_key TEXT NOT NULL, -- R2 object key (books/{id}/{filename})
    file_type TEXT NOT NULL DEFAULT 'application/pdf',
    file_size INTEGER NOT NULL DEFAULT 0, -- bytes
    cover_url TEXT, -- R2 cover key or URL
    is_premium INTEGER NOT NULL DEFAULT 0, -- 0 = Free, 1 = Premium
    price REAL NOT NULL DEFAULT 0.0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    reads_count INTEGER NOT NULL DEFAULT 0,
    downloads_count INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 5.0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS book_categories (
    book_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS book_tags (
    book_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (book_id, tag_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- User Interactions
CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reading_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    current_page INTEGER NOT NULL DEFAULT 1,
    total_pages INTEGER NOT NULL DEFAULT 1,
    progress_percent REAL NOT NULL DEFAULT 0.0,
    last_read_at INTEGER NOT NULL,
    UNIQUE(user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS downloads (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    book_id TEXT NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_views (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    user_id TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Subscriptions & Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TZS',
    duration_days INTEGER NOT NULL DEFAULT 30,
    billing_interval TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
    features TEXT NOT NULL, -- JSON array of feature descriptions
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'suspended'
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

-- Individual Purchases
CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TZS',
    payment_reference TEXT,
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'refunded'
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT
);

-- Payment Transactions (Modular Selcom Integration)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    external_reference TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TZS',
    provider TEXT NOT NULL DEFAULT 'selcom',
    item_type TEXT NOT NULL, -- 'book', 'subscription'
    item_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated', 'pending', 'successful', 'failed', 'cancelled', 'refunded'
    metadata TEXT, -- JSON
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- News & Editorial Announcements
CREATE TABLE IF NOT EXISTS news_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_url TEXT,
    category_id TEXT,
    author_name TEXT NOT NULL DEFAULT 'MaktabaYetu Team',
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    published_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE SET NULL
);

-- Platform Settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    updated_at INTEGER NOT NULL
);

-- Administrative Audit Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    created_at INTEGER NOT NULL
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_published_premium ON books(is_published, is_premium);
CREATE INDEX IF NOT EXISTS idx_books_reads ON books(reads_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_downloads ON books(downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_created ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_downloads_book ON downloads(book_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
