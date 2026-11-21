// Solo lectura: muestra el portafolio de una wallet y los tenedores de cada activo (desde Horizon).
// Uso: npm run portfolio -- <clave pública G...>      (sin clave, solo muestra los tenedores)
import { ASSETS } from '../api/src/data/catalog.js';
import { explorerAccount } from '../api/src/stellar/client.js';
import { findBalance, fractionAsset, loadAccount } from '../api/src/stellar/client.js';
import { getHolders, getPortfolio } from '../api/src/stellar/portfolio.js';
import { loadKeys } from '../api/src/stellar/keys.js';

const publicKey = process.argv[2];
let failures = 0;

try {
  if (publicKey) {
    const { usdcBalance, holdings } = await getPortfolio({ publicKey });
    console.log(`Portafolio de ${publicKey}`);
    console.log(`  USDC disponible: ${usdcBalance}`);
    if (holdings.length === 0) console.log('  (sin fracciones)');
    for (const { code, fractions } of holdings) console.log(`  ${code}: ${fractions} fracciones`);
    console.log(`  ${explorerAccount(publicKey)}\n`);
  }

  const distributor = await loadAccount(loadKeys().DISTRIBUTOR.publicKey());
  console.log('Tenedores por activo (sin contar al DISTRIBUTOR):');
  for (const { id, totalFractions } of ASSETS) {
    const holders = await getHolders({ code: id });
    const sold = holders.reduce((sum, holder) => sum + holder.balance, 0);
    const inDistributor = Number(
      findBalance(distributor.balances, fractionAsset(id))?.balance ?? 0,
    );
    const consistent = sold === totalFractions - inDistributor;
    console.log(
      `  ${consistent ? '✓' : '✗'} ${id}: ${holders.length} tenedor(es), ${sold} vendidas ` +
        `(total ${totalFractions} − distribuidor ${inDistributor} = ${totalFractions - inDistributor})`,
    );
    for (const holder of holders) console.log(`      ${holder.publicKey}: ${holder.balance}`);
    if (!consistent) failures += 1;
  }
  process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
  console.error('Falló:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
