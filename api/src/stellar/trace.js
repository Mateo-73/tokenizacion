import { Operation } from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';
import { hashTrace } from '../trace-hash.js';
import { loadAccount, submit } from './client.js';
import { loadKeys } from './keys.js';

/** Nombre de la entrada de datos del ISSUER donde vive el hash de un hito (máx. 64 bytes). */
export const traceEntryName = (assetId, order) => `t.${assetId}.${order}`;

/** Hash registrado on-chain para un hito, en hex; null si no hay entrada. */
async function onChainHash(assetId, order) {
  const issuer = await loadAccount(loadKeys().ISSUER.publicKey());
  const value = issuer.data_attr?.[traceEntryName(assetId, order)];
  return value ? Buffer.from(value, 'base64').toString('hex') : null;
}

/**
 * Registra el hash de un hito de trazabilidad como entrada de datos de la cuenta ISSUER
 * (docs/03 §4.8): `t.<assetId>.<order>` → SHA-256 de {assetId, type, title, date, description}.
 *
 * - Si ya hay una entrada con el MISMO hash no vuelve a escribir y devuelve `txHash: null`.
 * - Si ya hay una con OTRO hash lanza VALIDATION: no se reescribe lo registrado, porque eso
 *   anularía la garantía de que nadie edita la historia.
 *
 * @param {import('../types.js').TraceInput & { order: number }} args
 * @returns {Promise<{ hash: string, txHash: string | null }>}
 */
export async function recordTrace({ order, ...milestone }) {
  const name = traceEntryName(milestone.assetId, order);
  if (Buffer.byteLength(name) > 64) {
    throw new AppError('VALIDATION', `El nombre de la entrada (${name}) supera los 64 bytes.`);
  }

  const hash = hashTrace(milestone);
  const existing = await onChainHash(milestone.assetId, order);
  if (existing === hash) return { hash, txHash: null };
  if (existing !== null) {
    throw new AppError(
      'VALIDATION',
      `Ya hay un hito registrado en Stellar para ${name} con otro contenido; no se sobrescribe.`,
    );
  }

  const { hash: txHash } = await submit(loadKeys().ISSUER, [
    Operation.manageData({ name, value: Buffer.from(hash, 'hex') }),
  ]);
  return { hash, txHash };
}

/**
 * Verifica un hito: `hash` es el hash recalculado del hito tal como está guardado en la base; es
 * `true` solo si coincide con el registrado on-chain. Si alguien editó el texto, da `false`.
 *
 * @param {{ assetId: string, order: number, hash: string }} args
 * @returns {Promise<boolean>}
 */
export async function verifyTrace({ assetId, order, hash }) {
  return (await onChainHash(assetId, order)) === hash;
}

/**
 * Borra la entrada on-chain de un hito (manageData con valor null). Solo para limpiar pruebas
 * (`npm run demo:trace`): borrar entradas reales anularía la verificación de esos hitos.
 *
 * @param {{ assetId: string, order: number }} args
 * @returns {Promise<{ txHash: string | null }>}
 */
export async function deleteTraceEntry({ assetId, order }) {
  if ((await onChainHash(assetId, order)) === null) return { txHash: null };
  const { hash } = await submit(loadKeys().ISSUER, [
    Operation.manageData({ name: traceEntryName(assetId, order), value: null }),
  ]);
  return { txHash: hash };
}
