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
 * @typedef {TraceInput & {
 *   id: string,
 *   order: number,
 *   hash: string,
 *   txHash: string,
 *   simulated: true,
 * }} TraceMilestone `hash` es SHA-256 en hex (64 caracteres)
 */

/** @typedef {TraceMilestone & { explorerUrl: string | null, verified: boolean }} TraceDto */

/**
 * Inversionista demo custodial (Plan B). `secret` nunca sale en una respuesta.
 * @typedef {object} Investor
 * @property {string} investorId
 * @property {string} name
 * @property {string} email
 * @property {string} publicKey
 * @property {string} secret
 */

/**
 * @typedef {object} ReturnRecord
 * @property {string} assetId
 * @property {string} investorId
 * @property {string} period
 * @property {string} usdc
 * @property {string} txHash
 * @property {string | null} explorerUrl
 */

/**
 * Dependencias compartidas por todos los servicios.
 * @typedef {object} Context
 * @property {import('./config.js').Config} config
 * @property {import('./services/stellar-port.js').StellarPort} stellar
 * @property {import('./data/store.js').Store} store
 */
