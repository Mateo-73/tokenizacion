import { formatAmount, parseAmount } from '../money.js';

export function createPortfolioService(ctx, { investors }) {
  return {
    async get(investorId) {
      const investor = investors.require(investorId);
      const { usdcBalance, holdings } = await ctx.stellar.getPortfolio({
        publicKey: investor.publicKey,
      });
      const returns = ctx.store.returnsFor(investor.id);

      return {
        investorId: investor.id,
        publicKey: investor.publicKey,
        usdcBalance,
        holdings: holdings.flatMap(({ code, fractions }) => {
          const asset = ctx.store.findAsset(code);
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
        returns: returns.map(({ assetId, period, usdc, txHash }) => ({
          assetId,
          period,
          usdc,
          txHash,
          explorerUrl: txHash ? ctx.stellar.explorerTx(txHash) : null,
        })),
      };
    },
  };
}
