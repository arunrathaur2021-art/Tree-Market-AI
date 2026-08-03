import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || "treemarket_super_secret_key_9988776655";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'buyer' | 'seller' | 'admin';
  };
}

export function createToken(userId: string, role: string): string {
  const payload = JSON.stringify({ userId, role, expiry: Date.now() + 7 * 24 * 3600 * 1000 });
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

export function verifyToken(token: string): { userId: string; role: 'buyer' | 'seller' | 'admin' } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payloadStr = Buffer.from(parts[0], 'base64').toString('utf8');
    const signature = parts[1];
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSig) return null;
    
    const payload = JSON.parse(payloadStr);
    if (Date.now() > payload.expiry) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  req.user = decoded;
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};
