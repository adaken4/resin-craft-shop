import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db.js';
import { verifyAdminAuth } from './auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isAdmin = await verifyAdminAuth(req);
    if (!isAdmin) {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    // 1. Overall & 7-Day Revenue and Orders
    const overallStats = await query(`
      SELECT 
        COALESCE(SUM(price_kes * quantity), 0) AS total_revenue,
        COUNT(id) AS total_orders,
        COALESCE(SUM(quantity), 0) AS total_items_sold
      FROM orders
      WHERE status != 'cancelled'
    `);

    const weeklyStats = await query(`
      SELECT 
        COALESCE(SUM(price_kes * quantity), 0) AS weekly_revenue,
        COUNT(id) AS weekly_orders,
        COALESCE(SUM(quantity), 0) AS weekly_items_sold
      FROM orders
      WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '7 days'
    `);

    // 2. Best-Selling Products Ranking
    const topProducts = await query(`
      SELECT 
        product_name,
        COUNT(id) AS order_count,
        SUM(quantity) AS total_quantity,
        SUM(price_kes * quantity) AS total_sales_kes
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY product_name
      ORDER BY total_sales_kes DESC
      LIMIT 6
    `);

    // 3. Top Delivery Routes
    const topRoutes = await query(`
      SELECT 
        bus_route,
        COUNT(id) AS order_count,
        SUM(quantity) AS total_quantity
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY bus_route
      ORDER BY order_count DESC
      LIMIT 5
    `);

    // 4. Top Departments
    const topDepartments = await query(`
      SELECT 
        department,
        COUNT(id) AS order_count
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY department
      ORDER BY order_count DESC
      LIMIT 5
    `);

    // 5. Custom vs Ready-made Ratio
    const customRatio = await query(`
      SELECT 
        CASE WHEN custom_image_url IS NOT NULL THEN 'Custom Emblem' ELSE 'Ready-Made Design' END AS order_type,
        COUNT(id) AS count,
        SUM(price_kes * quantity) AS revenue
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY order_type
    `);

    // 6. Status Breakdown
    const statusBreakdown = await query(`
      SELECT 
        status,
        COUNT(id) AS count
      FROM orders
      GROUP BY status
    `);

    return res.status(200).json({
      success: true,
      analytics: {
        totalRevenueKES: Number(overallStats[0]?.total_revenue || 0),
        totalOrders: Number(overallStats[0]?.total_orders || 0),
        totalItemsSold: Number(overallStats[0]?.total_items_sold || 0),
        weeklyRevenueKES: Number(weeklyStats[0]?.weekly_revenue || 0),
        weeklyOrders: Number(weeklyStats[0]?.weekly_orders || 0),
        weeklyItemsSold: Number(weeklyStats[0]?.weekly_items_sold || 0),
        topProducts: topProducts.map((p: any) => ({
          productName: p.product_name,
          orderCount: Number(p.order_count),
          totalQuantity: Number(p.total_quantity),
          totalSalesKES: Number(p.total_sales_kes),
        })),
        topRoutes: topRoutes.map((r: any) => ({
          busRoute: r.bus_route,
          orderCount: Number(r.order_count),
          totalQuantity: Number(r.total_quantity),
        })),
        topDepartments: topDepartments.map((d: any) => ({
          department: d.department,
          orderCount: Number(d.order_count),
        })),
        customRatio: customRatio.map((c: any) => ({
          orderType: c.order_type,
          count: Number(c.count),
          revenue: Number(c.revenue),
        })),
        statusBreakdown: statusBreakdown.map((s: any) => ({
          status: s.status,
          count: Number(s.count),
        })),
      },
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
