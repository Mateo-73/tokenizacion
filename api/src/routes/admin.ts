import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError } from '../errors.js';

/** Endpoints de administrador: exigen el header `x-admin-key` igual a ADMIN_KEY. */
export function requireAdmin(adminKey: string): RequestHandler {
  const expected = Buffer.from(adminKey);
  return (req, _res, next) => {
    const received = Buffer.from(req.header('x-admin-key') ?? '');
    const ok = received.length === expected.length && timingSafeEqual(received, expected);
    next(ok ? undefined : new AppError('FORBIDDEN', 'Falta o es inválido el header x-admin-key.'));
  };
}
