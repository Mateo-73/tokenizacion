import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { fractions, usdc } from '../lib/format.js';
import { TxLink } from './TxLink.jsx';

export function PurchaseSuccess({ result }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [result]);

  const count = Number(result.fractions);

  return (
    <div
      ref={ref}
      role="status"
      className="mt-5 animate-confirm-in scroll-mb-6 rounded-xl border border-siembra-500/30 bg-siembra-100 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-siembra-700 text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" className="animate-check-draw" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-siembra-900">¡Compra confirmada! Ya eres parte de este activo.</p>
          <p className="tabular mt-1 text-sm text-siembra-900/80">
            {fractions(count)} {count === 1 ? 'fracción' : 'fracciones'} por {usdc(result.totalUsdc)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4">
            <TxLink explorerUrl={result.explorerUrl} />
            <Link
              to="/portafolio"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-siembra-700 underline-offset-4 transition-colors duration-150 hover:text-siembra-900 hover:underline"
            >
              Ver mi portafolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
