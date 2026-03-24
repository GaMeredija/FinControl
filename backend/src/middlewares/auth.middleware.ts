import { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app-error';
import { verifyAccessToken } from '../lib/jwt';

export type AuthenticatedRequest = Request & {
  userId?: string;
};

export function ensureAuthenticated(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token de acesso nao informado.', 'MISSING_TOKEN'));
  }

  const token = authorizationHeader.replace('Bearer ', '').trim();

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    return next();
  } catch (error) {
    return next(error);
  }
}

