import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025':
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Resource not found' },
        });
        return;
      case 'P2002':
        res.status(409).json({
          error: { code: 'DUPLICATE', message: 'A record with that value already exists' },
        });
        return;
      case 'P2003':
        res.status(409).json({
          error: { code: 'FK_CONSTRAINT', message: 'Referenced resource does not exist' },
        });
        return;
    }
  }

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json({ error: { code, message } });
};
