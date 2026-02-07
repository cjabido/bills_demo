import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    // req.query is read-only in Express 5+; only assign back for body/params
    if (source === 'body') {
      req.body = parsed;
    }
    next();
  };
}
