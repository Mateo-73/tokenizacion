// Flujo completo de compra por script (hito S3): crea un inversionista demo con 1000 USDC, lo
// autoriza (KYC simulado), compra 10 fracciones de SILO01 y verifica el resultado en Horizon.
// Después comprueba los errores esperados (sin verificar, fracciones agotadas, USDC insuficiente).
//
// ⚠ Cada ejecución crea cuentas nuevas y COMPRA de verdad 10 fracciones de SILO01 en testnet,
//   así que bajan las fracciones disponibles del activo. Requiere `setup:stellar` y `seed`.
// Uso: npm run demo:buy
import { findAssetDef } from '../api/src/data/catalog.js';
import { authorizeInvestor } from '../api/src/stellar/assets.js';
import { createDemoInvestor } from '../api/src/stellar/accounts.js';
import {
  explorerTx,
  findBalance,
  fractionAsset,
  server,
  usdcAsset,
} from '../api/src/stellar/client.js';
import { loadKeys } from '../api/src/stellar/keys.js';
import { buyFractions } from '../api/src/stellar/trading.js';

const CODE = 'SILO01';
const FRACTIONS = 10;
const INITIAL_USDC = '1000';
const price = findAssetDef(CODE).pricePerFraction;

let failures = 0;
const check = (ok, message) => {
  console.log(`  ${ok ? '✓' : '✗'} ${message}`);
  if (!ok) failures += 1;
};

async function holdings(publicKey) {
  const account = await server.loadAccount(publicKey);
  return {
    usdc: Number(findBalance(account.balances, usdcAsset())?.balance ?? 0),
    fractions: Number(findBalance(account.balances, fractionAsset(CODE))?.balance ?? 0),
  };
}

async function expectError(code, run) {
  try {
    await run();
    return false;
  } catch (err) {
    return err?.code === code;
  }
}

try {
  const distributor = loadKeys().DISTRIBUTOR.publicKey();
  const distributorBefore = await holdings(distributor);

  console.log('1. Crear inversionista demo (cuenta + trustline USDC + 1000 USDC de prueba)');
  const investor = await createDemoInvestor({ initialUsdc: INITIAL_USDC });
  console.log(`   ${investor.publicKey}`);
  console.log(`   ${explorerAccount(investor.publicKey)}`);

  console.log('\n2. Autorizar para SILO01 (KYC simulado)');
  const auth = await authorizeInvestor({ investorSecret: investor.secret, code: CODE });
  console.log(`   ${explorerTx(auth.txHash)}`);

  console.log(`\n3. Comprar ${FRACTIONS} fracciones de ${CODE} a ${price} USDC`);
  const buy = await buyFractions({
    investorSecret: investor.secret,
    code: CODE,
    fractions: FRACTIONS,
    pricePerFraction: price,
  });
  console.log(`   Total pagado: ${buy.totalUsdc} USDC`);
  console.log(`   ${explorerTx(buy.txHash)}`);

  console.log('\n4. Verificación en Horizon');
  const after = await holdings(investor.publicKey);
  const distributorAfter = await holdings(distributor);
  check(
    after.fractions === FRACTIONS,
    `inversionista tiene ${after.fractions} fracciones (esperado ${FRACTIONS})`,
  );
  check(
    after.usdc === Number(INITIAL_USDC) - Number(buy.totalUsdc),
    `inversionista tiene ${after.usdc} USDC (esperado ${Number(INITIAL_USDC) - Number(buy.totalUsdc)})`,
  );
  check(
    distributorAfter.fractions === distributorBefore.fractions - FRACTIONS,
    `distribuidor bajó de ${distributorBefore.fractions} a ${distributorAfter.fractions} fracciones`,
  );
  check(
    distributorAfter.usdc === distributorBefore.usdc + Number(buy.totalUsdc),
    `distribuidor subió de ${distributorBefore.usdc} a ${distributorAfter.usdc} USDC`,
  );

  console.log('\n5. Errores esperados');
  const stranger = await createDemoInvestor({ initialUsdc: INITIAL_USDC }); // sin autorizar
  check(
    await expectError('NOT_AUTHORIZED', () =>
      buyFractions({
        investorSecret: stranger.secret,
        code: CODE,
        fractions: 1,
        pricePerFraction: price,
      }),
    ),
    'comprar sin verificar → NOT_AUTHORIZED',
  );
  check(
    await expectError('INSUFFICIENT_FRACTIONS', () =>
      buyFractions({
        investorSecret: investor.secret,
        code: CODE,
        fractions: 100000,
        pricePerFraction: price,
      }),
    ),
    'pedir más fracciones de las disponibles → INSUFFICIENT_FRACTIONS',
  );
  check(
    await expectError('INSUFFICIENT_USDC', () =>
      buyFractions({
        investorSecret: investor.secret,
        code: CODE,
        fractions: 100,
        pricePerFraction: price,
      }),
    ),
    'pagar con USDC insuficiente → INSUFFICIENT_USDC',
  );
  check(
    await expectError('VALIDATION', () =>
      buyFractions({
        investorSecret: investor.secret,
        code: CODE,
        fractions: 1.5,
        pricePerFraction: price,
      }),
    ),
    'fracciones no enteras → VALIDATION',
  );
  const final = await holdings(investor.publicKey);
  check(
    final.fractions === FRACTIONS && final.usdc === after.usdc,
    'los intentos fallidos no movieron fondos',
  );

  console.log(failures === 0 ? '\nTodo correcto.' : `\n${failures} comprobación(es) fallaron.`);
  process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
  console.error('\nFalló:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
}

function explorerAccount(publicKey) {
  return `https://stellar.expert/explorer/testnet/account/${publicKey}`;
}
