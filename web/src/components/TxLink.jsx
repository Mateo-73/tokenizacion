import { ArrowUpRight } from 'lucide-react';

export function TxLink({ explorerUrl, className = '' }) {
  if (!explorerUrl) return null;
  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-siembra-700 underline-offset-4 transition duration-150 hover:text-siembra-900 hover:underline ${className}`}
    >
      Ver transacción en el explorador
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}
