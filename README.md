# MaktabaYetu — Digital Library Platform

**MaktabaYetu** is a modern digital library platform designed to make books, educational resources, stories, technology materials, and learning content accessible to readers, students, educators, and researchers.

The platform provides a digital reading experience with book discovery, PDF reading, downloads, user accounts, subscriptions, and an administrative portal.

---

## Features

### Reader Experience
- Browse and discover digital books.
- Search and filter books by category.
- View book details and metadata.
- Read PDF books directly in the browser.
- Download books based on access permissions.
- Track reading progress and maintain reading history.
- Save favorite books.
- Support for light and dark themes.
- Kiswahili and English language support.

### User Management
- User registration and authentication.
- Secure session management.
- Personal user profiles.
- Reading history and favorites.
- Subscription and premium access management.

### Administration
- Administrative dashboard and analytics.
- Book and category management.
- Bulk book uploads.
- User management.
- Subscription management.
- News and announcements publishing.
- Download activity monitoring.
- Administrative activity logs.
- Platform settings.

### Payment Architecture
- Modular Selcom payment gateway integration.
- Payment transaction management.
- Webhook signature verification.
- Idempotency checks.
- Support architecture for mobile money and other supported payment methods.

*Production payment processing requires valid gateway credentials and successful end-to-end testing.*

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide |
| Routing | React Router 6 |
| PDF Reader | PDF.js |
| Backend | Cloudflare Workers |
| API Framework | Hono |
| Database | Cloudflare D1 |
| File Storage | Cloudflare R2 |
| Deployment | Cloudflare Wrangler |
| Payments | Selcom integration architecture |

---

## Project Structure

```text
maktabayetu/
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_seed_data.sql
├── worker/
│   ├── routes/
│   │   ├── admin.ts
│   │   ├── books.ts
│   │   ├── categories.ts
│   │   ├── downloads.ts
│   │   ├── news.ts
│   │   ├── payments.ts
│   │   ├── reader.ts
│   │   ├── subscriptions.ts
│   │   └── user.ts
│   ├── auth.ts
│   ├── payments.ts
│   ├── r2.ts
│   ├── types.ts
│   └── index.ts
├── src/
│   ├── components/
│   │   ├── book/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/
│   ├── i18n/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   └── user/
│   ├── App.tsx
│   └── main.tsx
├── migrations/
├── public/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── wrangler.jsonc
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following tools:

- Node.js (LTS recommended).
- npm.
- Git.
- Cloudflare account (for deployment).
- Wrangler CLI (Cloudflare development and deployment tools).

### 1. Clone the Repository

```bash
git clone https://github.com/mkonje/digital-library.git
```

Navigate into the project:

```bash
cd digital-library
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create your local environment file using the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the required environment variables using your own credentials.

**Important security guidelines:**
- Never commit `.env` files.
- Never publish passwords, API keys, session secrets, or private credentials.
- Use Cloudflare Worker secrets for production credentials.
- Keep `.env.example` populated with placeholder values only.

### 4. Initialize the Local Database

Run the database migration script:

```bash
npm run d1:migrate:local
```

This initializes the local development database using the project's migration files.

### 5. Start the Backend

Open a terminal
