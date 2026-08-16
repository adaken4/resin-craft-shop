# Architecture — ResinCraft Keyholder Showcase & Shop

## Overview
A full-stack single-repo e-commerce showcase hosted on **Vercel** where checkout triggers both a server-side order record and a pre-filled WhatsApp message. The system includes an interactive customer storefront and an authenticated **Admin Dashboard** for product management, real-time pricing patches, dynamic branding updates, order logs, and business analytics.

## System diagram (MVP_1 Vercel Full-Stack Architecture)

```
                     ┌──────────────────────────────────────────────┐
   Customer          │  Vercel Edge Network (CDN)                   │
   Smartphone / PC ──┼──▶ Storefront (`index.html`, `src/main.ts`)  │
                     │  Admin Portal (`admin.html`, `src/admin.ts`) │
                     └───────────────────────┬──────────────────────┘
                                             │
                                             ▼
                     ┌──────────────────────────────────────────────┐
                     │  Vercel Serverless Functions (`/api/*`)       │
                     │  • /api/products  (CRUD, price patch)        │
                     │  • /api/settings  (Dynamic branding)         │
                     │  • /api/orders    (Order logging)            │
                     │  • /api/analytics (Sales & route metrics)    │
                     │  • /api/auth      (JWT session auth)         │
                     │  • /api/uploads   (Image processing)         │
                     └───────────────┬──────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         Neon Serverless PostgreSQL           Cloudinary Media Storage
         (Database: `resin_craft`)            (Keyholder photos & custom
         • products table                      emblem customer uploads)
         • orders table
         • site_settings table
                    │
                    ▼
         Browser opens wa.me deep link
         → Shop owner's WhatsApp
```

## Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend Storefront & Admin | Vite, TypeScript, Tailwind CSS | High performance, zero bloat, instant mobile load times |
| Serverless API | Vercel Serverless Functions (Node/TypeScript) | Single-repo, zero-config deployment on `git push`, auto-scaling |
| Database | Neon Serverless PostgreSQL (`resin_craft`) | Branching, scale-to-zero serverless PostgreSQL with sub-10ms queries |
| Media Storage | Cloudinary | Auto-format, responsive delivery, on-the-fly resizing & EXIF strip |
| Auth & Security | Signed JWT (`jose`) + Admin Passcode | Mobile-friendly session tokens, input sanitization, debounced queries |

## Data Model (PostgreSQL)
```sql
-- Products Table
CREATE TABLE products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_kes NUMERIC(10, 2) NOT NULL DEFAULT 450,
  photo_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tag VARCHAR(50) DEFAULT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'keyholder',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  price_kes NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  custom_image_url TEXT DEFAULT NULL,
  department VARCHAR(100) NOT NULL,
  bus_route VARCHAR(100) NOT NULL,
  pickup_spot VARCHAR(100) NOT NULL,
  buyer_name VARCHAR(150) NOT NULL,
  note TEXT DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site Settings & Branding
CREATE TABLE site_settings (
  key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Security & Reliability Notes
- **Defensive Input Handling**: Server-side payload validation for all numeric fields (preventing negative or zero quantities/prices) and sanitization of text inputs.
- **Client Debouncing**: Search queries, price edits, and form inputs are debounced to prevent unnecessary network spam.
- **Graceful Offline/Network Degradation**: Storefront loads embedded seed fallback if database connection times out.
