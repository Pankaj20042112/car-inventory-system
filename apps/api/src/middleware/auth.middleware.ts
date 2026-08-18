import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Role } from '@car-dealership/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: Role };
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const authorize = (role: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
};
