/**
 * Frontera entre la lógica de negocio (routes/ y services/) y la red (api/src/stellar/).
 * Fuente de verdad de las firmas: docs/03-stellar-modelo-de-activos.md §5.
 *
 * - Montos siempre `string` con hasta 7 decimales; fracciones siempre enteros.
 * - Los errores se lanzan como `Error` con `.code` (NOT_AUTHORIZED, INSUFFICIENT_USDC,
 *   INSUFFICIENT_FRACTIONS, STELLAR_ERROR).
 * - Implementaciones: `mock-stellar.js` (MOCK_MODE=true) y `api/src/stellar/index.js`
 *   (red real). Para elegir una, ver `loadStellar` en `bootstrap.js`.
 *
 * @typedef {object} StellarPort
 *
 * @property {(args: { code: string, totalFractions: number }) => Promise<{ txHash: string | null }>} issueAsset
 *   Idempotente: si el asset ya estaba emitido no emite nada y `txHash` es null.
 *
 * @property {(args: { initialUsdc: string }) => Promise<{ publicKey: string, secret: string }>} createDemoInvestor
 *
 * @property {(args: { investorSecret: string, code: string }) => Promise<{ txHash: string }>} authorizeInvestor
 *
 * @property {(args: {
 *   investorSecret: string,
 *   code: string,
 *   fractions: number,
 *   pricePerFraction: string,
 * }) => Promise<{ txHash: string, totalUsdc: string }>} buyFractions
 *
 * @property {(args: { publicKey: string }) => Promise<{
 *   usdcBalance: string,
 *   holdings: { code: string, fractions: number }[],
 * }>} getPortfolio
 *
 * @property {(args: { code: string }) => Promise<{ publicKey: string, balance: number }[]>} getHolders
 *   Tenedores de un asset, sin contar la cuenta DISTRIBUTOR.
 *
 * @property {(args: { code: string, totalUsdc: string, totalFractions: number }) => Promise<{
 *   txHashes: string[],
 *   payouts: { publicKey: string, fractions: number, usdc: string, txHash: string }[],
 * }>} distributeReturns
 *   El `txHash` de cada pago es el de la transacción (lote) en la que viajó.
 *
 * @property {(args: import('../types.js').TraceInput & { order: number }) => Promise<{ hash: string, txHash: string }>} recordTrace
 *
 * @property {(args: { assetId: string, order: number, hash: string }) => Promise<boolean>} verifyTrace
 *   `hash` es el hash recalculado del hito guardado; true si coincide con el registrado on-chain.
 *
 * @property {(hash: string) => string | null} explorerTx
 *   URL al explorador, o null si no hay (modo mock). Es síncrona: solo arma una URL.
 */

export {};
