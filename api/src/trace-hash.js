import { createHash } from 'node:crypto';

/**
 * Hash SHA-256 (hex) de un hito. El orden de claves es FIJO para que sea reproducible
 * (docs/03 §4.8). Es la única definición: la usan `services/` (para verificar) y `stellar/trace.js`
 * (para registrar), por eso vive fuera de ambas carpetas.
 */
export function hashTrace({ assetId, type, title, date, description }) {
  const canonical = JSON.stringify({ assetId, type, title, date, description });
  return createHash('sha256').update(canonical).digest('hex');
}
