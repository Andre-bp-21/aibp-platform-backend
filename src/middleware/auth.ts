import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    req.email = decoded.email;

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};
