import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

export function TxLink({ explorerUrl, label = 'Ver transacción en el explorador', className = '' }) {
  if (!explorerUrl) return null;
  const hash = explorerUrl.split('/').filter(Boolean).pop();
  const linkClass =
    'inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-siembra-700 underline-offset-4 transition-colors duration-150 hover:text-siembra-900 hover:underline';

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-5 ${className}`}>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        title="StellarExpert muestra la hora en UTC y el memo en base64."
        className={linkClass}
      >
        {label}
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <Link to={`/tx/${hash}`} className={linkClass} title="Memo en claro y hora de Bolivia (UTC-4)">
        Ver detalle legible
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </span>
  );
}
