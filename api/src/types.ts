// Tipos de dominio. Las formas de respuesta están en docs/tecnico/04-api-contrato.md

export type AssetType = 'silo' | 'campaign';

/** Activo del catálogo (lo que Stellar no guarda: textos, precio, etiquetas). */
export interface AssetDef {
  id: string; // código del asset en Stellar (SILO01, SOYA01)
  name: string;
  type: AssetType;
  vertical: 'agro';
  description: string;
  location: string;
  imageUrl: string | null;
  totalFractions: number;
  pricePerFraction: string;
  returnLabelSimulated: string;
  status: 'active';
}

export interface AssetDto extends AssetDef {
  soldFractions: number;
  availableFractions: number;
  issuer: string;
  simulated: true;
}

export const TRACE_TYPES = ['siembra', 'insumos', 'cosecha', 'almacenaje', 'venta'] as const;
export type TraceType = (typeof TRACE_TYPES)[number];

export interface TraceInput {
  assetId: string;
  type: TraceType;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface TraceMilestone extends TraceInput {
  id: string;
  order: number;
  hash: string; // sha256 hex (64 caracteres)
  txHash: string;
  simulated: true;
}

export interface TraceDto extends TraceMilestone {
  explorerUrl: string | null;
  verified: boolean;
}

/** Inversionista demo custodial (Plan B). `secret` nunca sale en una respuesta. */
export interface Investor {
  investorId: string;
  name: string;
  email: string;
  publicKey: string;
  secret: string;
}

export interface ReturnRecord {
  assetId: string;
  investorId: string;
  period: string;
  usdc: string;
  txHash: string;
  explorerUrl: string | null;
}
