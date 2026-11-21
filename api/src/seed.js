/**
 * Prepara la red con los datos de la semilla (docs/09 §11): emite los activos del catálogo y
 * registra on-chain el hash de los hitos que aún no lo tienen. Idempotente.
 * Lo usan `scripts/seed.js` (Stellar real) y el arranque en modo mock (Stellar simulado).
 *
 * @param {{ stellar: import('./services/stellar-port.js').StellarPort, store: any, log?: (m: string) => void }} args
 */
export async function seedStellar({ stellar, store, log = () => {} }) {
  const assets = [];
  for (const asset of store.assets()) {
    const { txHash } = await stellar.issueAsset({
      code: asset.id,
      totalFractions: asset.totalFractions,
    });
    assets.push({ id: asset.id, txHash });
    log(
      txHash
        ? `${asset.id}: emitido (${asset.totalFractions} fracciones)`
        : `${asset.id}: ya estaba emitido (${asset.totalFractions} fracciones), no se repite`,
    );
  }

  const trace = [];
  for (const milestone of store.pendingTrace()) {
    const { hash, txHash } = await stellar.recordTrace({
      assetId: milestone.assetId,
      type: milestone.type,
      title: milestone.title,
      date: milestone.date,
      description: milestone.description,
      order: milestone.order,
    });
    store.setTraceHash(milestone.id, { hash, txHash });
    trace.push({ id: milestone.id, hash, txHash });
    log(`${milestone.assetId} hito ${milestone.order} (${milestone.title}): hash registrado`);
  }
  if (trace.length === 0) log('hitos de trazabilidad: todos ya estaban registrados');

  return { assets, trace };
}
