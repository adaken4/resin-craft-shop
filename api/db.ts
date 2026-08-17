import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const sql = connectionString ? neon(connectionString) : null;

// Resilient In-Memory store for local offline dev / fallback
const memoryStore = {
  products: [
    {
      id: 'classic-car',
      name: 'Classic Car',
      price_kes: 450,
      photo_url: '/img/classic-car.jpg',
      description: 'Vintage automobile emblem encased in high-gloss dome resin with gold rim trim.',
      tag: 'Bestseller',
      category: 'keyholder',
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'geometric-gold',
      name: 'Geometric Gold',
      price_kes: 500,
      photo_url: '/img/geometric-gold.jpg',
      description: 'Intricate mandala geometric gold foil pattern embedded in crystal-clear resin.',
      tag: 'Popular',
      category: 'keyholder',
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'pressed-floral',
      name: 'Pressed Floral',
      price_kes: 450,
      photo_url: '/img/pressed-floral.jpg',
      description: 'Handcrafted miniature dried botanicals and gold leaf flakes preserved in glass dome.',
      tag: 'Artisanal',
      category: 'keyholder',
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'marble-initial',
      name: 'Marble Initial',
      price_kes: 550,
      photo_url: '/img/marble-initial.jpg',
      description: 'Custom gold monogram set on obsidian dark marble texture resin frame.',
      tag: 'Customizable',
      category: 'keyholder',
      is_active: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  orders: [
    {
      id: 'ord-sample-01',
      product_id: 'classic-car',
      product_name: 'Classic Car',
      price_kes: 450,
      quantity: 2,
      custom_image_url: null,
      department: 'IT & Digital Services',
      bus_route: 'Waiyaki Way / Westlands',
      pickup_spot: 'Main Reception',
      buyer_name: 'Sarah Mwangi',
      note: 'Please pack in gold pouch if available',
      status: 'in_progress',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'ord-sample-02',
      product_id: null,
      product_name: 'Custom Resin Emblem',
      price_kes: 500,
      quantity: 1,
      custom_image_url: '/img/geometric-gold.jpg',
      department: 'Finance & Operations',
      bus_route: 'Ngong Road / Karen',
      pickup_spot: 'Cafeteria Terrace',
      buyer_name: 'David Ochieng',
      note: 'Need it for tomorrow morning',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  settings: {
    shop_name: 'ResinCraft',
    tagline: 'Your emblem, sealed in pristine, hand-poured resin.',
    whatsapp_number: '254704513552',
    hero_badge: 'Nairobi Office & Route Express Delivery',
    custom_price_kes: '500',
  } as Record<string, string>,
};

let schemaInitialized = false;

/**
 * Ensures tables and seed data exist in the cloud database
 */
async function ensureSchema(): Promise<void> {
  if (schemaInitialized || !sql) return;
  try {
    // 1. Products Table
    await (sql as any)(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price_kes NUMERIC NOT NULL,
        photo_url TEXT NOT NULL,
        description TEXT,
        tag VARCHAR(100),
        category VARCHAR(100) DEFAULT 'keyholder',
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Orders Table
    await (sql as any)(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100),
        product_name VARCHAR(255) NOT NULL,
        price_kes NUMERIC NOT NULL,
        quantity INT DEFAULT 1,
        custom_image_url TEXT,
        department VARCHAR(255) NOT NULL,
        bus_route VARCHAR(255) NOT NULL,
        pickup_spot VARCHAR(255) NOT NULL,
        buyer_name VARCHAR(255) NOT NULL,
        note TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Site Settings Table
    await (sql as any)(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Seed initial products if table is empty
    const existing = (await (sql as any)('SELECT COUNT(id) as count FROM products')) as any[];
    if (Number(existing[0]?.count) === 0) {
      for (const p of memoryStore.products) {
        await (sql as any)(
          `INSERT INTO products (id, name, price_kes, photo_url, description, tag, category, is_active, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.price_kes, p.photo_url, p.description, p.tag, p.category, p.is_active, p.sort_order]
        );
      }
    }

    // Seed default settings if empty
    const existingSettings = (await (sql as any)('SELECT COUNT(key) as count FROM site_settings')) as any[];
    if (Number(existingSettings[0]?.count) === 0) {
      for (const [key, value] of Object.entries(memoryStore.settings)) {
        await (sql as any)(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
          [key, value]
        );
      }
    }

    schemaInitialized = true;
  } catch (err: any) {
    console.warn('Database schema auto-init note:', err.message);
  }
}

/**
 * Execute SQL queries with automatic fallback to memory store for resilience
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  if (!sql) {
    return handleMemoryFallback<T>(text, params);
  }

  try {
    await ensureSchema();
    const result = await Promise.race([
      params && params.length > 0 ? (sql as any)(text, params) : (sql as any)(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Neon query timeout')), 4500)),
    ]);
    return result as T[];
  } catch (error) {
    console.warn('Neon connection query error, using memory fallback:', (error as Error).message);
    return handleMemoryFallback<T>(text, params);
  }
}

function handleMemoryFallback<T>(text: string, params: any[]): T[] {
  const normalized = text.trim().toLowerCase();

  // 1. PRODUCTS
  if (normalized.startsWith('select') && normalized.includes('from products')) {
    if (normalized.includes('where is_active = true')) {
      return memoryStore.products.filter(p => p.is_active) as unknown as T[];
    }
    return memoryStore.products as unknown as T[];
  }

  if (normalized.startsWith('insert into products')) {
    const [id, name, price_kes, photo_url, description, tag, category, is_active, sort_order] = params;
    const newProd = {
      id,
      name,
      price_kes,
      photo_url,
      description,
      tag,
      category,
      is_active,
      sort_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.products.unshift(newProd);
    return [newProd] as unknown as T[];
  }

  if (normalized.startsWith('update products')) {
    const id = params[params.length - 1];
    const prod = memoryStore.products.find(p => p.id === id);
    if (prod) {
      if (params.length === 2) {
        // e.g. toggle active
        prod.is_active = params[0];
      } else {
        const [name, price_kes, photo_url, description, tag, category, is_active, sort_order] = params;
        prod.name = name;
        prod.price_kes = price_kes;
        prod.photo_url = photo_url;
        prod.description = description;
        prod.tag = tag;
        prod.category = category;
        prod.is_active = is_active;
        prod.sort_order = sort_order;
      }
      prod.updated_at = new Date().toISOString();
      return [prod] as unknown as T[];
    }
    return [] as unknown as T[];
  }

  if (normalized.startsWith('delete from products')) {
    const id = params[0];
    memoryStore.products = memoryStore.products.filter(p => p.id !== id);
    return [] as unknown as T[];
  }

  // 2. SETTINGS
  if (normalized.startsWith('select') && normalized.includes('from site_settings')) {
    const rows = Object.entries(memoryStore.settings).map(([key, value]) => ({ key, value }));
    return rows as unknown as T[];
  }

  if (normalized.includes('site_settings')) {
    const [key, value] = params;
    if (key && value !== undefined) {
      memoryStore.settings[key] = String(value);
    }
    return [] as unknown as T[];
  }

  // 3. ORDERS
  if (normalized.startsWith('insert into orders')) {
    const [product_id, product_name, price_kes, quantity, custom_image_url, department, bus_route, pickup_spot, buyer_name, note] = params;
    const newOrder = {
      id: `ord-${Date.now().toString(36)}`,
      product_id,
      product_name,
      price_kes,
      quantity,
      custom_image_url,
      department,
      bus_route,
      pickup_spot,
      buyer_name,
      note,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    memoryStore.orders.unshift(newOrder);
    return [{ id: newOrder.id, created_at: newOrder.created_at }] as unknown as T[];
  }

  if (normalized.startsWith('select') && normalized.includes('from orders')) {
    if (normalized.includes('where status = $1')) {
      const filterStatus = params[0];
      return memoryStore.orders.filter(o => o.status === filterStatus) as unknown as T[];
    }
    return memoryStore.orders as unknown as T[];
  }

  if (normalized.startsWith('update orders')) {
    const [status, id] = params;
    const order = memoryStore.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      return [order] as unknown as T[];
    }
    return [] as unknown as T[];
  }

  // 4. ANALYTICS AGGREGATIONS
  if (normalized.includes('sum(price_kes * quantity)') && normalized.includes('weekly_revenue')) {
    const weeklyOrders = memoryStore.orders.filter(o => o.status !== 'cancelled');
    const revenue = weeklyOrders.reduce((sum, o) => sum + (o.price_kes * o.quantity), 0);
    const qty = weeklyOrders.reduce((sum, o) => sum + o.quantity, 0);
    return [{ weekly_revenue: revenue, weekly_orders: weeklyOrders.length, weekly_items_sold: qty }] as unknown as T[];
  }

  if (normalized.includes('sum(price_kes * quantity)') && normalized.includes('total_revenue')) {
    const validOrders = memoryStore.orders.filter(o => o.status !== 'cancelled');
    const revenue = validOrders.reduce((sum, o) => sum + (o.price_kes * o.quantity), 0);
    const qty = validOrders.reduce((sum, o) => sum + o.quantity, 0);
    return [{ total_revenue: revenue, total_orders: validOrders.length, total_items_sold: qty }] as unknown as T[];
  }

  if (normalized.includes('group by product_name')) {
    const validOrders = memoryStore.orders.filter(o => o.status !== 'cancelled');
    const map: Record<string, { order_count: number; total_quantity: number; total_sales_kes: number }> = {};
    for (const o of validOrders) {
      if (!map[o.product_name]) {
        map[o.product_name] = { order_count: 0, total_quantity: 0, total_sales_kes: 0 };
      }
      map[o.product_name].order_count += 1;
      map[o.product_name].total_quantity += o.quantity;
      map[o.product_name].total_sales_kes += (o.price_kes * o.quantity);
    }
    return Object.entries(map).map(([product_name, data]) => ({ product_name, ...data })) as unknown as T[];
  }

  if (normalized.includes('group by bus_route')) {
    const validOrders = memoryStore.orders.filter(o => o.status !== 'cancelled');
    const map: Record<string, { order_count: number; total_quantity: number }> = {};
    for (const o of validOrders) {
      if (!map[o.bus_route]) map[o.bus_route] = { order_count: 0, total_quantity: 0 };
      map[o.bus_route].order_count += 1;
      map[o.bus_route].total_quantity += o.quantity;
    }
    return Object.entries(map).map(([bus_route, data]) => ({ bus_route, ...data })) as unknown as T[];
  }

  if (normalized.includes('group by department')) {
    const validOrders = memoryStore.orders.filter(o => o.status !== 'cancelled');
    const map: Record<string, number> = {};
    for (const o of validOrders) {
      map[o.department] = (map[o.department] || 0) + 1;
    }
    return Object.entries(map).map(([department, order_count]) => ({ department, order_count })) as unknown as T[];
  }

  if (normalized.includes('order_type')) {
    const validOrders = memoryStore.orders.filter(o => o.status !== 'cancelled');
    const custom = validOrders.filter(o => o.custom_image_url);
    const ready = validOrders.filter(o => !o.custom_image_url);
    return [
      { order_type: 'Custom Emblem', count: custom.length, revenue: custom.reduce((s, o) => s + o.price_kes * o.quantity, 0) },
      { order_type: 'Ready-Made Design', count: ready.length, revenue: ready.reduce((s, o) => s + o.price_kes * o.quantity, 0) },
    ] as unknown as T[];
  }

  return [] as unknown as T[];
}
