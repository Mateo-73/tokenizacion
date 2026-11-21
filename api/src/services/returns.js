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

      // Cada pago, con el inversionista al que pertenece la wallet (null si no es de la base)
      const paid = payouts.map((payout) => ({
        investorId: ctx.store.findInvestorByPublicKey(payout.publicKey)?.id ?? null,
        publicKey: payout.publicKey,
        fractions: payout.fractions,
        usdc: payout.usdc,
        txHash: payout.txHash,
      }));

      ctx.store.addReturn({
        assetId: asset.id,
        period: input.period,
        totalUsdc: formatAmount(total),
        payouts: paid,
        txHashes,
        simulated: true,
      });

      return {
        assetId: asset.id,
        period: input.period,
        totalUsdc: formatAmount(total),
        simulated: true,
        payouts: paid.map(({ investorId, publicKey, fractions, usdc }) => ({
          investorId,
          publicKey,
          fractions,
          usdc,
        })),
        txHashes,
        explorerUrls: txHashes.map((hash) => ctx.stellar.explorerTx(hash)),
      };
    },
  };
}
