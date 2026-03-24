import jwt, { JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env';
import { AppError } from '../errors/app-error';

type TokenPayload = JwtPayload & {
  email: string;
};

export function signAccessToken(userId: string, email: string) {
  return jwt.sign({ email }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: '1d',
  });
}

export function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === 'string') {
    throw new AppError(401, 'Token invalido.', 'INVALID_TOKEN');
  }

  const payload = decoded as TokenPayload;

  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new AppError(401, 'Token invalido.', 'INVALID_TOKEN');
  }

  return {
    userId: payload.sub,
    email: payload.email,
  };
}

