// Prueba del reparto de retornos (S5): dos inversionistas con DISTINTA cantidad de fracciones de
// SOYA01 (40 y 120), reparto de un retorno simulado y verificación de cada pago contra la fórmula
// y contra los saldos reales de Horizon. Después prueba el redondeo hacia abajo y los errores.
//
// ⚠ Cada ejecución crea cuentas nuevas, COMPRA fracciones reales de SOYA01 y PAGA USDC de prueba
//   desde TREASURY a todos los tenedores de SOYA01. Requiere `setup:stellar` y `seed`.
// Uso: npm run demo:distribute
import { findSeedAsset } from '../api/src/data/db.js';
import { formatAmount, parseAmount } from '../api/src/money.js';
import { createDemoInvestor } from '../api/src/stellar/accounts.js';
import { authorizeInvestor } from '../api/src/stellar/assets.js';
import { explorerTx, findBalance, loadAccount, usdcAsset } from '../api/src/stellar/client.js';
import { loadKeys } from '../api/src/stellar/keys.js';
import { getHolders, getPortfolio } from '../api/src/stellar/portfolio.js';
import { distributeReturns } from '../api/src/stellar/returns.js';
import { buyFractions } from '../api/src/stellar/trading.js';

const CODE = 'SOYA01';
const { totalFractions, pricePerFraction } = findSeedAsset(CODE);

let failures = 0;
const check = (ok, message) => {
  console.log(`  ${ok ? '✓' : '✗'} ${message}`);
  if (!ok) failures += 1;
};

const usdcOf = async (publicKey) =>
  parseAmount((await getPortfolio({ publicKey })).usdcBalance) ?? 0n;

const treasuryUsdc = async () =>
  parseAmount(
    findBalance((await loadAccount(loadKeys().TREASURY.publicKey())).balances, usdcAsset())
      ?.balance ?? '0',
  ) ?? 0n;

async function newInvestor(label, fractions) {
  const investor = await createDemoInvestor({ initialUsdc: '5000' });
  await authorizeInvestor({ investorSecret: investor.secret, code: CODE });
  await buyFractions({
    investorSecret: investor.secret,
    code: CODE,
    fractions,
    pricePerFraction,
  });
  console.log(`   ${label}: ${fractions} fracciones · ${investor.publicKey}`);
  return investor;
}

/** Reparte `totalUsdc` y verifica cada pago; devuelve el resultado. */
async function distributeAndVerify(totalUsdc) {
  const holders = await getHolders({ code: CODE });
  const before = new Map(
    await Promise.all(holders.map(async (h) => [h.publicKey, await usdcOf(h.publicKey)])),
  );
  const treasuryBefore = await treasuryUsdc();
  const distributorBefore = await usdcOf(loadKeys().DISTRIBUTOR.publicKey());

  const result = await distributeReturns({ code: CODE, totalUsdc, totalFractions });

  console.log(`   ${result.payouts.length} pago(s) en ${result.txHashes.length} transacción(es):`);
  for (const payout of result.payouts) {
    console.log(
      `     ${payout.publicKey.slice(0, 8)}…  ${payout.fractions} fracciones → ${payout.usdc} USDC`,
    );
  }
  for (const hash of result.txHashes) console.log(`   ${explorerTx(hash)}`);

  const total = parseAmount(totalUsdc);
  let paid = 0n;
  for (const holder of holders) {
    const expected = (total * BigInt(holder.balance)) / BigInt(totalFractions);
    const payout = result.payouts.find((p) => p.publicKey === holder.publicKey);
    const delta = (await usdcOf(holder.publicKey)) - before.get(holder.publicKey);
    paid += delta;
    check(
      payout?.usdc === formatAmount(expected) && delta === expected,
      `${holder.publicKey.slice(0, 8)}… (${holder.balance}/${totalFractions}): fórmula ${formatAmount(expected)} · pagado según Horizon ${formatAmount(delta)}`,
    );
  }
  check(
    (await treasuryUsdc()) === treasuryBefore - paid,
    `TREASURY bajó exactamente lo pagado (${formatAmount(paid)} USDC)`,
  );
  check(paid <= total, `lo pagado (${formatAmount(paid)}) no supera el retorno (${totalUsdc})`);
  check(
    (await usdcOf(loadKeys().DISTRIBUTOR.publicKey())) === distributorBefore,
    'el DISTRIBUTOR (fracciones sin vender) no cobró',
  );
  return result;
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
  console.log(`1. Dos inversionistas con distinta cantidad de fracciones de ${CODE}`);
  await newInvestor('A', 40);
  await newInvestor('B', 120);

  console.log('\n2. Reparto de un retorno simulado de 1000 USDC');
  await distributeAndVerify('1000');

  console.log('\n3. Redondeo hacia abajo a 7 decimales (retorno de 333.3333333 USDC)');
  await distributeAndVerify('333.3333333');

  console.log('\n4. Errores esperados');
  check(
    await expectError('INSUFFICIENT_USDC', () =>
      distributeReturns({ code: CODE, totalUsdc: '100000000', totalFractions }),
    ),
    'retorno mayor que los fondos de TREASURY → INSUFFICIENT_USDC',
  );
  check(
    await expectError('VALIDATION', () =>
      distributeReturns({ code: CODE, totalUsdc: '0', totalFractions }),
    ),
    'retorno de 0 → VALIDATION',
  );
  check(
    await expectError('VALIDATION', () =>
      distributeReturns({ code: CODE, totalUsdc: '10', totalFractions: 0 }),
    ),
    'totalFractions = 0 → VALIDATION',
  );

  console.log(failures === 0 ? '\nTodo correcto.' : `\n${failures} comprobación(es) fallaron.`);
  process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
  console.error('\nFalló:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
