import { randomBytes, createHash } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Session } from './models.js';
import { config } from './config.js';
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; name: string; email: string };
    }
  }
}
const cookieOptions = () =>
  ({
    httpOnly: true,
    secure: config().NODE_ENV === 'production',
    sameSite: config().COOKIE_SAME_SITE,
    path: '/api/v1',
  }) as const;
export function clearCookies(res: Response) {
  res.clearCookie('kwis_access', cookieOptions());
  res.clearCookie('kwis_refresh', cookieOptions());
}
export async function issueSession(res: Response, user: InstanceType<typeof User>) {
  const token = jwt.sign({ sub: String(user._id), v: user.sessionVersion }, config().JWT_SECRET, {
    expiresIn: '30m',
    issuer: 'kwis',
    audience: 'kwis-admin',
  });
  const refresh = randomBytes(48).toString('hex');
  await Session.create({
    userId: user._id,
    hash: hash(refresh),
    expires: new Date(Date.now() + 7 * 86400000),
  });
  res.cookie('kwis_access', token, { ...cookieOptions(), maxAge: 1800000 });
  res.cookie('kwis_refresh', refresh, { ...cookieOptions(), maxAge: 7 * 86400000 });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.kwis_access;
    if (!token) return res.status(401).json({ error: 'Sign in to continue' });
    const claims = jwt.verify(token, config().JWT_SECRET, {
      issuer: 'kwis',
      audience: 'kwis-admin',
    }) as jwt.JwtPayload;
    const user = await User.findById(claims.sub);
    if (!user?.active || claims.v !== user.sessionVersion)
      return res.status(401).json({ error: 'Session expired' });
    req.user = { id: String(user._id), role: user.role!, name: user.name, email: user.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired' });
  }
}
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Administrator access required' });
  next();
}
export async function passwordHash(password: string) {
  return bcrypt.hash(password, 12);
}
