import { ASSETS, findAssetDef } from '../data/catalog.js';
import { AppError } from '../errors.js';
import type { AssetDef, AssetDto } from '../types.js';
import type { Context } from './context.js';

export function createAssetsService(ctx: Context) {
  /** Fracciones en manos de inversionistas, leídas de Stellar (nunca de la base propia). */
  async function soldFractions(code: string): Promise<number> {
    const holders = await ctx.stellar.getHolders({ code });
    return holders.reduce((sum, holder) => sum + holder.balance, 0);
  }

  async function toDto(def: AssetDef): Promise<AssetDto> {
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

    require(id: string): AssetDef {
      const def = findAssetDef(id);
      if (!def) throw new AppError('NOT_FOUND', `No existe el activo ${id}.`);
      return def;
    },

    list: () => Promise.all(ASSETS.map(toDto)),

    async get(id: string) {
      const def = findAssetDef(id);
      if (!def) throw new AppError('NOT_FOUND', `No existe el activo ${id}.`);
      return { ...(await toDto(def)), traceCount: ctx.store.traceFor(id).length };
    },
  };
}
