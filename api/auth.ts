import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, jwtVerify } from 'jose';
import * as dotenv from 'dotenv';

dotenv.config();

const rawJwtSecret = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function getJwtSecretKey(): Uint8Array {
  if (!rawJwtSecret) {
    throw new Error('JWT_SECRET environment variable is missing or empty.');
  }
  return new TextEncoder().encode(rawJwtSecret);
}

/**
 * Creates a signed JWT for the authenticated admin
 */
export async function signAdminToken(): Promise<string> {
  const secretKey = getJwtSecretKey();
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
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
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Strict check: if environment variables are not set, refuse service
  if (!ADMIN_PASSWORD || !rawJwtSecret) {
    return res.status(500).json({ 
      error: 'Authentication service is misconfigured: ADMIN_PASSWORD or JWT_SECRET is missing from environment variables.' 
    });
  }

  if (req.method === 'POST') {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.trim() !== ADMIN_PASSWORD.trim()) {
      return res.status(401).json({ error: 'Invalid admin passcode' });
    }

    try {
      const token = await signAdminToken();
      return res.status(200).json({
        success: true,
        token,
        message: 'Admin authentication successful',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Token generation failed' });
    }
  }

  if (req.method === 'GET') {
    const isAuthenticated = await verifyAdminAuth(req);
    if (!isAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
    }
    return res.status(200).json({ authenticated: true, role: 'admin' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
