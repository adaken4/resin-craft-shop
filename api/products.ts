import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';
import { verifyAdminAuth } from './auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ----------------------------------------------------
    // GET /api/products
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const isAdmin = await verifyAdminAuth(req);
      const showAll = req.query.all === 'true' && isAdmin;

      let sqlText: string;
      if (showAll) {
        sqlText = 'SELECT * FROM products ORDER BY sort_order ASC, created_at DESC';
      } else {
        sqlText = 'SELECT * FROM products WHERE is_active = true ORDER BY sort_order ASC, created_at DESC';
      }

      const rows = await query(sqlText);
      
      // Map to frontend-friendly camelCase fields while preserving DB types
      const products = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        priceKES: Number(r.price_kes),
        photo: r.photo_url,
        description: r.description,
        tag: r.tag || undefined,
        category: r.category,
        isActive: Boolean(r.is_active),
        sortOrder: r.sort_order,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return res.status(200).json({ success: true, products });
    }

    // ----------------------------------------------------
    // POST /api/products (Admin Only)
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const isAdmin = await verifyAdminAuth(req);
      if (!isAdmin) {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
      }

      const { name, priceKES, photo, description, tag, category, isActive, sortOrder } = req.body || {};

      // Defensive Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Valid product name is required.' });
      }

      const parsedPrice = Number(priceKES);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number in KES.' });
      }

      if (!photo || typeof photo !== 'string') {
        return res.status(400).json({ error: 'Product photo URL is required.' });
      }

      // Generate a clean slug ID from the name if not provided
      const slugId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
      const productCategory = category || 'keyholder';
      const productTag = tag ? String(tag).trim() : null;
      const productDesc = description ? String(description).trim() : '';
      const activeState = isActive !== undefined ? Boolean(isActive) : true;
      const orderVal = Number(sortOrder) || 0;

      const insertSql = `
        INSERT INTO products (id, name, price_kes, photo_url, description, tag, category, is_active, sort_order, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `;

      const result = await query(insertSql, [
        slugId,
        name.trim(),
        parsedPrice,
        photo.trim(),
        productDesc,
        productTag,
        productCategory,
        activeState,
        orderVal,
      ]);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: result[0],
      });
    }

    // ----------------------------------------------------
    // PUT /api/products (Admin Only) - Full update or Patch
    // ----------------------------------------------------
    if (req.method === 'PUT') {
      const isAdmin = await verifyAdminAuth(req);
      if (!isAdmin) {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
      }

      const { id, name, priceKES, photo, description, tag, category, isActive, sortOrder } = req.body || {};

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Product ID is required for updates.' });
      }

      // Check existence
      const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const current = existing[0];
      const newName = name !== undefined ? String(name).trim() : current.name;
      const newPrice = priceKES !== undefined ? Number(priceKES) : Number(current.price_kes);
      const newPhoto = photo !== undefined ? String(photo).trim() : current.photo_url;
      const newDesc = description !== undefined ? String(description).trim() : current.description;
      const newTag = tag !== undefined ? (tag ? String(tag).trim() : null) : current.tag;
      const newCategory = category !== undefined ? String(category).trim() : current.category;
      const newIsActive = isActive !== undefined ? Boolean(isActive) : Boolean(current.is_active);
      const newSortOrder = sortOrder !== undefined ? Number(sortOrder) : current.sort_order;

      if (isNaN(newPrice) || newPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a valid positive number.' });
      }

      const updateSql = `
        UPDATE products
        SET name = $1, price_kes = $2, photo_url = $3, description = $4, tag = $5, category = $6, is_active = $7, sort_order = $8, updated_at = NOW()
        WHERE id = $9
        RETURNING *
      `;

      const updated = await query(updateSql, [
        newName,
        newPrice,
        newPhoto,
        newDesc,
        newTag,
        newCategory,
        newIsActive,
        newSortOrder,
        id,
      ]);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updated[0],
      });
    }

    // ----------------------------------------------------
    // DELETE /api/products (Admin Only)
    // ----------------------------------------------------
    if (req.method === 'DELETE') {
      const isAdmin = await verifyAdminAuth(req);
      if (!isAdmin) {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
      }

      const { id } = req.body || req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Product ID is required for deletion.' });
      }

      await query('DELETE FROM products WHERE id = $1', [id]);

      return res.status(200).json({
        success: true,
        message: `Product ${id} deleted successfully.`,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Products API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
