import type { TraceInput } from '../types.js';

/**
 * Frontera entre Mateo (negocio) y Sebas (api/src/stellar/). Fuente de verdad de las firmas: docs/tecnico/03 §5.
 *
 * - Montos siempre `string` con hasta 7 decimales; fracciones siempre enteros.
 * - Los errores se lanzan como `Error` con `.code` (NOT_AUTHORIZED, INSUFFICIENT_USDC,
 *   INSUFFICIENT_FRACTIONS, STELLAR_ERROR).
 * - Implementaciones: `mock-stellar.ts` (MOCK_MODE=true) y, cuando Sebas la entregue,
 *   `api/src/stellar/index.ts`. Para conectarla, ver `loadStellar` en `bootstrap.ts`.
 */
export interface StellarPort {
  issueAsset(args: { code: string; totalFractions: number }): Promise<{ txHash: string }>;

  createDemoInvestor(args: { initialUsdc: string }): Promise<{ publicKey: string; secret: string }>;

  authorizeInvestor(args: { investorSecret: string; code: string }): Promise<{ txHash: string }>;

  buyFractions(args: {
    investorSecret: string;
    code: string;
    fractions: number;
    pricePerFraction: string;
  }): Promise<{ txHash: string; totalUsdc: string }>;

  getPortfolio(args: {
    publicKey: string;
  }): Promise<{ usdcBalance: string; holdings: { code: string; fractions: number }[] }>;

  /** Tenedores de un asset, sin contar la cuenta DISTRIBUTOR. */
  getHolders(args: { code: string }): Promise<{ publicKey: string; balance: number }[]>;

  /** `txHash` de cada pago es el de la transacción (lote) en la que viajó. */
  distributeReturns(args: { code: string; totalUsdc: string; totalFractions: number }): Promise<{
    txHashes: string[];
    payouts: { publicKey: string; fractions: number; usdc: string; txHash: string }[];
  }>;

  recordTrace(args: TraceInput & { order: number }): Promise<{ hash: string; txHash: string }>;

  /** `hash` es el hash recalculado del hito guardado; true si coincide con el registrado on-chain. */
  verifyTrace(args: { assetId: string; order: number; hash: string }): Promise<boolean>;

  /** URL al explorador, o null si no hay (modo mock). Es síncrona: solo arma una URL. */
  explorerTx(hash: string): string | null;
}
