import { FlaskConical } from 'lucide-react';

export function SimulatedBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-simulado-bg px-3 py-1 text-xs font-semibold text-simulado-fg ${className}`}>
      <FlaskConical size={13} aria-hidden="true" />
      Datos de ejemplo
    </span>
  );
}
