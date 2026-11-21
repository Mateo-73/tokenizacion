import { Operation } from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';
import { formatAmount, parseAmount } from '../money.js';
import { findBalance, loadAccount, submit, usdcAsset } from './client.js';
import { loadKeys } from './keys.js';
import { holderRecords } from './portfolio.js';

/** Máximo de pagos por transacción (el límite de Stellar es 100 operaciones). */
const BATCH_SIZE = 50;

const chunk = (items, size) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );

/**
 * Reparte un retorno entre los tenedores de un activo (docs/03 §4.6).
 *
 * Regla: el retorno total `totalUsdc` es para TODO el activo; cada tenedor cobra
 * `totalUsdc × (sus fracciones / totalFractions)`, redondeado hacia abajo a 7 decimales. La parte de
 * las fracciones sin vender NO se paga (queda en TREASURY, es del productor) y el DISTRIBUTOR no
 * cobra. Paga TREASURY, en lotes de máximo 50 pagos por transacción.
 *
 * Antes de enviar valida que todos los que cobran puedan recibir USDC y que TREASURY tenga fondos.
 *
 * @param {{ code: string, totalUsdc: string, totalFractions: number }} args
 * @returns {Promise<{
 *   txHashes: string[],
 *   payouts: { publicKey: string, fractions: number, usdc: string, txHash: string }[],
 * }>}
 */
export async function distributeReturns({ code, totalUsdc, totalFractions }) {
  const total = parseAmount(totalUsdc);
  if (total === null || total <= 0n) {
    throw new AppError('VALIDATION', 'totalUsdc debe ser un monto positivo como texto.');
  }
  if (!Number.isSafeInteger(totalFractions) || totalFractions < 1) {
    throw new AppError('VALIDATION', 'totalFractions debe ser un entero mayor o igual a 1.');
  }

  const keys = loadKeys();
  const usdc = usdcAsset();

  const holders = await holderRecords(code);
  const inCirculation = holders.reduce((sum, holder) => sum + holder.balance, 0);
  if (inCirculation > totalFractions) {
    throw new AppError(
      'STELLAR_ERROR',
      `Hay ${inCirculation} fracciones en circulación de ${code}, más que totalFractions (${totalFractions}).`,
    );
  }

  const due = holders
    .map((holder) => ({
      publicKey: holder.publicKey,
      fractions: holder.balance,
      stroops: (total * BigInt(holder.balance)) / BigInt(totalFractions),
      canReceive: Boolean(findBalance(holder.balances, usdc)),
    }))
    .filter((payout) => payout.stroops > 0n);

  if (due.length === 0) return { txHashes: [], payouts: [] };

  const cannotReceive = due.filter((payout) => !payout.canReceive);
  if (cannotReceive.length > 0) {
    throw new AppError(
      'STELLAR_ERROR',
      `Estas wallets no tienen trustline a USDC y no pueden cobrar: ${cannotReceive
        .map((payout) => payout.publicKey)
        .join(', ')}`,
    );
  }

  const needed = due.reduce((sum, payout) => sum + payout.stroops, 0n);
  const treasury = await loadAccount(keys.TREASURY.publicKey());
  const available = parseAmount(findBalance(treasury.balances, usdc)?.balance ?? '0') ?? 0n;
  if (needed > available) {
    throw new AppError(
      'INSUFFICIENT_USDC',
      `La tesorería tiene ${formatAmount(available)} USDC y el reparto necesita ${formatAmount(needed)}.`,
    );
  }

  const txHashes = [];
  const payouts = [];
  const batches = chunk(due, BATCH_SIZE);
  for (const [index, batch] of batches.entries()) {
    try {
      const { hash } = await submit(
        keys.TREASURY,
        batch.map((payout) =>
          Operation.payment({
            destination: payout.publicKey,
            asset: usdc,
            amount: formatAmount(payout.stroops),
          }),
        ),
      );
      txHashes.push(hash);
      for (const payout of batch) {
        payouts.push({
          publicKey: payout.publicKey,
          fractions: payout.fractions,
          usdc: formatAmount(payout.stroops),
          txHash: hash,
        });
      }
    } catch (err) {
      if (index === 0) throw err;
      // Los lotes anteriores ya se pagaron: hay que decirlo para no pagar dos veces al reintentar.
      throw new AppError(
        'STELLAR_ERROR',
        `Reparto incompleto: se pagaron ${index} de ${batches.length} lotes (${txHashes.join(', ')}). ` +
          `Falló el lote ${index + 1}: ${err.message}`,
      );
    }
  }
  return { txHashes, payouts };
}
