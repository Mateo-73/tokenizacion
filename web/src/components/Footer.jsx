import { Orbit } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="mt-16 bg-siembra-900 text-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl" aria-label="Siembra, inicio">
            <img src="/brand/logo.svg" alt="" className="size-8" />
            <span className="font-display text-xl font-bold">Siembra</span>
          </Link>
          <p className="mt-4 max-w-md font-display text-xl leading-snug font-semibold text-white">
            Santa Cruz alimenta al mundo. Ahora el mundo puede invertir en Santa Cruz.
          </p>
        </div>
        <nav aria-label="Pie de página" className="-ml-3 flex gap-2 sm:-mr-3 sm:ml-0 sm:justify-end">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white">
            Activos
          </Link>
          <Link to="/portafolio" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white">
            Portafolio
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
            <Orbit size={16} aria-hidden="true" />
            Construido sobre Stellar
          </span>
          <span>Prototipo en testnet · Santa Cruz, Bolivia</span>
        </div>
      </div>
    </footer>
  );
}
