import { FileText } from 'lucide-react';
import { useParams } from 'react-router';
import { ComingSoon } from '../components/ComingSoon.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export function AssetDetail() {
  const { id } = useParams();
  usePageTitle('Ficha del activo');
  return (
    <ComingSoon
      icon={FileText}
      eyebrow={id}
      title="Ficha del activo"
      description="Estamos preparando la ficha completa de este activo para que puedas conocerlo a fondo antes de invertir."
      features={[
        'Datos clave: fracciones totales, vendidas, precio y retorno simulado.',
        'Línea de tiempo de trazabilidad con el sello "Verificado en Stellar".',
        'Verificación de identidad y compra de fracciones en USDC.',
      ]}
    />
  );
}
