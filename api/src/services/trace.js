import { hashTrace } from '../trace-hash.js';

export function createTraceService(ctx, { assets }) {
  /** `verified`: el hash recalculado del hito guardado coincide con el registrado en Stellar. */
  async function toDto(milestone) {
    const verified = await ctx.stellar.verifyTrace({
      assetId: milestone.assetId,
      order: milestone.order,
      hash: hashTrace(milestone),
    });
    return { ...milestone, explorerUrl: ctx.stellar.explorerTx(milestone.txHash), verified };
  }

  return {
    async list(assetId) {
      assets.require(assetId);
      return Promise.all(ctx.store.traceFor(assetId).map(toDto));
    },

    /** Agrega un hito; `order` se asigna automáticamente (siguiente número del activo). */
    async add(input) {
      assets.require(input.assetId);
      const existing = ctx.store.traceFor(input.assetId);
      const order = (existing[existing.length - 1]?.order ?? 0) + 1;

      const { hash, txHash } = await ctx.stellar.recordTrace({ ...input, order });
      const milestone = {
        id: ctx.store.nextTraceId(),
        ...input,
        order,
        hash,
        txHash,
        simulated: true,
      };
      ctx.store.addTrace(milestone);
      return toDto(milestone);
    },
  };
}
