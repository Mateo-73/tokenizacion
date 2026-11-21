import { findBalance, loadAccount, server, fractionAsset, usdcAsset } from './client.js';
import { loadKeys } from './keys.js';

/**
 * Portafolio de una wallet leído de Horizon (docs/03 §4.5): saldo de USDC y fracciones de los
 * activos emitidos por nuestro ISSUER. Stellar es la fuente de verdad: no se guarda nada aparte.
 *
 * @param {{ publicKey: string }} args
 * @returns {Promise<{ usdcBalance: string, holdings: { code: string, fractions: number }[] }>}
 */
export async function getPortfolio({ publicKey }) {
  const account = await loadAccount(publicKey);
  const issuer = loadKeys().ISSUER.publicKey();

  // Horizon ya devuelve los montos con 7 decimales ("500.0000000")
  const usdcBalance = findBalance(account.balances, usdcAsset())?.balance ?? '0.0000000';

  const holdings = account.balances
    .filter(
      (balance) =>
        balance.asset_issuer === issuer && Number(balance.balance) > 0 && balance.asset_code,
    )
    .map((balance) => ({ code: balance.asset_code, fractions: Number(balance.balance) }));

  return { usdcBalance, holdings };
}

/**
 * Tenedores de un asset (docs/03 §4.6), sin contar la cuenta DISTRIBUTOR (sus fracciones son las
 * que aún no se venden). Recorre todas las páginas de Horizon.
 *
 * @param {{ code: string }} args
 * @returns {Promise<{ publicKey: string, balance: number }[]>}
 */
export async function getHolders({ code }) {
  const asset = fractionAsset(code);
  const distributor = loadKeys().DISTRIBUTOR.publicKey();

  const holders = [];
  let page = await server.accounts().forAsset(asset).limit(200).call();
  while (page.records.length > 0) {
    for (const record of page.records) {
      const balance = Number(findBalance(record.balances, asset)?.balance ?? 0);
      if (record.account_id !== distributor && balance > 0) {
        holders.push({ publicKey: record.account_id, balance });
      }
    }
    page = await page.next();
  }
  return holders;
}
