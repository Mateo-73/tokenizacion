import { createStore } from './data/db.js';
import { seedStellar } from './seed.js';
import { createServices } from './services/index.js';
import { createMockStellar } from './services/mock-stellar.js';
import * as stellar from './stellar/index.js';
import { loadKeys } from './stellar/keys.js';

/**
 * Elige la implementación de Stellar: la simulada en memoria (MOCK_MODE=true) o la red real
 * (api/src/stellar/, necesita api/.stellar-keys.json: `npm run setup:stellar` y `npm run seed`).
 */
function loadStellar(config) {
  return config.mockMode ? createMockStellar() : stellar;
}

/** Datos de ejemplo del modo mock: activos emitidos, hitos registrados y un inversionista que ya compró. */
async function seedMock(ctx) {
  await seedStellar({ stellar: ctx.stellar, store: ctx.store });

  const { publicKey, secret } = await ctx.stellar.createDemoInvestor({ initialUsdc: '1000000' });
  ctx.store.addInvestor({
    id: 'inv_ejemplo',
    name: 'Inversionista de ejemplo',
    email: 'ejemplo@siembra.test',
    publicKey,
    secret,
    authorizedAssets: [],
    createdAt: new Date().toISOString(),
  });
  const purchases = [
    { code: 'SILO01', fractions: 120, price: '50.0000000' },
    { code: 'SOYA01', fractions: 400, price: '25.0000000' },
  ];
  for (const { code, fractions, price } of purchases) {
    await ctx.stellar.authorizeInvestor({ investorSecret: secret, code });
    ctx.store.markAuthorized('inv_ejemplo', code);
    await ctx.stellar.buyFractions({
      investorSecret: secret,
      code,
      fractions,
      pricePerFraction: price,
    });
  }
}

export async function createRuntime(baseConfig) {
  // En modo real, el emisor sale de las claves generadas por `setup:stellar` si ISSUER_PUBLIC no está en el .env
  const config = baseConfig.mockMode
    ? baseConfig
    : { ...baseConfig, issuerPublic: baseConfig.issuerPublic || loadKeys().ISSUER.publicKey() };

  // Modo mock: datos solo en memoria (nunca toca db.json). Modo real: api/data/db.json.
  const store = createStore({ persist: !config.mockMode });
  const ctx = { config, stellar: loadStellar(config), store };
  const services = createServices(ctx);
  if (config.mockMode) await seedMock(ctx);
  return { config, services };
}
