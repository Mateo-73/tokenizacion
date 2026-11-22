import { Check, CircleDot, Coins, Sprout, Truck, Warehouse, Wheat } from 'lucide-react';
import { formatDate } from '../lib/format.js';
import { VerifiedBadge } from './VerifiedBadge.jsx';
import { Skeleton } from './Skeleton.jsx';

const icons = { siembra: Sprout, insumos: Coins, cosecha: Wheat, almacenaje: Warehouse, venta: Truck };

export function TraceTimeline({ items = [], status = 'ready', error }) {
  if (status === 'loading') return <div className="space-y-4" aria-label="Cargando trazabilidad"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  if (status === 'error') return <p role="alert" className="rounded-xl border border-error/25 bg-white p-4 text-sm text-error">{error || 'No pudimos cargar la trazabilidad. Reintenta en unos segundos.'}</p>;
  if (!items.length) return <div className="rounded-2xl border border-dashed border-borde bg-white p-6 text-center text-sm text-texto-suave"><CircleDot className="mx-auto mb-2 text-siembra-500" />Aún no hay hitos de trazabilidad.</div>;

  return <ol className="relative ml-3 space-y-0 border-l border-borde pl-6">{items.map((item) => {
    const Icon = icons[item.type] ?? Check;
    return <li key={item.id} className="relative pb-7 last:pb-0"><span className="absolute -left-[2.05rem] top-0 flex size-8 items-center justify-center rounded-full border border-siembra-100 bg-white text-siembra-700"><Icon size={16} aria-hidden="true" /></span><article className="rounded-2xl border border-borde bg-white p-5 shadow-soft"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-siembra-700">{formatDate(item.date)}</p><h3 className="mt-1 text-lg font-semibold">{item.title}</h3></div><VerifiedBadge verified={item.verified} explorerUrl={item.explorerUrl} /></div><p className="mt-3 text-sm leading-relaxed text-texto-suave">{item.description}</p></article></li>;
  })}</ol>;
}
