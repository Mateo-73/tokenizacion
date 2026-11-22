import { ArrowLeft, CalendarClock, MapPin, Warehouse, Wheat } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BuyPanel } from '../components/BuyPanel.jsx';
import { Button } from '../components/Button.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { SimulatedBadge } from '../components/SimulatedBadge.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { TraceTimeline } from '../components/TraceTimeline.jsx';
import { useToast } from '../components/Toast.jsx';
import { api } from '../lib/api.js';
import { errorMessage } from '../lib/errors.js';
import { amount, fractions } from '../lib/format.js';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

const artwork = { silo: { src: '/brand/silo.svg', label: 'Silo de acopio' }, campaign: { src: '/brand/campo.svg', label: 'Cultivo agrícola' } };

function AssetSkeleton() {
  return <section className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-12"><div><Skeleton className="aspect-[16/8]" /><Skeleton className="mt-6 h-9 w-3/4" /><Skeleton className="mt-4 h-4 w-1/2" /><Skeleton className="mt-10 h-40" /></div><Skeleton className="h-[480px]" /></section>;
}

export function AssetDetail() {
  const { id } = useParams();
  const { investor } = useAuth();
  const toast = useToast();
  const [asset, setAsset] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [trace, setTrace] = useState([]);
  const [traceStatus, setTraceStatus] = useState('loading');
  const [traceError, setTraceError] = useState('');
  usePageTitle(asset?.name ?? 'Ficha del activo');

  const loadAsset = useCallback(async (quiet = false) => {
    if (!quiet) setStatus('loading'); setError(null);
    try { setAsset(await api.getAsset(id)); setStatus('ready'); }
    catch (err) { setError(err); setStatus(err.code === 'NOT_FOUND' ? 'not-found' : 'error'); }
  }, [id]);
  const loadTrace = useCallback(async () => {
    setTraceStatus('loading');
    try { setTrace(await api.getTrace(id)); setTraceStatus('ready'); }
    catch (err) { setTraceError(errorMessage(err)); setTraceStatus('error'); }
  }, [id]);
  const loadBalance = useCallback(async () => {
    if (!investor) { setBalance(null); return; }
    try { const portfolio = await api.getPortfolio(investor.investorId); setBalance(portfolio.usdcBalance); }
    catch { setBalance(null); }
  }, [investor]);

  useEffect(() => { loadAsset(); loadTrace(); }, [loadAsset, loadTrace]);
  useEffect(() => { loadBalance(); }, [loadBalance]);

  if (status === 'loading') return <AssetSkeleton />;
  if (status === 'not-found') return <section className="container-page py-14 sm:py-20"><div className="mx-auto max-w-xl rounded-2xl border border-borde bg-white p-8 text-center shadow-soft"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-siembra-100 text-siembra-700"><Warehouse size={26} /></span><h1 className="mt-5 text-h2 font-semibold">No encontramos este activo</h1><p className="mt-3 text-texto-suave">El activo solicitado no existe o ya no está disponible.</p><Button to="/" className="mt-6">Volver a activos</Button></div></section>;
  if (status === 'error') return <section className="container-page py-10"><ErrorState error={error} onRetry={loadAsset} /></section>;

  const art = artwork[asset.type] ?? artwork.campaign;
  const soldPercent = asset.totalFractions ? Math.min(100, asset.soldFractions / asset.totalFractions * 100) : 0;
  const Icon = asset.type === 'silo' ? Warehouse : Wheat;
  const onPurchased = async () => { await Promise.all([loadAsset(true), loadBalance()]); toast.success('¡Compra confirmada! Ya eres parte de este activo.'); };

  return <div className="animate-fade-in">
    <section className="container-page pt-6 sm:pt-10"><Link to="/" className="-ml-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-siembra-700 transition hover:bg-siembra-100"><ArrowLeft size={16} />Volver a activos</Link>
      <header className="mt-3 overflow-hidden rounded-2xl border border-borde bg-white shadow-soft">
            <div className="relative aspect-[16/8] max-h-[440px] w-full overflow-hidden bg-siembra-100"><img src={asset.imageUrl ?? art.src} alt={`Ilustración: ${art.label}`} className="size-full object-cover" /><span className="absolute top-4 left-4"><SimulatedBadge className="shadow-soft" /></span></div>
            <div className="p-5 sm:p-8"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-siembra-100 px-3 py-1 text-xs font-semibold text-siembra-900"><Icon size={14} />{asset.type === 'silo' ? 'Infraestructura' : 'Campaña agrícola'}</span><span className="inline-flex items-center gap-1 text-sm text-texto-suave"><MapPin size={15} />{asset.location}</span></div><h1 className="mt-4 text-h2 font-semibold sm:text-h1">{asset.name}</h1><p className="mt-4 max-w-3xl text-sm leading-relaxed text-texto-suave sm:text-base">{asset.description}</p></div>
      </header>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <main className="order-2 min-w-0 lg:order-1">
          <section className="mt-8 rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-7"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-siembra-100 text-siembra-700"><CalendarClock size={20} /></span><div><h2 className="text-2xl font-semibold">Datos clave</h2><p className="mt-1 text-sm text-texto-suave">Información de ejemplo del activo.</p></div></div>
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3"><div><dt className="text-xs text-texto-suave">Fracciones totales</dt><dd className="tabular mt-1 text-lg font-semibold">{fractions(asset.totalFractions)}</dd></div><div><dt className="text-xs text-texto-suave">Fracciones vendidas</dt><dd className="tabular mt-1 text-lg font-semibold">{fractions(asset.soldFractions)}</dd></div><div><dt className="text-xs text-texto-suave">Disponibles</dt><dd className="tabular mt-1 text-lg font-semibold">{fractions(asset.availableFractions)}</dd></div><div><dt className="text-xs text-texto-suave">Precio por fracción</dt><dd className="tabular mt-1 text-lg font-semibold">{amount(asset.pricePerFraction)} <span className="text-xs font-medium text-texto-suave">USDC</span></dd></div><div className="col-span-2 sm:col-span-2"><dt className="text-xs text-texto-suave">Retorno simulado</dt><dd className="mt-1 text-sm font-semibold">{asset.returnLabelSimulated}</dd></div></dl>
            <div className="mt-6"><div className="tabular mb-2 flex justify-between gap-3 text-xs"><span className="font-semibold text-siembra-700">{Math.round(soldPercent)}% vendido</span><span className="text-texto-suave">{fractions(asset.soldFractions)} de {fractions(asset.totalFractions)}</span></div><div role="progressbar" aria-label="Fracciones vendidas" aria-valuemin={0} aria-valuemax={asset.totalFractions} aria-valuenow={asset.soldFractions} className="h-2.5 overflow-hidden rounded-full bg-siembra-100"><div className="h-full rounded-full bg-siembra-500 transition-[width] duration-200" style={{ width: `${soldPercent}%` }} /></div></div>
          </section>
          <section className="mt-8 pb-8"><div className="mb-5"><p className="text-sm font-semibold text-siembra-700">Del origen al activo</p><h2 className="mt-1 text-h2 font-semibold">Trazabilidad</h2><p className="mt-2 text-sm text-texto-suave">Hitos registrados y verificados para este activo.</p></div><TraceTimeline items={trace} status={traceStatus} error={traceError} /></section>
        </main>
        <aside className="order-1 lg:sticky lg:top-24 lg:order-2"><BuyPanel asset={asset} balance={balance} onPurchased={onPurchased} /></aside>
      </div>
    </section>
  </div>;
}
