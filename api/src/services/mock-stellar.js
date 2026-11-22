import { randomBytes } from 'node:crypto';
import { AppError } from '../errors.js';
import { formatAmount, parseAmount } from '../money.js';

import { hashTrace } from '../trace-hash.js';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BATCH_SIZE = 50;

function fakeKey(prefix) {
  const chars = Array.from(randomBytes(55), (byte) => BASE32[byte % 32]).join('');
  return `${prefix}${chars}`;
}

const fakeTxHash = () => randomBytes(32).toString('hex');
const DISTRIBUTOR = fakeKey('G');

/**
 * Stellar simulado en memoria (MOCK_MODE=true): mismas reglas que la red real
 * (autorización, USDC, fracciones disponibles) pero sin tocar Stellar.
 * Los txHash son falsos y `explorerTx` devuelve null.
 */
export function createMockStellar() {
  const totals = new Map(); // code -> fracciones totales
  const accountsBySecret = new Map();
  const accountsByKey = new Map();
  const authorized = new Set(); // `${publicKey}|${code}`
  const balances = new Map(); // `${publicKey}|${code}` -> fracciones
  const onChainTrace = new Map(); // `${assetId}|${order}` -> hash

  const balanceKey = (publicKey, code) => `${publicKey}|${code}`;
  const balanceOf = (publicKey, code) => balances.get(balanceKey(publicKey, code)) ?? 0;

  function accountFor(secret) {
    const account = accountsBySecret.get(secret);
    if (!account) throw new AppError('STELLAR_ERROR', 'Cuenta de inversionista desconocida.');
    return account;
  }

  function amount(value) {
    const parsed = parseAmount(value);
    if (parsed === null) throw new AppError('STELLAR_ERROR', `Monto inválido: ${value}`);
    return parsed;
  }

  return {
    async issueAsset({ code, totalFractions }) {
      totals.set(code, totalFractions);
      balances.set(balanceKey(DISTRIBUTOR, code), totalFractions);
      return { txHash: fakeTxHash() };
    },

    async createDemoInvestor({ initialUsdc }) {
      const publicKey = fakeKey('G');
      const secret = fakeKey('S');
      const account = { publicKey, usdc: amount(initialUsdc) };
      accountsBySecret.set(secret, account);
      accountsByKey.set(publicKey, account);
      return { publicKey, secret };
    },

    async authorizeInvestor({ investorSecret, code }) {
      const account = accountFor(investorSecret);
      if (!totals.has(code)) throw new AppError('NOT_FOUND', `Activo ${code} no emitido.`);
      authorized.add(balanceKey(account.publicKey, code));
      return { txHash: fakeTxHash() };
    },

    async buyFractions({ investorSecret, code, fractions, pricePerFraction }) {
      const account = accountFor(investorSecret);
      if (!authorized.has(balanceKey(account.publicKey, code))) {
        throw new AppError('NOT_AUTHORIZED', 'La wallet no está verificada para este activo.');
      }
      if (fractions > balanceOf(DISTRIBUTOR, code)) {
        throw new AppError('INSUFFICIENT_FRACTIONS', 'No hay suficientes fracciones disponibles.');
      }
      const total = amount(pricePerFraction) * BigInt(fractions);
      if (total > account.usdc) {
        throw new AppError('INSUFFICIENT_USDC', 'Saldo de USDC insuficiente.');
      }
      // Transacción atómica: todas las comprobaciones pasaron, ahora se aplican los dos pagos.
      account.usdc -= total;
      balances.set(balanceKey(DISTRIBUTOR, code), balanceOf(DISTRIBUTOR, code) - fractions);
      balances.set(
        balanceKey(account.publicKey, code),
        balanceOf(account.publicKey, code) + fractions,
      );
      return { txHash: fakeTxHash(), totalUsdc: formatAmount(total) };
    },

    async getPortfolio({ publicKey }) {
      const account = accountsByKey.get(publicKey);
      if (!account) throw new AppError('STELLAR_ERROR', 'Cuenta desconocida.');
      const holdings = [...totals.keys()]
        .map((code) => ({ code, fractions: balanceOf(publicKey, code) }))
        .filter((holding) => holding.fractions > 0);
      return { usdcBalance: formatAmount(account.usdc), holdings };
    },

    async getHolders({ code }) {
      return [...accountsByKey.keys()]
        .map((publicKey) => ({ publicKey, balance: balanceOf(publicKey, code) }))
        .filter((holder) => holder.balance > 0);
    },

    async distributeReturns({ code, totalUsdc, totalFractions }) {
      const total = amount(totalUsdc);
      const holders = [...accountsByKey.keys()]
        .map((publicKey) => ({ publicKey, balance: balanceOf(publicKey, code) }))
        .filter((holder) => holder.balance > 0);

      // Solo se paga a quien tiene fracciones; la parte sin vender queda en TREASURY.
      const due = holders
        .map((holder) => ({
          publicKey: holder.publicKey,
          fractions: holder.balance,
          stroops: (total * BigInt(holder.balance)) / BigInt(totalFractions),
        }))
        .filter((payout) => payout.stroops > 0n);

      const txHashes = [];
      const payouts = due.map((payout, index) => {
        if (index % BATCH_SIZE === 0) txHashes.push(fakeTxHash());
        const account = accountsByKey.get(payout.publicKey);
        if (account) account.usdc += payout.stroops;
        return {
          publicKey: payout.publicKey,
          fractions: payout.fractions,
          usdc: formatAmount(payout.stroops),
          txHash: txHashes[txHashes.length - 1] ?? '',
        };
      });
      return { txHashes, payouts };
    },

    async recordTrace(args) {
      const hash = hashTrace(args);
      onChainTrace.set(`${args.assetId}|${args.order}`, hash);
      return { hash, txHash: fakeTxHash() };
    },

    async verifyTrace({ assetId, order, hash }) {
      return onChainTrace.get(`${assetId}|${order}`) === hash;
    },

    explorerTx: () => null,
  };
}
