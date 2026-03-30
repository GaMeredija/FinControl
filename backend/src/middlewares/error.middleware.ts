import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Os dados enviados são inválidos.',
      details: error.flatten().fieldErrors,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.code,
      message: error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Ocorreu um erro interno no servidor.',
  });
}
