# MaktabaYetu — Complete Digital Library Platform

**MaktabaYetu** is a modern, production-minded digital library platform designed to empower readers, students, educators, and researchers to discover, read, and download digital books, stories, educational materials (O-Level, A-Level), technology texts, and manuals.

The user interface draws inspiration from modern, editorial, clean web aesthetics (such as [getartcraft.com](https://getartcraft.com/)), featuring warm off-white tones, crisp typography, generous whitespace, dark charcoal text, warm amber accents, subtle animations, and full dark mode support.

---

## 1. Architecture Overview

MaktabaYetu is engineered specifically for the **Cloudflare Native Stack**:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router 6, PDF.js (`pdfjs-dist`).
- **Backend API**: Cloudflare Workers running the [Hono](https://hono.dev/) framework in TypeScript.
- **Database**: Cloudflare D1 SQL database (`digital-library-db`, ID: `843c7b61-fba1-4c70-b174-f76786d8b80c`) with version-controlled SQL migrations, prepared statements, and foreign key relations.
- **File Storage**: Cloudflare R2 bucket (`digital-library`, binding `BOOKS_BUCKET`) for streaming books, cover images, and editorial media without exposing cloud credentials to the client.
- **PDF Reader**: In-browser PDF.js rendering with zoom, fit page/width, fullscreen, dark reader background, keyboard shortcuts, page tracking, and strict server-side entitlement checks.
- **Authentication & Security**: PBKDF2 password hashing with 100,000 iterations via Web Crypto API, HTTP-only secure cookie session management, RBAC (`guest`, `user`, `admin`), anonymized IP download logs, and Cloudflare Turnstile anti-bot protection readiness.
- **Payments**: Modular payment architecture pre-configured for the **Selcom Payment Gateway** (Masterpass QR, M-Pesa, Tigo Pesa, Airtel Money) with webhook signatures and idempotency verification.
- **Languages**: Native Kiswahili as primary language with dynamic toggle for English.

---

## 2. Project Directory Structure

```
maktabayetu/
├── migrations/
│   ├── 0001_initial_schema.sql       # Complete D1 SQL tables, constraints, indexes
│   └── 0002_seed_data.sql            # Default categories, plans, demo books, settings
├── worker/
│   ├── types.ts                      # Cloudflare Worker environment & model types
│   ├── auth.ts                       # PBKDF2 hashing, session cookies, auth middleware
│   ├── r2.ts                         # Cloudflare R2 bucket uploads, downloads, PDF generator
│   ├── payments.ts                   # Modular Selcom payment provider & entitlement checks
│   ├── routes/
│   │   ├── auth.ts                   # /api/auth (register, login, logout, me, profile)
│   │   ├── books.ts                  # /api/books (catalogue, search, filters, details)
│   │   ├── categories.ts             # /api/categories (active categories with counts)
│   │   ├── reader.ts                 # /api/read (secure PDF file streaming & metadata)
│   │   ├── downloads.ts              # /api/download (secure downloads with tracking)
│   │   ├── user.ts                   # /api/user (favorites, reading progress, history)
│   │   ├── news.ts                   # /api/news (editorial articles & announcements)
│   │   ├── subscriptions.ts          # /api/subscriptions (plans & checkout)
│   │   ├── payments.ts               # /api/payments (purchase & Selcom webhook)
│   │   └── admin.ts                  # /api/admin (stats, books CRUD, bulk upload, users, settings)
│   └── index.ts                      # Hono entry point & static asset binding
├── src/
│   ├── components/
│   │   ├── book/
│   │   │   ├── BookCard.tsx          # Editorial book card with spine effect
│   │   │   └── PremiumAccessModal.tsx# Premium gate popup
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Navigation, search bar, language, theme, user menu
│   │   │   ├── Footer.tsx            # Editorial footer with category & policy links
│   │   │   ├── Layout.tsx            # Public site layout container
│   │   │   └── AdminLayout.tsx       # Dedicated admin sidebar and portal layout
│   │   └── ui/                       # Reusable UI library (Button, Badge, Input, Modal, Skeleton, EmptyState)
│   ├── context/
│   │   ├── AuthContext.tsx           # Authentication & active session state
│   │   └── ThemeContext.tsx          # Light/Dark mode state
│   ├── i18n/
│   │   ├── sw.ts                     # Kiswahili dictionary (Primary)
│   │   ├── en.ts                     # English dictionary
│   │   └── index.tsx                 # LanguageProvider & useTranslation hook
│   ├── pages/
│   │   ├── Home.tsx                  # Editorial landing page
│   │   ├── Books.tsx                 # Comprehensive books catalogue with filters
│   │   ├── Categories.tsx            # Browse by categories
│   │   ├── BookDetail.tsx            # Book details, metadata, read/download actions
│   │   ├── PdfReader.tsx             # Professional in-browser PDF.js reader
│   │   ├── NewsList.tsx              # News and announcements
│   │   ├── NewsDetail.tsx            # Individual article page
│   │   ├── About.tsx                 # About the platform
│   │   ├── Terms.tsx                 # Terms of service
│   │   ├── Privacy.tsx               # Privacy policy
│   │   ├── auth/                     # Login, Register, Forgot Password
│   │   ├── user/Profile.tsx          # Personal library, favorites, progress, downloads
│   │   └── admin/                    # Admin portal pages:
│   │       ├── AdminDashboard.tsx    # Live KPIs, aggregations & charts
│   │       ├── AdminBooks.tsx        # Book metadata editor & management
│   │       ├── AdminUpload.tsx       # Multi-file drag & drop bulk upload
│   │       ├── AdminCategories.tsx   # Categories CRUD
│   │       ├── AdminUsers.tsx        # Users management & status toggle
│   │       ├── AdminSubscriptions.tsx# Plans & manual subscription grants
│   │       ├── AdminNews.tsx         # News & editorial publishing
│   │       ├── AdminAnalytics.tsx    # Real database analytics
│   │       ├── AdminDownloads.tsx    # Download audit logs
│   │       ├── AdminActivityLogs.tsx # Admin audit trail
│   │       └── AdminSettings.tsx     # Platform, Selcom & Turnstile settings
│   ├── App.tsx                       # React Router configuration
│   └── main.tsx                      # Application mounting
├── wrangler.jsonc                    # Cloudflare Worker configuration & D1/R2 bindings
├── tailwind.config.js                # Editorial design tokens & dark mode
├── vite.config.ts                    # Optimized bundling & vendor chunk splitting
├── .env.example                      # Environment variables reference
└── README.md                         # Project documentation
```

---

## 3. Environment Variables Reference

Copy `.env.example` to `.env` or set environment variables in Cloudflare dashboard / wrangler secrets:

```env
# Initial Admin Credentials (Seeded Administrator)
ADMIN_USERNAME=choro
ADMIN_PASSWORD=your_secure_admin_password_here

# Session Secret (For cryptographic token signing)
SESSION_SECRET=your_random_32_byte_secret_key

# Cloudflare D1 & R2
CLOUDFLARE_ACCOUNT_ID=791d3b9efcf2fe4c506b16a1087dc77f
D1_DATABASE_ID=843c7b61-fba1-4c70-b174-f76786d8b80c
R2_BUCKET_NAME=digital-library
R2_PUBLIC_BASE_URL=

# Selcom Payment Gateway (Modular Integration)
SELCOM_BASE_URL=https://api.selcompay.com/v1
SELCOM_VENDOR_ID=
SELCOM_API_KEY=
SELCOM_API_SECRET=

# Cloudflare Turnstile Anti-Bot
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

---

## 4. Local Development Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize Local D1 Database & Migrations
Wrangler maintains a local SQLite instance replicating D1:
```bash
npm run d1:migrate:local
```

### Step 3: Start the Backend & Worker Server
In one terminal window, run Wrangler dev:
```bash
npx wrangler dev
```
*(Runs on `http://localhost:8787`)*

### Step 4: Start the Frontend Vite Development Server
In another terminal window:
```bash
npm run dev
```
*(Runs on `http://localhost:3000` with automated proxy to `/api` on `localhost:8787`)*

---

## 5. Admin Portal Setup

1. **Initial Admin Credentials**:
   - The platform is pre-configured for the admin username: `choro`.
   - Set `ADMIN_PASSWORD` in your `.env` or via Wrangler secret (`npx wrangler secret put ADMIN_PASSWORD`).
2. **Accessing the Dashboard**:
   - Navigate to `/login`.
   - Enter `choro` (or `choro@maktabayetu.co.tz`) and your chosen `ADMIN_PASSWORD`.
   - The system automatically provisions the admin account in D1 and issues an HTTP-only administrative session cookie.
   - You will see the **Dashibodi ya Msimamizi** option in the account dropdown menu, linking to `/admin`.

---

## 6. Cloudflare Deployment Instructions

### Step 1: Run Remote Database Migrations
Apply version-controlled migrations to your live Cloudflare D1 database:
```bash
npm run d1:migrate:remote
```

### Step 2: Configure Production Secrets
Set your production admin password and session secret:
```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```
*(Optional: set `SELCOM_API_SECRET`, `TURNSTILE_SECRET_KEY`)*

### Step 3: Build & Deploy
Deploy the unified application (Vite SPA static assets + Cloudflare Worker backend API):
```bash
npm run worker:deploy
```
Cloudflare will upload your optimized SPA assets to Cloudflare Workers Assets and deploy the Hono API routing logic in seconds.

---

## 7. Security Architecture

1. **Password Storage**: Uses PBKDF2 with SHA-256 and 100,000 iterations + 16-byte cryptographically secure random salt using the native Web Crypto API. Passwords are never stored in plaintext.
2. **Session Security**: Sessions are stored in D1 and referenced through an `HttpOnly`, `SameSite=Lax`, `Secure` cookie named `maktaba_session`. Session tokens are never stored in `localStorage`.
3. **Private File Storage**: Cloudflare R2 bucket `digital-library` is not publicly open. All access to book files is routed through the `/api/read/:id/file` and `/api/download/:id` Worker endpoints.
4. **Server-Side Authorization**: Client-side entitlement flags are never trusted. Premium books require an active subscription record or verified purchase record verified on each byte stream.
5. **Download Privacy**: Client IP addresses are hashed using SHA-256 before storing in the download logs table.
6. **Audit Trail**: Every administrative action (book creation, editing, deletion, bulk uploads, user role change, and settings updates) is recorded in `activity_logs`.

---

## 8. Selcom Payment Gateway Readiness

A modular `SelcomPaymentProvider` class is implemented in `worker/payments.ts`.
- **Order Initiation**: Creates unique references (`MKT-...`), generates HMAC signatures, and creates pending records in `payment_transactions`.
- **Webhook Handling**: Validates callback payloads, checks for idempotency, updates status to `successful`, and automatically provisions book access or extends user subscription dates.
- When credentials are not yet configured, the system gracefully explains that Selcom integration is awaiting production keys, preventing fake checkouts while allowing admins to manually grant access from the dashboard.
