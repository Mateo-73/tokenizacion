import { Keypair, Operation } from '@stellar/stellar-sdk';
import { AppError } from '../errors.js';
import { findBalance, fractionAsset, loadAccount, server, submit } from './client.js';
import { loadKeys } from './keys.js';

/** Fracciones del asset que ya existen en la red (todas autorizadas, por AUTH_REQUIRED). */
async function mintedFractions(code) {
  const { records } = await server
    .assets()
    .forCode(code)
    .forIssuer(loadKeys().ISSUER.publicKey())
    .call();
  return Number(records[0]?.balances?.authorized ?? 0);
}

/**
 * Emite un activo: un inmueble/campaña = un asset de Stellar con `totalFractions` fracciones,
 * todas en la cuenta DISTRIBUTOR hasta que se vendan (docs/03 §4.2).
 * Idempotente: si ya existen todas las fracciones no emite nada y devuelve `txHash: null`.
 * Si quedó a medias (p. ej. se cortó entre pasos), completa lo que falta.
 *
 * @param {{ code: string, totalFractions: number }} args
 * @returns {Promise<{ txHash: string | null }>}
 */
export async function issueAsset({ code, totalFractions }) {
  const keys = loadKeys();
  const asset = fractionAsset(code);

  // 1) el distribuidor confía en el asset (se salta si ya hay trustline)
  const distributor = await loadAccount(keys.DISTRIBUTOR.publicKey());
  if (!findBalance(distributor.balances, asset)) {
    await submit(keys.DISTRIBUTOR, [Operation.changeTrust({ asset })]);
  }

  // 2) el emisor autoriza esa trustline (necesario por AUTH_REQUIRED; repetirlo no hace daño)
  await submit(keys.ISSUER, [
    Operation.setTrustLineFlags({
      trustor: keys.DISTRIBUTOR.publicKey(),
      asset,
      flags: { authorized: true },
    }),
  ]);

  // 3) el emisor "acuña" las fracciones que falten hacia el distribuidor
  const missing = totalFractions - (await mintedFractions(code));
  if (missing <= 0) return { txHash: null };
  const { hash } = await submit(keys.ISSUER, [
    Operation.payment({
      destination: keys.DISTRIBUTOR.publicKey(),
      asset,
      amount: String(missing),
    }),
  ]);
  return { txHash: hash };
}

/**
 * Convierte la clave secreta de un inversionista demo en un Keypair, con un error claro si es inválida.
 * @param {string} secret
 */
export function investorKeypair(secret) {
  try {
    return Keypair.fromSecret(secret);
  } catch {
    throw new AppError('STELLAR_ERROR', 'La clave secreta del inversionista no es válida.');
  }
}

/**
 * KYC simulado (docs/03 §4.3): el inversionista crea su trustline al asset y el emisor la autoriza.
 * Con AUTH_REQUIRED, sin esta autorización nadie puede tener fracciones. Repetirlo no hace daño.
 *
 * @param {{ investorSecret: string, code: string }} args
 * @returns {Promise<{ txHash: string }>}
 */
export async function authorizeInvestor({ investorSecret, code }) {
  const keys = loadKeys();
  const investor = investorKeypair(investorSecret);
  const asset = fractionAsset(code);

  if ((await mintedFractions(code)) === 0) {
    throw new AppError('NOT_FOUND', `El activo ${code} no está emitido (ejecuta npm run seed).`);
  }

  // En Plan B lo firma el backend con la clave demo del inversionista.
  const account = await loadAccount(investor.publicKey());
  if (!findBalance(account.balances, asset)) {
    await submit(investor, [Operation.changeTrust({ asset })]);
  }

  // El emisor autoriza la trustline = "KYC aprobado"
  const { hash } = await submit(keys.ISSUER, [
    Operation.setTrustLineFlags({
      trustor: investor.publicKey(),
      asset,
      flags: { authorized: true },
    }),
  ]);
  return { txHash: hash };
}
