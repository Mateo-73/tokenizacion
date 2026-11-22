import { KeyRound } from 'lucide-react';
import { ComingSoon } from '../components/ComingSoon.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export function Admin() {
  usePageTitle('Administración');
  return (
    <ComingSoon
      icon={KeyRound}
      title="Administración"
      description="Herramientas para operar los activos durante la demo, protegidas con la clave de administrador."
      features={[
        'Reparto de retornos simulados entre los tenedores de un activo.',
        'Registro de nuevos hitos de trazabilidad.',
        'Resultado con los pagos y enlaces al explorador.',
      ]}
    />
  );
}
