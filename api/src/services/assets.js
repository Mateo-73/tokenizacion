import { AppError } from '../errors.js';

export function createAssetsService(ctx) {
  /** Fracciones en manos de inversionistas, leídas de Stellar (nunca de la base propia). */
  async function soldFractions(code) {
    const holders = await ctx.stellar.getHolders({ code });
    return holders.reduce((sum, holder) => sum + holder.balance, 0);
  }

  /** Activo del catálogo (lo que Stellar no guarda: textos, precio, etiquetas). */
  function require(id) {
    const asset = ctx.store.findAsset(id);
    if (!asset) throw new AppError('NOT_FOUND', `No existe el activo ${id}.`);
    return asset;
  }

  async function toDto(asset) {
    const sold = await soldFractions(asset.id);
    return {
      ...asset,
      soldFractions: sold,
      availableFractions: asset.totalFractions - sold,
      issuer: ctx.config.issuerPublic,
      simulated: true,
    };
  }

  return {
    soldFractions,
    require,
    list: () => Promise.all(ctx.store.assets().map(toDto)),
    async get(id) {
      const asset = require(id);
      return { ...(await toDto(asset)), traceCount: ctx.store.traceFor(id).length };
    },
  };
}
