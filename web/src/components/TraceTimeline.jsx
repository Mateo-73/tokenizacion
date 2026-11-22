import { CircleDot, Coins, RotateCw, Sprout, Truck, Warehouse, Wheat } from 'lucide-react';
import { m } from 'motion/react';
import { EASE_OUT } from '../lib/motion.js';
import { errorMessage } from '../lib/errors.js';
import { formatDate } from '../lib/format.js';
import { Button } from './Button.jsx';
import { Skeleton } from './Skeleton.jsx';
import { VerifiedBadge } from './VerifiedBadge.jsx';

const ITEM_DELAYS = [0, 0.06, 0.1, 0.13];

const kinds = {
  siembra: { icon: Sprout, label: 'Siembra' },
  insumos: { icon: Coins, label: 'Insumos' },
  cosecha: { icon: Wheat, label: 'Cosecha' },
  almacenaje: { icon: Warehouse, label: 'Almacenaje' },
  venta: { icon: Truck, label: 'Venta' },
};

function TimelineSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1].map((key) => (
        <div key={key} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="rounded-2xl border border-borde bg-white p-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-5 w-3/5" />
            <Skeleton className="mt-4 h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TraceTimeline({ items = [], status = 'ready', error, onRetry }) {
  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">
          Cargando trazabilidad
        </span>
        <TimelineSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" className="rounded-2xl border border-error/25 bg-white p-5 text-center">
        <p className="text-sm font-medium text-texto">{errorMessage(error)}</p>
        {onRetry && (
          <Button variant="secondary" className="mt-4" onClick={onRetry}>
            <RotateCw size={16} aria-hidden="true" />
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-borde bg-white px-6 py-8 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-siembra-100 text-siembra-700">
          <CircleDot size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 font-semibold text-texto">Aún no hay hitos registrados</p>
        <p className="mt-1 text-sm text-texto-suave">Cada hito del activo aparecerá aquí con su sello de Stellar.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((item, index) => {
        const kind = kinds[item.type] ?? { icon: CircleDot, label: 'Hito' };
        const Icon = kind.icon;
        const last = index === items.length - 1;
        return (
          <m.li
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-48px' }}
            transition={{ duration: 0.3, delay: ITEM_DELAYS[Math.min(index, ITEM_DELAYS.length - 1)], ease: EASE_OUT }}
            className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-4"
          >
            {!last && <span className="absolute top-10 -bottom-4 left-[17.5px] w-px bg-borde" aria-hidden="true" />}
            <span className="relative flex size-9 items-center justify-center rounded-full border border-siembra-100 bg-white text-siembra-700 shadow-soft">
              <Icon size={17} aria-hidden="true" />
            </span>
            <article className="min-w-0 rounded-2xl border border-borde bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <p className="tabular flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-semibold text-siembra-700">{kind.label}</span>
                  <time dateTime={item.date} className="text-texto-suave">
                    {formatDate(item.date)}
                  </time>
                </p>
                <VerifiedBadge verified={item.verified} explorerUrl={item.explorerUrl} />
              </div>
              <h3 className="mt-2 text-lg leading-snug font-semibold wrap-anywhere">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm leading-relaxed wrap-anywhere text-texto-suave">{item.description}</p>}
            </article>
          </m.li>
        );
      })}
    </ol>
  );
}
