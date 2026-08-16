# MVP_1 — Full-Stack Vercel Architecture (TypeScript + Neon + Cloudinary + Admin & Analytics)

## Precondition
MVP_0 storefront is live on Vercel (`resin-craft-shop.vercel.app`) and verified.
Client/artisan feedback requested admin capabilities for product management, price editing, branding updates, and order visibility.

## Problems MVP_1 Solves
1. **Dynamic Catalog & Product Management**: Shop owner can add keyholders, patch prices, edit descriptions, and toggle stock without modifying code or redeploying.
2. **Branding Flexibility**: Shop name, tagline, WhatsApp number, and announcement banners are editable live from the Admin dashboard.
3. **Durable Order Logging**: Orders are logged in Neon PostgreSQL before handing off to WhatsApp, creating a permanent sellable record.
4. **Business Analytics**: Provides the shop owner with actionable metrics on weekly sales revenue, best-selling keyholders, popular bus routes/departments, and custom vs ready-made ratios.
5. **Secure Admin Authentication**: Simple, mobile-friendly passcode/JWT session authentication for the artisan on his phone.

## Tech Stack
- **Hosting & Compute**: Vercel (Edge CDN for Vite frontend + Serverless Functions for `/api/*`)
- **Database**: Neon Serverless PostgreSQL (`resin_craft` project, `@neondatabase/serverless`)
- **Image Storage**: Cloudinary (unsigned/signed presets with EXIF stripping and auto-optimization)
- **Frontend**: Vite + TypeScript + Tailwind CSS (Multi-page: Storefront & Admin Dashboard)

---

## API Endpoints

### 1. Products Management
- **`GET /api/products`**  
  Public catalog list (returns active products for storefront, or all products including drafts if authenticated as admin).
- **`POST /api/products`** *(Admin Only)*  
  Create a new keyholder product (`id`, `name`, `price_kes`, `photo_url`, `description`, `tag`, `category`).
- **`PUT /api/products`** *(Admin Only)*  
  Update an existing product (pricing patch, description, active status toggle, image update).
- **`DELETE /api/products`** *(Admin Only)*  
  Delete or archive a product.

### 2. Branding & Site Settings
- **`GET /api/settings`**  
  Fetch public store configuration (`shop_name`, `tagline`, `whatsapp_number`, `hero_badge`, `custom_price_kes`).
- **`PUT /api/settings`** *(Admin Only)*  
  Update shop brand name, WhatsApp order number, announcements, and pricing defaults.

### 3. Orders & Order Tracking
- **`POST /api/orders`**  
  Persists customer order into Neon database (`product_id`, `product_name`, `price_kes`, `quantity`, `custom_image_url`, `department`, `bus_route`, `pickup_spot`, `buyer_name`, `note`, `status`).
- **`GET /api/orders`** *(Admin Only)*  
  List recent orders with status filtering (`pending`, `in_progress`, `ready`, `delivered`).
- **`PATCH /api/orders`** *(Admin Only)*  
  Update order fulfillment status.

### 4. Business Analytics
- **`GET /api/analytics`** *(Admin Only)*  
  Computes live metrics:
  - Total & weekly sales revenue (KES)
  - Total & weekly orders count
  - Top-selling keyholders ranking
  - Top delivery routes & departments
  - Custom emblem vs ready-made orders ratio
  - Order fulfillment funnel

### 5. Admin Authentication
- **`POST /api/auth/login`**  
  Validates admin passcode and issues a secure signed JWT session token.
- **`GET /api/auth/verify`**  
  Verifies existing JWT token validity.

---

## Admin Dashboard Capabilities (`admin.html`)
1. **Overview & Analytics**: Live revenue counters, best-sellers, and delivery route heatmaps.
2. **Product Catalog**: Visual grid with live inline price editing, stock status toggling, and a **"+ Add Keyholder"** modal with photo upload.
3. **Orders Log**: Tabular list of customer orders with live status management and one-click WhatsApp chat link to the customer.
4. **Store Settings**: Real-time branding editor (Shop Name, Hero Tagline, WhatsApp Number, Announcement Badge).

---

## Acceptance Checklist
- [ ] Storefront dynamically loads products and settings from Neon DB with fallback to static seed data.
- [ ] Admin can log in at `/admin.html` with the secure password.
- [ ] Admin can add, edit, and toggle active status on keyholder products.
- [ ] Admin can change shop branding and WhatsApp phone number.
- [ ] Every customer order is recorded in Neon DB and continues seamlessly to WhatsApp.
- [ ] Analytics tab displays sales revenue, top products, and route breakdowns.
- [ ] Fully responsive and optimized for mobile smartphone use by the shop owner.
