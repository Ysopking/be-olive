import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-prod';

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function requireAuth(req, roles = []) {
  const token = getTokenFromRequest(req);
  if (!token) return { error: 'No token provided', status: 401 };

  const decoded = verifyToken(token);
  if (!decoded) return { error: 'Invalid token', status: 401 };

  if (roles.length > 0 && !roles.includes(decoded.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user: decoded };
}