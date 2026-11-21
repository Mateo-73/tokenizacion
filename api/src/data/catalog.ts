import type { AssetDef } from '../types.js';

// Datos de ejemplo de docs/proyecto/00-vision-y-alcance.md. Todo es simulado.
export const ASSETS: readonly AssetDef[] = [
  {
    id: 'SILO01',
    name: 'Silo de acopio, Santa Cruz (ejemplo)',
    type: 'silo',
    vertical: 'agro',
    description: 'Infraestructura de acopio de granos. Datos de ejemplo.',
    location: 'Santa Cruz, Bolivia',
    imageUrl: null,
    totalFractions: 1000,
    pricePerFraction: '50.0000000',
    returnLabelSimulated: 'Renta de almacenaje simulada, pago periódico',
    status: 'active',
  },
  {
    id: 'SOYA01',
    name: 'Campaña de soya verano 2026/27, 200 ha (ejemplo)',
    type: 'campaign',
    vertical: 'agro',
    description: 'Participación en una campaña de soya de 200 hectáreas. Datos de ejemplo.',
    location: 'Santa Cruz, Bolivia',
    imageUrl: null,
    totalFractions: 2000,
    pricePerFraction: '25.0000000',
    returnLabelSimulated: 'Pago único simulado al vender la cosecha',
    status: 'active',
  },
];

export function findAssetDef(id: string): AssetDef | undefined {
  return ASSETS.find((asset) => asset.id === id);
}
