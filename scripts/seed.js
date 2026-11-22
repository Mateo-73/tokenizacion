// Prepara la red y la base con los datos de la semilla (api/data/seed.json):
//   1. emite SILO01 y SOYA01 y deja las fracciones en el DISTRIBUTOR;
//   2. registra en Stellar el hash de los hitos de trazabilidad que aún no lo tienen;
//   3. crea api/data/db.json desde la semilla si no existe y guarda ahí los hashes.
// Idempotente. Requiere haber corrido `npm run setup:stellar`.
// ⚠ Si la API está corriendo, reiníciala después: db.json no soporta dos procesos a la vez.
// Uso: npm run seed
import { DB_PATH, createStore } from '../api/src/data/db.js';
import { seedStellar } from '../api/src/seed.js';
import {
  explorerAccount,
  findBalance,
  fractionAsset,
  loadAccount,
} from '../api/src/stellar/client.js';
import * as stellar from '../api/src/stellar/index.js';
import { loadKeys } from '../api/src/stellar/keys.js';
import { getHolders } from '../api/src/stellar/portfolio.js';

console.log('Preparando Siembra en Stellar TESTNET...\n');

try {
  const store = createStore();
  const { assets } = await seedStellar({
    stellar,
    store,
    log: (message) => console.log(`  ✓ ${message}`),
  });
  for (const { id, txHash } of assets) {
    if (txHash) console.log(`    ${id}: https://stellar.expert/explorer/testnet/tx/${txHash}`);
  }

  // Verificación contra la red: el distribuidor + lo ya vendido debe sumar el total emitido
  const distributor = loadKeys().DISTRIBUTOR.publicKey();
  const account = await loadAccount(distributor);
  console.log('\nFracciones según Horizon (distribuidor + vendidas = total):');
  for (const { id, totalFractions } of store.assets()) {
    const balance = findBalance(account.balances, fractionAsset(id));
    const held = Number(balance?.balance ?? 0);
    const sold = (await getHolders({ code: id })).reduce((sum, holder) => sum + holder.balance, 0);
    const ok = held + sold === totalFractions && balance?.is_authorized;
    console.log(
      `  ${ok ? '✓' : '✗'} ${id}: ${held} en el distribuidor + ${sold} vendidas = ${held + sold} / ${totalFractions}`,
    );
    if (!ok) process.exitCode = 1;
  }

  console.log(`\nBase de datos: ${DB_PATH}`);
  console.log(`Explorador: ${explorerAccount(distributor)}`);
  console.log('Si la API está corriendo, reiníciala para que lea la base actualizada.');
} catch (err) {
  console.error('\nFalló:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
