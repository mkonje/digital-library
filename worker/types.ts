// worker/types.ts

export interface Env {
  DB: D1Database;
  BOOKS_BUCKET: R2Bucket;
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  SELCOM_BASE_URL?: string;
  SELCOM_VENDOR_ID?: string;
  SELCOM_API_KEY?: string;
  SELCOM_API_SECRET?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_BASE_URL?: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar_url: string | null;
  email_verified: number;
  created_at: number;
  updated_at: number;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
  created_at: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  cover_url: string | null;
  sort_order: number;
  is_active: number;
  created_at: number;
  updated_at: number;
  books_count?: number;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  language: string;
  publication_year: number | null;
  publisher: string | null;
  isbn: string | null;
  file_key: string;
  file_type: string;
  file_size: number;
  cover_url: string | null;
  is_premium: number;
  price: number;
  is_featured: number;
  is_published: number;
  reads_count: number;
  downloads_count: number;
  rating: number;
  created_at: number;
  updated_at: number;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  total_pages: number;
  progress_percent: number;
  last_read_at: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  billing_interval: 'monthly' | 'yearly';
  features: string;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name?: string;
  user_email?: string;
  user_name?: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  start_date: number;
  end_date: number;
  created_at: number;
  updated_at: number;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  reference: string;
  external_reference: string | null;
  amount: number;
  currency: string;
  provider: string;
  item_type: 'book' | 'subscription';
  item_id: string;
  status: 'initiated' | 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded';
  metadata: string | null;
  created_at: number;
  updated_at: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_url: string | null;
  category_id: string | null;
  category_name?: string;
  author_name: string;
  is_featured: number;
  is_published: number;
  published_at: number;
  created_at: number;
  updated_at: number;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string | null;
  created_at: number;
}
