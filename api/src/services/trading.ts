import { AppError } from '../errors.js';
import type { createAssetsService } from './assets.js';
import type { Context } from './context.js';
import type { createInvestorsService } from './investors.js';

type Deps = {
  assets: ReturnType<typeof createAssetsService>;
  investors: ReturnType<typeof createInvestorsService>;
};

export function createTradingService(ctx: Context, { assets, investors }: Deps) {
  return {
    /** KYC simulado: el emisor autoriza la trustline del inversionista para el activo. */
    async authorize(input: { investorId: string; assetId: string }) {
      const asset = assets.require(input.assetId);
      const investor = investors.require(input.investorId);
      const { txHash } = await ctx.stellar.authorizeInvestor({
        investorSecret: investor.secret,
        code: asset.id,
      });
      return {
        authorized: true,
        assetId: asset.id,
        txHash,
        explorerUrl: ctx.stellar.explorerTx(txHash),
        simulatedKyc: true,
      };
    },

    /** Compra atómica de fracciones pagando en USDC. */
    async buy(input: { investorId: string; assetId: string; fractions: number }) {
      const asset = assets.require(input.assetId);
      const investor = investors.require(input.investorId);

      const available = asset.totalFractions - (await assets.soldFractions(asset.id));
      if (input.fractions > available) {
        throw new AppError(
          'INSUFFICIENT_FRACTIONS',
          `Solo quedan ${available} fracciones disponibles de ${asset.id}.`,
        );
      }

      const { txHash, totalUsdc } = await ctx.stellar.buyFractions({
        investorSecret: investor.secret,
        code: asset.id,
        fractions: input.fractions,
        pricePerFraction: asset.pricePerFraction,
      });
      return {
        assetId: asset.id,
        fractions: input.fractions,
        totalUsdc,
        txHash,
        explorerUrl: ctx.stellar.explorerTx(txHash),
      };
    },
  };
}
