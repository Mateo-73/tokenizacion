import { ASSETS } from './data/catalog.js';
import { SEED_TRACE } from './data/seed-trace.js';
import { createStore } from './data/store.js';
import { createServices } from './services/index.js';
import { createMockStellar } from './services/mock-stellar.js';

/**
 * Elige la implementación de Stellar.
 * TODO: cuando `api/src/stellar/index.js` exporte todas las funciones de `StellarPort`
 * (ver services/stellar-port.js), devolverla aquí en el modo real:
 *   import * as stellar from './stellar/index.js';  ->  return stellar;
 */
function loadStellar(config) {
  if (config.mockMode) return createMockStellar();
  throw new Error(
    'MOCK_MODE=false necesita api/src/stellar/index.js completo. Conéctalo en loadStellar (src/bootstrap.js).',
  );
}

/** Datos de ejemplo del modo mock: activos emitidos, hitos y un inversionista que ya compró. */
async function seedMock(ctx, services) {
  for (const asset of ASSETS) {
    await ctx.stellar.issueAsset({ code: asset.id, totalFractions: asset.totalFractions });
  }
  for (const milestone of SEED_TRACE) await services.trace.add(milestone);

  const { publicKey, secret } = await ctx.stellar.createDemoInvestor({ initialUsdc: '1000000' });
  ctx.store.addInvestor({
    investorId: 'inv_ejemplo',
    name: 'Inversionista de ejemplo',
    email: 'ejemplo@siembra.test',
    publicKey,
    secret,
  });
  const purchases = [
    { code: 'SILO01', fractions: 120, price: '50.0000000' },
    { code: 'SOYA01', fractions: 400, price: '25.0000000' },
  ];
  for (const { code, fractions, price } of purchases) {
    await ctx.stellar.authorizeInvestor({ investorSecret: secret, code });
    await ctx.stellar.buyFractions({
      investorSecret: secret,
      code,
      fractions,
      pricePerFraction: price,
    });
  }
}

export async function createRuntime(config) {
  const ctx = { config, stellar: loadStellar(config), store: createStore() };
  const services = createServices(ctx);
  if (config.mockMode) await seedMock(ctx, services);
  return { config, services };
}
