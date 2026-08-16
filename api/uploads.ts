import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dotenv from 'dotenv';

dotenv.config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: Returns the public upload config (only if configured in env)
    if (req.method === 'GET') {
      const isConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

      return res.status(200).json({
        configured: isConfigured,
        cloudName: isConfigured ? CLOUDINARY_CLOUD_NAME : null,
        uploadPreset: isConfigured ? CLOUDINARY_UPLOAD_PRESET : null,
        maxSizeMB: 5,
        allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      });
    }

    // POST: Server-side upload handler
    if (req.method === 'POST') {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        return res.status(500).json({ 
          error: 'Image upload is not configured: CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET is missing from environment variables.' 
        });
      }

      const { fileData, folder = 'resin/store' } = req.body || {};

      if (!fileData || typeof fileData !== 'string') {
        return res.status(400).json({ error: 'fileData string (base64 data URI or image URL) is required.' });
      }

      // Upload to Cloudinary API
      const uploadFormData = new URLSearchParams();
      uploadFormData.append('file', fileData);
      uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      uploadFormData.append('folder', folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: uploadFormData.toString(),
        }
      );

      if (!cloudRes.ok) {
        const errorText = await cloudRes.text();
        console.error('Cloudinary API upload error:', errorText);
        return res.status(502).json({ error: 'Failed to upload image to Cloudinary storage. Check preset and permissions.' });
      }

      const cloudData = await cloudRes.json();

      return res.status(200).json({
        success: true,
        url: cloudData.secure_url || cloudData.url,
        publicId: cloudData.public_id,
        format: cloudData.format,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Uploads API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
