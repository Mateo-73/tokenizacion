import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Keypair } from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';

// Las claves viven SOLO en api/.stellar-keys.json (está en .gitignore). Solo testnet.
export const KEYS_PATH = fileURLToPath(new URL('../../.stellar-keys.json', import.meta.url));

export const ACCOUNT_NAMES = ['ISSUER', 'DISTRIBUTOR', 'TREASURY', 'USDC_ISSUER'];

let cache;

export function keysExist() {
  return existsSync(KEYS_PATH);
}

/** Genera claves nuevas para las 4 cuentas y las guarda en disco (permiso solo del dueño). */
export function createKeys() {
  const keys = Object.fromEntries(ACCOUNT_NAMES.map((name) => [name, Keypair.random()]));
  const file = Object.fromEntries(
    ACCOUNT_NAMES.map((name) => [
      name,
      { public: keys[name].publicKey(), secret: keys[name].secret() },
    ]),
  );
  writeFileSync(KEYS_PATH, `${JSON.stringify(file, null, 2)}\n`, { mode: 0o600 });
  chmodSync(KEYS_PATH, 0o600);
  cache = keys;
  return keys;
}

export function loadKeys() {
  if (cache) return cache;
  if (!keysExist()) {
    throw new AppError(
      'STELLAR_ERROR',
      'Faltan las cuentas de Stellar: ejecuta `npm run setup:stellar` (genera api/.stellar-keys.json).',
    );
  }
  const file = JSON.parse(readFileSync(KEYS_PATH, 'utf8'));
  cache = Object.fromEntries(
    ACCOUNT_NAMES.map((name) => [name, Keypair.fromSecret(file[name].secret)]),
  );
  return cache;
}
