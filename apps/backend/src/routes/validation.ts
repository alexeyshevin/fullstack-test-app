import type { NextFunction, Request, Response } from 'express';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isValidId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value);

export const isValidPageQuery = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
  const { cursor, limit, filter } = req.query;

  if ((cursor !== undefined && (typeof cursor !== 'string' || !/^-?\d+$/.test(cursor) || !Number.isSafeInteger(Number(cursor)))) ||
      (limit !== undefined && (typeof limit !== 'string' || !/^\d+$/.test(limit) || !Number.isSafeInteger(Number(limit)) || Number(limit) < 1)) ||
      (filter !== undefined && typeof filter !== 'string')) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination or filter query' } });
    return;
  }

  next();
};
