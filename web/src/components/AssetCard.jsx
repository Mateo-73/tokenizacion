import { ArrowRight, CalendarClock, MapPin, Warehouse, Wheat } from 'lucide-react';
import { Link } from 'react-router';
import { amount, fractions, percent } from '../lib/format.js';
import { SimulatedBadge } from './SimulatedBadge.jsx';
import { Skeleton } from './Skeleton.jsx';

const kinds = {
  silo: { label: 'Infraestructura', icon: Warehouse, art: '/brand/silo.svg', alt: 'Ilustración de silos de acopio en el campo' },
  campaign: { label: 'Campaña agrícola', icon: Wheat, art: '/brand/campo.svg', alt: 'Ilustración de un cultivo en el campo cruceño' },
};

export function AssetCard({ asset }) {
  const kind = kinds[asset.type] ?? kinds.campaign;
  const KindIcon = kind.icon;
  const soldOut = asset.availableFractions <= 0;
  const soldPercent = percent(asset.soldFractions, asset.totalFractions);
  const ratio = asset.totalFractions > 0 ? Math.min(100, (asset.soldFractions / asset.totalFractions) * 100) : 0;

  return (
    <article className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-borde bg-white shadow-soft transition-[border-color,box-shadow] duration-200 ease-out hover:border-siembra-500/40 hover:shadow-lift has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-siembra-500">
      <div className="relative aspect-[12/7] overflow-hidden bg-siembra-100">
        <img
          src={asset.imageUrl ?? kind.art}
          alt={kind.alt}
          className={`size-full object-cover ${soldOut ? 'opacity-60 grayscale-[40%]' : ''}`}
        />
        <div className="absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-2">
          {asset.simulated && <SimulatedBadge className="shadow-soft" />}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-siembra-900 shadow-soft">
            <KindIcon size={13} aria-hidden="true" />
            {kind.label}
          </span>
        </div>
        {soldOut && (
          <span className="absolute bottom-4 left-4 rounded-full bg-siembra-900 px-3 py-1 text-xs font-semibold text-white">Agotado</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl leading-snug font-semibold wrap-anywhere">
          <Link to={`/activo/${encodeURIComponent(asset.id)}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {asset.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-texto-suave">
          <MapPin size={14} className="shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{asset.location}</span>
        </p>
        <p className="mt-3 line-clamp-2 text-sm wrap-anywhere text-texto-suave">{asset.description}</p>

        <dl className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4 border-t border-borde pt-4">
          <div className="min-w-0">
            <dt className="text-xs text-texto-suave">Precio por fracción</dt>
            <dd className="tabular mt-1 text-xl font-semibold text-siembra-900">
              {amount(asset.pricePerFraction)} <span className="text-sm font-medium text-texto-suave">USDC</span>
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-texto-suave">Disponibles</dt>
            <dd className="tabular mt-1 text-xl font-semibold text-siembra-900">
              {fractions(asset.availableFractions)} <span className="text-sm font-medium text-texto-suave">fracciones</span>
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="tabular mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-xs">
            <span className="font-semibold text-siembra-700">{soldOut ? 'Todas vendidas' : `${soldPercent} vendido`}</span>
            <span className="text-texto-suave">
              {fractions(asset.soldFractions)} de {fractions(asset.totalFractions)} fracciones
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Fracciones vendidas"
            aria-valuemin={0}
            aria-valuemax={asset.totalFractions}
            aria-valuenow={asset.soldFractions}
            className="h-2 overflow-hidden rounded-full bg-siembra-100"
          >
            <div className="h-full rounded-full bg-siembra-500" style={{ width: `${ratio}%` }} />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <p className="flex min-w-0 items-start gap-1.5 text-sm text-texto-suave">
            <CalendarClock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {asset.returnLabelSimulated}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-siembra-700" aria-hidden="true">
            Ver activo
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-borde bg-white shadow-soft" aria-hidden="true">
      <Skeleton className="aspect-[12/7] rounded-none" />
      <div className="p-6">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="mt-3 h-4 w-2/5" />
        <Skeleton className="mt-4 h-4 w-full" />
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-borde pt-4">
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-6 w-28" />
          </div>
          <div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-32" />
          </div>
        </div>
        <Skeleton className="mt-6 h-2 w-full rounded-full" />
        <div className="mt-6 flex justify-between gap-4">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
