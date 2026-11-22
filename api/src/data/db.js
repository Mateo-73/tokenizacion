import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Persistencia en un archivo JSON (docs/05-modelo-de-datos.md). Stellar es la fuente de verdad de
// saldos y fracciones; aquí solo va lo que Stellar no guarda: catálogo, inversionistas demo, hitos
// y retornos repartidos. Las rutas no dependen del directorio desde el que se ejecute el comando.
export const SEED_PATH = fileURLToPath(new URL('../../data/seed.json', import.meta.url));
export const DB_PATH = fileURLToPath(new URL('../../data/db.json', import.meta.url));

const COLLECTIONS = ['assets', 'investors', 'trace', 'returns'];

/** Semilla versionada (sin claves ni hashes). */
export const readSeed = () => JSON.parse(readFileSync(SEED_PATH, 'utf8'));
export const seedAssets = () => readSeed().assets;
export const findSeedAsset = (id) => seedAssets().find((asset) => asset.id === id);

const pad = (n) => String(n).padStart(3, '0');

/** Siguiente id legible (`inv_001`, `tr_001`, `ret_001`): máximo existente + 1, sobrevive a reinicios. */
function nextId(prefix, list) {
  const pattern = new RegExp(`^${prefix}_(\\d+)$`);
  const max = list.reduce((top, item) => {
    const match = pattern.exec(item.id);
    return match ? Math.max(top, Number(match[1])) : top;
  }, 0);
  return `${prefix}_${pad(max + 1)}`;
}

/**
 * Crea el almacén de datos.
 * - `persist: true` (modo real): usa `api/data/db.json`, creándolo desde la semilla si no existe, y
 *   lo reescribe de forma atómica (archivo temporal + rename) tras cada cambio. Contiene claves
 *   demo (solo testnet): está en .gitignore y se crea con permiso solo para el dueño.
 * - `persist: false` (modo mock): copia de la semilla en memoria; nunca toca `db.json`.
 *
 * @param {{ dbPath?: string, persist?: boolean }} [options]
 */
export function createStore({ dbPath = DB_PATH, persist = true } = {}) {
  let data;
  if (persist) {
    if (!existsSync(dbPath)) {
      mkdirSync(dirname(dbPath), { recursive: true });
      writeFileSync(dbPath, readFileSync(SEED_PATH), { mode: 0o600 });
    }
    try {
      data = JSON.parse(readFileSync(dbPath, 'utf8'));
    } catch {
      throw new Error(`${dbPath} no es un JSON válido. Bórralo y ejecuta npm run seed.`);
    }
  } else {
    data = readSeed();
  }
  for (const collection of COLLECTIONS) data[collection] ??= [];

  function save() {
    if (!persist) return;
    const tmp = `${dbPath}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    renameSync(tmp, dbPath);
    chmodSync(dbPath, 0o600);
  }

  return {
    // Catálogo
    assets: () => data.assets,
    findAsset: (id) => data.assets.find((asset) => asset.id === id),

    // Inversionistas demo
    findInvestorById: (id) => data.investors.find((investor) => investor.id === id),
    findInvestorByEmail: (email) => data.investors.find((investor) => investor.email === email),
    findInvestorByPublicKey: (key) => data.investors.find((investor) => investor.publicKey === key),
    nextInvestorId: () => nextId('inv', data.investors),
    addInvestor(investor) {
      data.investors.push(investor);
      save();
    },
    /** Caché de conveniencia: la verdad es la trustline autorizada en Stellar. */
    markAuthorized(investorId, assetId) {
      const investor = data.investors.find((item) => item.id === investorId);
      if (investor && !investor.authorizedAssets?.includes(assetId)) {
        investor.authorizedAssets = [...(investor.authorizedAssets ?? []), assetId];
        save();
      }
    },

    // Trazabilidad (`order` es por activo)
    traceFor: (assetId) =>
      data.trace.filter((m) => m.assetId === assetId).sort((a, b) => a.order - b.order),
    nextTraceId: () => nextId('tr', data.trace),
    addTrace(milestone) {
      data.trace.push(milestone);
      save();
    },
    /** Hitos sin registrar en Stellar (sin `hash`) o a los que aún falta recuperar el `txHash`. */
    pendingTrace: () => data.trace.filter((m) => m.hash === null || !m.txHash),
    setTraceHash(id, { hash, txHash }) {
      const milestone = data.trace.find((m) => m.id === id);
      if (!milestone) throw new Error(`No existe el hito ${id}`);
      Object.assign(milestone, { hash, txHash });
      save();
    },

    // Retornos repartidos: un registro por reparto, con un pago por tenedor
    addReturn(distribution) {
      const record = {
        id: nextId('ret', data.returns),
        ...distribution,
        createdAt: new Date().toISOString(),
      };
      data.returns.push(record);
      save();
      return record;
    },
    /** Pagos recibidos por un inversionista, de todos los repartos. */
    returnsFor: (investorId) =>
      data.returns.flatMap((record) =>
        record.payouts
          .filter((payout) => payout.investorId === investorId)
          .map((payout) => ({
            assetId: record.assetId,
            period: record.period,
            usdc: payout.usdc,
            txHash: payout.txHash,
          })),
      ),
  };
}
