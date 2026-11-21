// Emite SILO01 y SOYA01 en testnet y deja las fracciones en el DISTRIBUTOR.
// Idempotente: si ya están emitidos no hace nada. Requiere haber corrido `npm run setup:stellar`.
// Uso: npm run seed
import { ASSETS } from '../api/src/data/catalog.js';
import { issueAsset } from '../api/src/stellar/assets.js';
import { explorerTx, findBalance, fractionAsset, loadAccount } from '../api/src/stellar/client.js';
import { getHolders } from '../api/src/stellar/portfolio.js';
import { loadKeys } from '../api/src/stellar/keys.js';

console.log('Emitiendo activos de Siembra en Stellar TESTNET...\n');

try {
  const distributor = loadKeys().DISTRIBUTOR.publicKey();

  for (const { id, totalFractions } of ASSETS) {
    const { txHash } = await issueAsset({ code: id, totalFractions });
    console.log(
      txHash
        ? `  ✓ ${id}: emitido (${totalFractions} fracciones)\n    ${explorerTx(txHash)}`
        : `  ✓ ${id}: ya estaba emitido (${totalFractions} fracciones), no se repite`,
    );
  }

  // Verificación contra la red: el distribuidor + lo ya vendido debe sumar el total emitido
  const account = await loadAccount(distributor);
  console.log('\nFracciones según Horizon (distribuidor + vendidas = total):');
  for (const { id, totalFractions } of ASSETS) {
    const balance = findBalance(account.balances, fractionAsset(id));
    const held = Number(balance?.balance ?? 0);
    const sold = (await getHolders({ code: id })).reduce((sum, holder) => sum + holder.balance, 0);
    const ok = held + sold === totalFractions && balance?.is_authorized;
    console.log(
      `  ${ok ? '✓' : '✗'} ${id}: ${held} en el distribuidor + ${sold} vendidas = ${held + sold} / ${totalFractions}`,
    );
    if (!ok) process.exitCode = 1;
  }
  console.log(`\nExplorador: https://stellar.expert/explorer/testnet/account/${distributor}`);
} catch (err) {
  console.error('\nFalló la emisión:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
