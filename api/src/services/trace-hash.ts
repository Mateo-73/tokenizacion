import { createHash } from 'node:crypto';
import type { TraceInput } from '../types.js';

/**
 * Hash SHA-256 (hex) de un hito. El orden de claves es FIJO para que sea reproducible
 * (docs/tecnico/03 §4.8). Si se cambia aquí, hay que cambiar también api/src/stellar/trace.ts.
 */
export function hashTrace({ assetId, type, title, date, description }: TraceInput): string {
  const canonical = JSON.stringify({ assetId, type, title, date, description });
  return createHash('sha256').update(canonical).digest('hex');
}
