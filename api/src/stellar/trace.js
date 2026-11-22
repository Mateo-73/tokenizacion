import { Operation } from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';
import { hashTrace } from '../trace-hash.js';
import { HORIZON_URL, loadAccount, submit } from './client.js';
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
 * Recupera de Horizon el hash de la transacción que registró `hash` bajo `name` en `account`.
 * Se usa cuando el hash ya está on-chain (seed idempotente) y el db.json recién se recreó: sin
 * esto, el hito queda verificado pero sin enlace al explorador. Devuelve null si no lo encuentra.
 *
 * @param {string} name nombre de la entrada de datos (`t.<assetId>.<order>`)
 * @param {string} hash hash en hex guardado en la entrada
 * @param {string} [account] cuenta que registró la entrada (por defecto, el ISSUER)
 * @param {string} [horizonUrl]
 * @returns {Promise<string | null>}
 */
export async function findRecordedTxHash(
  name,
  hash,
  account = loadKeys().ISSUER.publicKey(),
  horizonUrl = HORIZON_URL,
) {
  try {
    const expected = Buffer.from(hash, 'hex').toString('base64');
    let url = new URL(`/accounts/${encodeURIComponent(account)}/effects`, horizonUrl);
    url.searchParams.set('order', 'desc');
    url.searchParams.set('limit', '200');

    // Como máximo 5 páginas: los hitos de la semilla son los primeros registros de la cuenta.
    for (let page = 0; url && page < 5; page += 1) {
      const response = await fetch(url);
      if (!response.ok) return null;
      const body = await response.json();
      const effects = body?._embedded?.records ?? [];
      for (const effect of effects) {
        if (effect.type !== 'data_created' && effect.type !== 'data_updated') continue;
        if (effect.name !== name || effect.value !== expected) continue;
        const operationUrl = effect._links?.operation?.href;
        if (!operationUrl) continue;
        const operationResponse = await fetch(operationUrl);
        if (!operationResponse.ok) continue;
        const operation = await operationResponse.json();
        if (operation.transaction_hash) return operation.transaction_hash;
      }
      url = body?._links?.next?.href ? new URL(body._links.next.href) : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Registra el hash de un hito de trazabilidad como entrada de datos de la cuenta ISSUER
 * (docs/03 §4.8): `t.<assetId>.<order>` → SHA-256 de {assetId, type, title, date, description}.
 *
 * - Si ya hay una entrada con el MISMO hash no vuelve a escribir y recupera el `txHash` original
 *   desde Horizon (null si Horizon no responde).
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
  if (existing === hash) {
    // Ya está registrado: recuperamos el txHash original para que el hito siga teniendo enlace
    // al explorador aunque db.json se haya creado de nuevo desde la semilla.
    return { hash, txHash: await findRecordedTxHash(name, hash) };
  }
  if (existing !== null) {
    throw new AppError(
      'VALIDATION',
      `Ya hay un hito registrado en Stellar para ${name} con otro contenido; no se sobrescribe.`,
    );
  }

  const { hash: txHash } = await submit(
    loadKeys().ISSUER,
    [Operation.manageData({ name, value: Buffer.from(hash, 'hex') })],
    [],
    `SIEMBRA HITO ${milestone.assetId} ${order}`,
  );
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
