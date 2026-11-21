import { ASSETS, findAssetDef } from '../data/catalog.js';
import { AppError } from '../errors.js';

export function createAssetsService(ctx) {
  /** Fracciones en manos de inversionistas, leídas de Stellar (nunca de la base propia). */
  async function soldFractions(code) {
    const holders = await ctx.stellar.getHolders({ code });
    return holders.reduce((sum, holder) => sum + holder.balance, 0);
  }

  async function toDto(def) {
    const sold = await soldFractions(def.id);
    return {
      ...def,
      soldFractions: sold,
      availableFractions: def.totalFractions - sold,
      issuer: ctx.config.issuerPublic,
      simulated: true,
    };
  }

  return {
    soldFractions,

    require(id) {
      const def = findAssetDef(id);
      if (!def) throw new AppError('NOT_FOUND', `No existe el activo ${id}.`);
      return def;
    },

    list: () => Promise.all(ASSETS.map(toDto)),

    async get(id) {
      const def = findAssetDef(id);
      if (!def) throw new AppError('NOT_FOUND', `No existe el activo ${id}.`);
      return { ...(await toDto(def)), traceCount: ctx.store.traceFor(id).length };
    },
  };
}
