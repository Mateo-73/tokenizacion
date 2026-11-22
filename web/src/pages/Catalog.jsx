import { ArrowDown, Coins, Info, ShieldCheck, Sprout, Wheat } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { m } from 'motion/react';
import { EASE_OUT } from '../lib/motion.js';
import { AssetCard, AssetCardSkeleton } from '../components/AssetCard.jsx';
import { Button } from '../components/Button.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { TESTNET_NOTICE } from '../components/TestnetNotice.jsx';
import { api } from '../lib/api.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const highlights = [
  { icon: Coins, title: 'Fracciones en USDC', text: 'Elige cuántas fracciones quieres y paga en USDC.' },
  { icon: ShieldCheck, title: 'Trazabilidad verificable', text: 'Cada hito del activo queda registrado en Stellar.' },
  { icon: Wheat, title: 'Retornos simulados', text: 'En este prototipo, los retornos son de ejemplo.' },
];

let heroPlayed = false;

function Hero() {
  const [play] = useState(() => !heroPlayed);
  useEffect(() => {
    heroPlayed = true;
  }, []);
  const reveal = (delay, rise) =>
    play ? { initial: { opacity: 0, y: rise }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: EASE_OUT } } : {};
  return (
    <section className="container-page pt-6 sm:pt-12">
      <div className="overflow-hidden rounded-2xl border border-borde bg-white shadow-soft">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center p-6 sm:p-12">
            <m.span
              {...reveal(0.04, 0)}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-siembra-100 px-3 py-1 text-xs font-semibold text-siembra-700"
            >
              <Sprout size={14} aria-hidden="true" />
              Capital para el agro cruceño
            </m.span>
            <m.h1 {...reveal(0, 14)} className="mt-4 text-h2 font-semibold tracking-tight sm:text-h1">
              El campo cruceño, abierto al mundo
            </m.h1>
            <m.p {...reveal(0.09, 10)} className="mt-4 max-w-md text-texto-suave">
              Compra fracciones de silos y campañas agrícolas de Santa Cruz en USDC, y verifica cada hito del activo en Stellar.
            </m.p>
            <m.div {...reveal(0.16, 6)} className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="#activos">
                Explorar activos
                <ArrowDown size={16} aria-hidden="true" />
              </Button>
            </m.div>
            <p className="mt-6 inline-flex w-fit items-start gap-2 rounded-xl bg-simulado-bg px-3 py-2 text-xs font-medium text-simulado-fg">
              <Info size={14} className="mt-px shrink-0" aria-hidden="true" />
              {TESTNET_NOTICE}
            </p>
          </div>
          <div className="relative order-first h-56 sm:h-72 lg:order-none lg:h-auto lg:min-h-96">
            <m.img
              {...(play
                ? { initial: { opacity: 0, scale: 1.04 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.9, ease: EASE_OUT } }
                : {})}
              src="/brand/hero.svg"
              alt="Ilustración de silos y cultivos en el campo cruceño"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        </div>
        <ul className="grid border-t border-borde sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-start gap-3 border-borde px-6 py-4 sm:py-6 not-last:border-b sm:not-last:border-r sm:not-last:border-b-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-siembra-100 text-siembra-700">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-siembra-900">{title}</p>
                <p className="mt-1 text-sm text-texto-suave">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Catalog() {
  usePageTitle();
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setAssets(await api.getAssets());
      setStatus('ready');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Hero />
      <section id="activos" className="container-page scroll-mt-24 pt-12 sm:pt-16" aria-busy={status === 'loading'}>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-siembra-700">Oportunidades de ejemplo</p>
            <h2 className="mt-1 text-h2 font-semibold">Activos del campo</h2>
          </div>
          {status === 'ready' && assets.length > 0 && (
            <p className="tabular text-sm text-texto-suave">
              {assets.length === 1 ? '1 activo disponible' : `${assets.length} activos disponibles`}
            </p>
          )}
        </div>

        {status === 'loading' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <span className="sr-only" role="status">
              Cargando activos
            </span>
            <AssetCardSkeleton />
            <AssetCardSkeleton />
          </div>
        )}
        {status === 'error' && <ErrorState error={error} onRetry={load} />}
        {status === 'ready' && assets.length === 0 && (
          <EmptyState
            title="Aún no hay activos publicados"
            description="Pronto podrás explorar silos y campañas agrícolas de Santa Cruz."
          />
        )}
        {status === 'ready' && assets.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {assets.map((asset, index) => (
              <AssetCard key={asset.id} asset={asset} index={index} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
