// Prepara las cuentas de testnet (una sola vez; se puede repetir sin duplicar nada).
// Uso: npm run setup:stellar
import { setupAccounts } from '../api/src/stellar/accounts.js';
import { KEYS_PATH } from '../api/src/stellar/keys.js';

console.log('Preparando cuentas de Siembra en Stellar TESTNET...\n');

try {
  const { publics } = await setupAccounts((message) => console.log(`  ✓ ${message}`));

  console.log(`\nClaves (NO se suben a git): ${KEYS_PATH}`);
  console.log('Pega estas líneas en api/.env:\n');
  for (const [name, publicKey] of Object.entries(publics))
    console.log(`${name}_PUBLIC=${publicKey}`);
  console.log('\nExplorador: https://stellar.expert/explorer/testnet/account/' + publics.ISSUER);
} catch (err) {
  console.error('\nFalló la preparación:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
