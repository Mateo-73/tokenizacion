import { findAssetDef } from '../data/catalog.js';
import { formatAmount, parseAmount } from '../money.js';
import type { Context } from './context.js';
import type { createInvestorsService } from './investors.js';

export function createPortfolioService(
  ctx: Context,
  { investors }: { investors: ReturnType<typeof createInvestorsService> },
) {
  return {
    async get(investorId: string) {
      const investor = investors.require(investorId);
      const { usdcBalance, holdings } = await ctx.stellar.getPortfolio({
        publicKey: investor.publicKey,
      });
      const returns = ctx.store.returnsFor(investor.investorId);

      return {
        investorId: investor.investorId,
        publicKey: investor.publicKey,
        usdcBalance,
        holdings: holdings.flatMap(({ code, fractions }) => {
          const asset = findAssetDef(code);
          if (!asset) return []; // assets ajenos a nuestro catálogo no se muestran
          const price = parseAmount(asset.pricePerFraction) ?? 0n;
          const received = returns
            .filter((r) => r.assetId === code)
            .reduce((sum, r) => sum + (parseAmount(r.usdc) ?? 0n), 0n);
          return [
            {
              assetId: code,
              name: asset.name,
              fractions,
              pricePerFraction: asset.pricePerFraction,
              valueUsdc: formatAmount(price * BigInt(fractions)),
              returnsReceivedUsdc: formatAmount(received),
            },
          ];
        }),
        returns: returns.map(({ assetId, period, usdc, txHash, explorerUrl }) => ({
          assetId,
          period,
          usdc,
          txHash,
          explorerUrl,
        })),
      };
    },
  };
}
