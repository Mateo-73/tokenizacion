import { Keypair, Operation } from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';
import { parseAmount } from '../money.js';
import {
  AUTH_REQUIRED,
  AUTH_REVOCABLE,
  accountExists,
  findBalance,
  fundWithFriendbot,
  server,
  submit,
  usdcAsset,
} from './client.js';
import { ACCOUNT_NAMES, createKeys, keysExist, loadKeys } from './keys.js';

/** USDC de prueba con el que se fondea TREASURY para simular la venta de la cosecha. */
const TREASURY_USDC = '100000';
/** Si TREASURY tiene menos que esto, se vuelve a fondear. */
const TREASURY_MIN_USDC = 1000;

/**
 * Prepara las 4 cuentas del proyecto en testnet (idempotente: se puede ejecutar varias veces):
 * 1. genera y guarda las claves (api/.stellar-keys.json) si no existen;
 * 2. fondea con Friendbot las cuentas que aún no existen en la red;
 * 3. activa AUTH_REQUIRED + AUTH_REVOCABLE en ISSUER (antes de crear cualquier trustline);
 * 4. crea la trustline a USDC en DISTRIBUTOR y TREASURY;
 * 5. USDC_ISSUER paga USDC de prueba a TREASURY.
 */
export async function setupAccounts(log = () => {}) {
  const created = !keysExist();
  const keys = created ? createKeys() : loadKeys();
  log(
    created
      ? 'Claves nuevas guardadas en api/.stellar-keys.json'
      : 'Usando las claves de api/.stellar-keys.json',
  );

  // Se fondea de a una: Friendbot limita las peticiones simultáneas.
  for (const name of ACCOUNT_NAMES) {
    const publicKey = keys[name].publicKey();
    if (await accountExists(publicKey)) {
      log(`${name}: ya existe en la red`);
    } else {
      await fundWithFriendbot(publicKey);
      log(`${name}: creada y fondeada con XLM de prueba`);
    }
  }

  const issuer = await server.loadAccount(keys.ISSUER.publicKey());
  if (issuer.flags.auth_required && issuer.flags.auth_revocable) {
    log('ISSUER: flags AUTH_REQUIRED y AUTH_REVOCABLE ya activos');
  } else {
    await submit(keys.ISSUER, [Operation.setOptions({ setFlags: AUTH_REQUIRED | AUTH_REVOCABLE })]);
    log('ISSUER: flags AUTH_REQUIRED y AUTH_REVOCABLE activados');
  }

  const usdc = usdcAsset();
  for (const name of ['DISTRIBUTOR', 'TREASURY']) {
    const account = await server.loadAccount(keys[name].publicKey());
    if (findBalance(account.balances, usdc)) {
      log(`${name}: ya confía en USDC`);
    } else {
      await submit(keys[name], [Operation.changeTrust({ asset: usdc })]);
      log(`${name}: trustline a USDC creada`);
    }
  }

  const treasury = await server.loadAccount(keys.TREASURY.publicKey());
  if (Number(findBalance(treasury.balances, usdc)?.balance ?? 0) >= TREASURY_MIN_USDC) {
    log('TREASURY: ya tiene USDC de prueba');
  } else {
    await submit(keys.USDC_ISSUER, [
      Operation.payment({
        destination: keys.TREASURY.publicKey(),
        asset: usdc,
        amount: TREASURY_USDC,
      }),
    ]);
    log(`TREASURY: recibió ${TREASURY_USDC} USDC de prueba`);
  }

  const publics = Object.fromEntries(ACCOUNT_NAMES.map((name) => [name, keys[name].publicKey()]));
  return { created, publics };
}

/**
 * Crea un inversionista demo custodial (Plan B, docs/03 §4.7): cuenta nueva fondeada con XLM de
 * prueba, trustline a USDC y USDC de prueba pagado por USDC_ISSUER. Solo testnet.
 *
 * @param {{ initialUsdc: string }} args
 * @returns {Promise<{ publicKey: string, secret: string }>}
 */
export async function createDemoInvestor({ initialUsdc }) {
  const amount = parseAmount(initialUsdc);
  if (amount === null || amount <= 0n) {
    throw new AppError('VALIDATION', 'initialUsdc debe ser un monto positivo como texto.');
  }

  const investor = Keypair.random();
  await fundWithFriendbot(investor.publicKey());
  await submit(investor, [Operation.changeTrust({ asset: usdcAsset() })]);
  await submit(loadKeys().USDC_ISSUER, [
    Operation.payment({
      destination: investor.publicKey(),
      asset: usdcAsset(),
      amount: initialUsdc,
    }),
  ]);
  return { publicKey: investor.publicKey(), secret: investor.secret() };
}
