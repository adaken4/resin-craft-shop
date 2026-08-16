import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';
import { verifyAdminAuth } from './auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ----------------------------------------------------
    // POST /api/orders (Public) - Log order to Neon DB
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const {
        productId,
        productName,
        priceKES,
        quantity,
        customImageUrl,
        department,
        busRoute,
        pickupSpot,
        buyerName,
        note,
      } = req.body || {};

      // Defensive Validation
      if (!buyerName || typeof buyerName !== 'string' || buyerName.trim().length === 0) {
        return res.status(400).json({ error: 'Buyer name is required.' });
      }

      const cleanBuyerName = buyerName.trim().slice(0, 150);
      const cleanProductName = productName ? String(productName).trim().slice(0, 255) : 'Custom Resin Emblem';
      const cleanDept = department ? String(department).trim().slice(0, 100) : 'General';
      const cleanRoute = busRoute ? String(busRoute).trim().slice(0, 100) : 'Standard Route';
      const cleanPickup = pickupSpot ? String(pickupSpot).trim().slice(0, 100) : 'Main Reception';
      const cleanNote = note ? String(note).trim().slice(0, 500) : null;
      const cleanCustomUrl = customImageUrl ? String(customImageUrl).trim() : null;
      const cleanProductId = productId ? String(productId).trim() : null;

      const parsedPrice = Number(priceKES);
      const parsedQty = Math.max(1, Math.min(100, Number(quantity) || 1));

      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: 'Invalid order price.' });
      }

      const insertSql = `
        INSERT INTO orders (
          product_id, product_name, price_kes, quantity, custom_image_url,
          department, bus_route, pickup_spot, buyer_name, note, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
        RETURNING id, created_at
      `;

      const result = await query(insertSql, [
        cleanProductId,
        cleanProductName,
        parsedPrice,
        parsedQty,
        cleanCustomUrl,
        cleanDept,
        cleanRoute,
        cleanPickup,
        cleanBuyerName,
        cleanNote,
      ]);

      return res.status(201).json({
        success: true,
        message: 'Order recorded successfully',
        orderId: result[0]?.id,
        createdAt: result[0]?.created_at,
      });
    }

    // ----------------------------------------------------
    // GET /api/orders (Admin Only) - List orders
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const isAdmin = await verifyAdminAuth(req);
      if (!isAdmin) {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
      }

      const { status, limit } = req.query;
      const maxRows = Math.min(200, Number(limit) || 100);

      let sqlText = 'SELECT * FROM orders';
      const params: any[] = [];

      if (status && typeof status === 'string' && status !== 'all') {
        sqlText += ' WHERE status = $1';
        params.push(status);
        sqlText += ` ORDER BY created_at DESC LIMIT $2`;
        params.push(maxRows);
      } else {
        sqlText += ` ORDER BY created_at DESC LIMIT $1`;
        params.push(maxRows);
      }

      const rows = await query(sqlText, params);

      const orders = rows.map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        priceKES: Number(r.price_kes),
        quantity: Number(r.quantity),
        customImageUrl: r.custom_image_url,
        department: r.department,
        busRoute: r.bus_route,
        pickupSpot: r.pickup_spot,
        buyerName: r.buyer_name,
        note: r.note,
        status: r.status,
        createdAt: r.created_at,
      }));

      return res.status(200).json({ success: true, orders });
    }

    // ----------------------------------------------------
    // PATCH /api/orders (Admin Only) - Update status
    // ----------------------------------------------------
    if (req.method === 'PATCH') {
      const isAdmin = await verifyAdminAuth(req);
      if (!isAdmin) {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
      }

      const { id, status } = req.body || {};
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Order ID is required.' });
      }

      const validStatuses = ['pending', 'in_progress', 'ready', 'delivered', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      }

      const result = await query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.length === 0) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        order: result[0],
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
