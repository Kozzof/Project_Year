import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        displayName: string;
      };
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentification requise');
    }

    const token = authorization.slice('Bearer '.length);
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.banned || user.tokenVersion !== payload.tokenVersion) {
      throw new HttpError(401, 'Session invalide ou expirée');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    };

    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Token invalide'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new HttpError(401, 'Authentification requise'));
  if (req.user.role !== 'ADMIN') return next(new HttpError(403, 'Accès administrateur requis'));
  next();
}
