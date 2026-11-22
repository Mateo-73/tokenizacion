import {
  Asset,
  AuthRequiredFlag,
  AuthRevocableFlag,
  BASE_FEE,
  Horizon,
  Memo,
  Networks,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';
import { loadKeys } from './keys.js';

export const HORIZON_URL = process.env.HORIZON_URL ?? 'https://horizon-testnet.stellar.org';
export const server = new Horizon.Server(HORIZON_URL);
export const NETWORK = Networks.TESTNET;
export const AUTH_REQUIRED = AuthRequiredFlag;
export const AUTH_REVOCABLE = AuthRevocableFlag;

/** USDC de PRUEBA: emisor propio, distinto del USDC real (hay que decirlo en la demo). */
export const usdcAsset = () => new Asset('USDC', loadKeys().USDC_ISSUER.publicKey());
export const fractionAsset = (code) => new Asset(code, loadKeys().ISSUER.publicKey());
export const explorerTx = (hash) => `https://stellar.expert/explorer/testnet/tx/${hash}`;
export const explorerAccount = (publicKey) =>
  `https://stellar.expert/explorer/testnet/account/${publicKey}`;

/** Error de Horizon con los códigos de resultado (`op_no_trust`, `op_underfunded`, ...). */
export class StellarTxError extends AppError {
  constructor(message, resultCodes, retryable) {
    super('STELLAR_ERROR', message);
    this.name = 'StellarTxError';
    this.resultCodes = resultCodes;
    this.retryable = retryable;
  }

  has(code) {
    return this.resultCodes.includes(code);
  }
}

function toStellarError(err) {
  if (err instanceof StellarTxError) return err;
  const response = err.response;
  const codes = response?.data?.extras?.result_codes;

  if (codes) {
    const resultCodes = [codes.transaction, ...(codes.operations ?? [])].filter(
      (code) => typeof code === 'string',
    );
    return new StellarTxError(
      `Stellar rechazó la transacción: ${resultCodes.join(', ')}`,
      resultCodes,
      resultCodes.includes('tx_bad_seq'),
    );
  }
  const status = response?.status;
  const retryable = status === undefined || status >= 500 || status === 429;
  const detail = err instanceof Error ? err.message : String(err);
  return new StellarTxError(`Error al hablar con Horizon: ${detail}`, [], retryable);
}

/**
 * Recorta una etiqueta a los 28 bytes que admite un memo de texto de Stellar. Se limita a ASCII
 * imprimible para no partir un carácter UTF-8 a mitad: las etiquetas del API son siempre ASCII.
 *
 * @param {string} text
 * @returns {string}
 */
export function shortMemo(text) {
  return String(text).replace(/[^\x20-\x7e]/g, ' ').slice(0, 28);
}

/**
 * Construye, firma y envía una transacción. `source` es la cuenta de la transacción (paga la comisión
 * y aporta el número de secuencia); `extraSigners` firman operaciones cuyo `source` es otra cuenta.
 * `memo` es la etiqueta legible que muestra el explorador junto al hash (no es un alias on-chain).
 * Reintenta una vez ante fallos de red o `tx_bad_seq`.
 */
export async function submit(source, ops, extraSigners = [], memo = null) {
  const signers = extraSigners.filter((kp) => kp.publicKey() !== source.publicKey());
  for (let attempt = 0; ; attempt++) {
    try {
      const account = await server.loadAccount(source.publicKey());
      const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK,
      });
      ops.forEach((op) => builder.addOperation(op));
      if (memo) builder.addMemo(Memo.text(shortMemo(memo)));
      const tx = builder.setTimeout(60).build();
      tx.sign(source, ...signers);
      const result = await server.submitTransaction(tx);
      return { hash: result.hash };
    } catch (err) {
      const stellarError = toStellarError(err);
      if (attempt === 0 && stellarError.retryable) continue;
      throw stellarError;
    }
  }
}

/** Fondea una cuenta de testnet con XLM de prueba (Friendbot). */
export async function fundWithFriendbot(publicKey) {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
  );
  if (!response.ok) {
    throw new StellarTxError(
      `Friendbot falló para ${publicKey} (HTTP ${response.status})`,
      [],
      false,
    );
  }
}

export async function accountExists(publicKey) {
  try {
    await server.loadAccount(publicKey);
    return true;
  } catch (err) {
    if (err.response?.status === 404) return false;
    throw toStellarError(err);
  }
}

/** Saldo de `asset` dentro de los `balances` de una cuenta de Horizon; undefined si no hay trustline. */
export function findBalance(balances, asset) {
  return balances.find(
    (balance) =>
      balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer(),
  );
}

/** Carga una cuenta de Horizon; si falla, lanza un StellarTxError con un mensaje claro. */
export async function loadAccount(publicKey) {
  try {
    return await server.loadAccount(publicKey);
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new StellarTxError(`La cuenta ${publicKey} no existe en Stellar.`, [], false);
    }
    throw toStellarError(err);
  }
}
