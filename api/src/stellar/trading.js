import { Operation } from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';
import { formatAmount, parseAmount } from '../money.js';
import { investorKeypair } from './assets.js';
import {
  StellarTxError,
  findBalance,
  fractionAsset,
  loadAccount,
  submit,
  usdcAsset,
} from './client.js';
import { loadKeys } from './keys.js';

/** Traduce los códigos de Horizon de la compra a los errores del contrato (docs/04). */
function mapBuyError(err) {
  if (!(err instanceof StellarTxError)) return err;
  // resultCodes = [código de la transacción, ...código de cada operación]
  const [, usdcPayment, fractionsPayment] = err.resultCodes;
  if (usdcPayment === 'op_underfunded') {
    return new AppError('INSUFFICIENT_USDC', 'Saldo de USDC insuficiente.');
  }
  if (fractionsPayment === 'op_underfunded') {
    return new AppError('INSUFFICIENT_FRACTIONS', 'No hay suficientes fracciones disponibles.');
  }
  if (err.resultCodes.some((code) => code === 'op_no_trust' || code === 'op_not_authorized')) {
    return new AppError('NOT_AUTHORIZED', 'La wallet no está verificada para este activo.');
  }
  return err;
}

/**
 * Compra atómica de fracciones (docs/03 §4.4): UNA transacción con dos pagos y dos firmas
 * (pago de USDC del inversionista al distribuidor + pago de fracciones del distribuidor al
 * inversionista). Si falla uno, falla todo.
 *
 * Antes de enviar valida, en este orden: trustline autorizada, fracciones disponibles y saldo de
 * USDC, y lanza un Error con `.code` (NOT_AUTHORIZED, INSUFFICIENT_FRACTIONS, INSUFFICIENT_USDC).
 *
 * @param {{ investorSecret: string, code: string, fractions: number, pricePerFraction: string }} args
 * @returns {Promise<{ txHash: string, totalUsdc: string }>}
 */
export async function buyFractions({ investorSecret, code, fractions, pricePerFraction }) {
  if (!Number.isSafeInteger(fractions) || fractions < 1) {
    throw new AppError('VALIDATION', 'fractions debe ser un entero mayor o igual a 1.');
  }
  const price = parseAmount(pricePerFraction);
  if (price === null || price <= 0n) {
    throw new AppError('VALIDATION', 'pricePerFraction debe ser un monto positivo como texto.');
  }
  const total = price * BigInt(fractions);

  const keys = loadKeys();
  const investor = investorKeypair(investorSecret);
  const asset = fractionAsset(code);
  const usdc = usdcAsset();

  const [investorAccount, distributorAccount] = await Promise.all([
    loadAccount(investor.publicKey()),
    loadAccount(keys.DISTRIBUTOR.publicKey()),
  ]);

  const line = findBalance(investorAccount.balances, asset);
  if (!line || !line.is_authorized) {
    throw new AppError('NOT_AUTHORIZED', 'La wallet no está verificada para este activo.');
  }

  const available = Number(findBalance(distributorAccount.balances, asset)?.balance ?? 0);
  if (fractions > available) {
    throw new AppError(
      'INSUFFICIENT_FRACTIONS',
      `Solo quedan ${available} fracciones disponibles de ${code}.`,
    );
  }

  const usdcBalance =
    parseAmount(findBalance(investorAccount.balances, usdc)?.balance ?? '0') ?? 0n;
  if (total > usdcBalance) {
    throw new AppError('INSUFFICIENT_USDC', 'Saldo de USDC insuficiente.');
  }

  try {
    // La cuenta de la transacción es el distribuidor; el inversionista firma como `source` de su pago.
    const { hash } = await submit(
      keys.DISTRIBUTOR,
      [
        Operation.payment({
          source: investor.publicKey(),
          destination: keys.DISTRIBUTOR.publicKey(),
          asset: usdc,
          amount: formatAmount(total),
        }),
        Operation.payment({
          source: keys.DISTRIBUTOR.publicKey(),
          destination: investor.publicKey(),
          asset,
          amount: String(fractions),
        }),
      ],
      [investor],
    );
    return { txHash: hash, totalUsdc: formatAmount(total) };
  } catch (err) {
    throw mapBuyError(err);
  }
}
