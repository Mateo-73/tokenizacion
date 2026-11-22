import { Wallet } from 'lucide-react';
import { ComingSoon } from '../components/ComingSoon.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export function Portfolio() {
  usePageTitle('Portafolio');
  return (
    <ComingSoon
      icon={Wallet}
      title="Tu portafolio"
      description="Aquí verás en un solo lugar todo lo que tienes invertido en el campo cruceño."
      features={[
        'Tu saldo disponible en USDC.',
        'Las fracciones que tienes en cada activo y su valor.',
        'Los retornos simulados recibidos, con enlace a cada transacción.',
      ]}
    />
  );
}
