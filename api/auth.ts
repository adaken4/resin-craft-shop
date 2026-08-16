import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, jwtVerify } from 'jose';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'resincraft_default_secret_key_at_least_32_chars_2026'
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

/**
 * Creates a signed JWT for the authenticated admin
 */
export async function signAdminToken(): Promise<string> {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Validates whether the incoming request has a valid Admin JWT
 */
export async function verifyAdminAuth(req: VercelRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Handler for /api/auth
 * POST: Login with admin password
 * GET: Verify existing token
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD environment variable is not configured on the server.' });
    }

    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.trim() !== ADMIN_PASSWORD.trim()) {
      return res.status(401).json({ error: 'Invalid admin passcode' });
    }

    const token = await signAdminToken();
    return res.status(200).json({
      success: true,
      token,
      message: 'Admin authentication successful',
    });
  }

  if (req.method === 'GET') {
    const isAuthenticated = await verifyAdminAuth(req);
    if (!isAuthenticated) {
      return res.status(401).json({ authenticated: false, error: 'Unauthorized or token expired' });
    }
    return res.status(200).json({ authenticated: true, role: 'admin' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
