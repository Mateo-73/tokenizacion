// Tipos de dominio, documentados con JSDoc (el proyecto es JavaScript).
// Las formas de respuesta de la API están en docs/04-api-contrato.md

/**
 * Activo del catálogo (lo que Stellar no guarda: textos, precio, etiquetas).
 * @typedef {object} AssetDef
 * @property {string} id código del asset en Stellar (SILO01, SOYA01)
 * @property {string} name
 * @property {'silo' | 'campaign'} type
 * @property {'agro'} vertical
 * @property {string} description
 * @property {string} location
 * @property {string | null} imageUrl
 * @property {number} totalFractions
 * @property {string} pricePerFraction monto como string con 7 decimales
 * @property {string} returnLabelSimulated
 * @property {'active'} status
 */

/**
 * @typedef {AssetDef & {
 *   soldFractions: number,
 *   availableFractions: number,
 *   issuer: string,
 *   simulated: true,
 * }} AssetDto
 */

export const TRACE_TYPES = ['siembra', 'insumos', 'cosecha', 'almacenaje', 'venta'];

/**
 * @typedef {object} TraceInput
 * @property {string} assetId
 * @property {'siembra' | 'insumos' | 'cosecha' | 'almacenaje' | 'venta'} type
 * @property {string} title
 * @property {string} date formato YYYY-MM-DD
 * @property {string} description
 */

/**
 * Hito guardado en db.json. `hash` (SHA-256 en hex, 64 caracteres) y `txHash` son null hasta que el
 * hito se registra en Stellar (`npm run seed`).
 * @typedef {TraceInput & {
 *   id: string,
 *   order: number,
 *   hash: string | null,
 *   txHash: string | null,
 *   simulated: true,
 * }} TraceMilestone
 */

/** @typedef {TraceMilestone & { explorerUrl: string | null, verified: boolean }} TraceDto */

/**
 * Inversionista demo custodial (Plan B). `secret` nunca sale en una respuesta ni en logs.
 * @typedef {object} Investor
 * @property {string} id inv_001
 * @property {string} name
 * @property {string} email
 * @property {string} publicKey
 * @property {string} secret
 * @property {string[]} authorizedAssets caché de conveniencia; la verdad es la trustline en Stellar
 * @property {string} createdAt
 */

/**
 * Un reparto de retornos, con un pago por tenedor (docs/05).
 * @typedef {object} Distribution
 * @property {string} id ret_001
 * @property {string} assetId
 * @property {string} period YYYY-MM
 * @property {string} totalUsdc
 * @property {{ investorId: string | null, publicKey: string, fractions: number, usdc: string, txHash: string }[]} payouts
 * @property {string[]} txHashes
 * @property {true} simulated
 * @property {string} createdAt
 */

/**
 * Dependencias compartidas por todos los servicios.
 * @typedef {object} Context
 * @property {import('./config.js').Config} config
 * @property {import('./services/stellar-port.js').StellarPort} stellar
 * @property {ReturnType<typeof import('./data/db.js').createStore>} store
 */
