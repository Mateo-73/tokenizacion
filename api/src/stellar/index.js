// Capa Stellar (docs/03-stellar-modelo-de-activos.md §5): lo único que `services/` usa de la red.
// Es la implementación real de `StellarPort` (ver src/services/stellar-port.js); la versión
// simulada es src/services/mock-stellar.js. Aquí no hay stubs: cada función habla con Horizon.
//
// Solo esta carpeta importa `@stellar/stellar-sdk`. Montos siempre `string` con 7 decimales;
// los errores se lanzan como `Error` con `.code` (NOT_AUTHORIZED, INSUFFICIENT_USDC,
// INSUFFICIENT_FRACTIONS, STELLAR_ERROR, ...).

export { createDemoInvestor, setupAccounts } from './accounts.js';
export { authorizeInvestor, issueAsset } from './assets.js';
export { explorerTx } from './client.js';
export { getHolders, getPortfolio } from './portfolio.js';
export { distributeReturns } from './returns.js';
export { buyFractions } from './trading.js';
export { recordTrace, verifyTrace } from './trace.js';
