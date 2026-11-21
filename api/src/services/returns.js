import { formatAmount, parseAmount } from '../money.js';

export function createReturnsService(ctx, { assets }) {
  return {
    /**
     * Reparte un retorno SIMULADO entre los tenedores, proporcional a sus fracciones
     * sobre el total del activo (la parte sin vender no se paga).
     * `totalUsdc` ya viene validado como monto positivo por la capa de rutas.
     */
    async distribute(input) {
      const asset = assets.require(input.assetId);
      const total = parseAmount(input.totalUsdc) ?? 0n;

      const { txHashes, payouts } = await ctx.stellar.distributeReturns({
        code: asset.id,
        totalUsdc: formatAmount(total),
        totalFractions: asset.totalFractions,
      });

      const result = payouts.map((payout) => {
        const investor = ctx.store.findInvestorByPublicKey(payout.publicKey);
        if (investor) {
          ctx.store.addReturn({
            assetId: asset.id,
            investorId: investor.investorId,
            period: input.period,
            usdc: payout.usdc,
            txHash: payout.txHash,
            explorerUrl: ctx.stellar.explorerTx(payout.txHash),
          });
        }
        return {
          investorId: investor?.investorId ?? null,
          publicKey: payout.publicKey,
          fractions: payout.fractions,
          usdc: payout.usdc,
        };
      });

      return {
        assetId: asset.id,
        period: input.period,
        totalUsdc: formatAmount(total),
        simulated: true,
        payouts: result,
        txHashes,
        explorerUrls: txHashes.map((hash) => ctx.stellar.explorerTx(hash)),
      };
    },
  };
}
