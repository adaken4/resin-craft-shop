import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';
import { verifyAdminAuth } from './auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ----------------------------------------------------
    // GET /api/settings - Public storefront branding & config
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const rows = await query('SELECT key, value FROM site_settings');
      const settingsMap: Record<string, string> = {
        shop_name: 'ResinCraft',
        tagline: 'Your emblem, sealed in pristine, hand-poured resin.',
        whatsapp_number: '254704513552',
        hero_badge: 'Nairobi Office & Route Express Delivery',
        custom_price_kes: '500',
      };

      for (const row of rows) {
        if (row.key !== 'admin_password_hash') {
          settingsMap[row.key] = row.value;
        }
      }

      return res.status(200).json({ success: true, settings: settingsMap });
    }

    // ----------------------------------------------------
    // PUT /api/settings (Admin Only) - Update branding
    // ----------------------------------------------------
    if (req.method === 'PUT') {
      const isAdmin = await verifyAdminAuth(req);
      if (!isAdmin) {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
      }

      const settings = req.body || {};
      const allowedKeys = ['shop_name', 'tagline', 'whatsapp_number', 'hero_badge', 'custom_price_kes'];

      for (const [key, value] of Object.entries(settings)) {
        if (allowedKeys.includes(key) && value !== undefined && value !== null) {
          const cleanVal = String(value).trim();
          await query(
            `INSERT INTO site_settings (key, value, updated_at) 
             VALUES ($1, $2, NOW()) 
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
            [key, cleanVal]
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Store settings updated successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Settings API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
