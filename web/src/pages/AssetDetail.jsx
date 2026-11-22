import { ArrowLeft, MapPin, SearchX, Warehouse, Wheat } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BuyPanel } from '../components/BuyPanel.jsx';
import { Button } from '../components/Button.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { SimulatedBadge } from '../components/SimulatedBadge.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { TraceTimeline } from '../components/TraceTimeline.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { amount, fractions, percent } from '../lib/format.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const kinds = {
  silo: { label: 'Infraestructura', icon: Warehouse, art: '/brand/silo.svg', alt: 'Ilustración de silos de acopio en el campo' },
  campaign: { label: 'Campaña agrícola', icon: Wheat, art: '/brand/campo.svg', alt: 'Ilustración de un cultivo en el campo cruceño' },
};

const backLinkClass =
  'press -ml-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-siembra-700 hover:bg-siembra-100';

function DetailSkeleton() {
  return (
    <section className="container-page pt-6 sm:pt-10" aria-busy="true">
      <span className="sr-only" role="status">
        Cargando activo
      </span>
      <Skeleton className="h-11 w-40" />
      <div className="mt-3 overflow-hidden rounded-2xl border border-borde bg-white" aria-hidden="true">
        <Skeleton className="aspect-[16/7] rounded-none sm:aspect-[16/6]" />
        <div className="p-5 sm:p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-4 h-9 w-3/4" />
          <Skeleton className="mt-4 h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="order-first h-96 rounded-2xl lg:order-none" />
      </div>
    </section>
  );
}

function NotFoundAsset() {
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-borde bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-siembra-100 text-siembra-700">
          <SearchX size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-h2 font-semibold">No encontramos este activo</h1>
        <p className="mt-3 text-texto-suave">Puede que el enlace esté mal escrito o que el activo ya no esté publicado.</p>
        <Button to="/" className="mt-6">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a activos
        </Button>
      </div>
    </section>
  );
}

function KeyFact({ label, children, wide = false }) {
  return (
    <div className={`min-w-0 ${wide ? 'col-span-2' : ''}`}>
      <dt className="text-sm text-texto-suave">{label}</dt>
      <dd className="tabular mt-1 text-lg font-semibold wrap-anywhere text-texto">{children}</dd>
    </div>
  );
}

export function AssetDetail() {
  const { id } = useParams();
  const { investor } = useAuth();
  const [asset, setAsset] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [trace, setTrace] = useState([]);
  const [traceStatus, setTraceStatus] = useState('loading');
  const [traceError, setTraceError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balanceStatus, setBalanceStatus] = useState('idle');
  usePageTitle(status === 'not-found' ? 'Activo no encontrado' : (asset?.name ?? 'Ficha del activo'));

  const loadAsset = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setStatus('loading');
      try {
        setAsset(await api.getAsset(id));
        setStatus('ready');
      } catch (err) {
        setError(err);
        setStatus(err.code === 'NOT_FOUND' ? 'not-found' : 'error');
      }
    },
    [id],
  );

  const loadTrace = useCallback(async () => {
    setTraceStatus('loading');
    try {
      setTrace(await api.getTrace(id));
      setTraceStatus('ready');
    } catch (err) {
      setTraceError(err);
      setTraceStatus('error');
    }
  }, [id]);

  const investorId = investor?.investorId;
  const loadBalance = useCallback(async () => {
    if (!investorId) {
      setBalance(null);
      setBalanceStatus('idle');
      return;
    }
    setBalanceStatus((current) => (current === 'ready' ? current : 'loading'));
    try {
      const portfolio = await api.getPortfolio(investorId);
      setBalance(portfolio.usdcBalance);
      setBalanceStatus('ready');
    } catch {
      setBalance(null);
      setBalanceStatus('error');
    }
  }, [investorId]);

  useEffect(() => {
    loadAsset();
    loadTrace();
  }, [loadAsset, loadTrace]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  if (status === 'loading') return <DetailSkeleton />;
  if (status === 'not-found') return <NotFoundAsset />;
  if (status === 'error') {
    return (
      <section className="container-page py-10">
        <ErrorState error={error} onRetry={() => loadAsset()} />
      </section>
    );
  }

  const kind = kinds[asset.type] ?? kinds.campaign;
  const KindIcon = kind.icon;
  const ratio = asset.totalFractions > 0 ? Math.min(100, (asset.soldFractions / asset.totalFractions) * 100) : 0;
  const soldOut = asset.availableFractions < 1;
  const onPurchased = () => Promise.all([loadAsset({ quiet: true }), loadBalance()]);

  return (
    <div className="container-page pt-6 sm:pt-10">
      <Link to="/" className={backLinkClass}>
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a activos
      </Link>

      <header className="mt-3 overflow-hidden rounded-2xl border border-borde bg-white shadow-soft">
        <div className="relative aspect-[16/7] max-h-[400px] w-full overflow-hidden bg-siembra-100 sm:aspect-[16/6]">
          <img src={asset.imageUrl ?? kind.art} alt={kind.alt} className={`size-full object-cover ${soldOut ? 'opacity-70 grayscale-[40%]' : ''}`} />
          {asset.simulated && <SimulatedBadge className="absolute top-4 left-4 shadow-soft" />}
          {soldOut && <span className="absolute bottom-4 left-4 rounded-full bg-siembra-900 px-3 py-1 text-xs font-semibold text-white">Agotado</span>}
        </div>
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-siembra-100 px-3 py-1 text-xs font-semibold text-siembra-900">
              <KindIcon size={14} aria-hidden="true" />
              {kind.label}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-texto-suave">
              <MapPin size={15} className="shrink-0" aria-hidden="true" />
              <span className="wrap-anywhere">{asset.location}</span>
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-h2 font-semibold wrap-anywhere sm:text-h1">{asset.name}</h1>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6 lg:space-y-8">
          <section className="rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-8" aria-labelledby="facts-heading">
            <h2 id="facts-heading" className="text-2xl font-semibold">
              Sobre el activo
            </h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed wrap-anywhere text-texto-suave">{asset.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-borde pt-6 sm:grid-cols-4">
              <KeyFact label="Fracciones totales">{fractions(asset.totalFractions)}</KeyFact>
              <KeyFact label="Vendidas">{fractions(asset.soldFractions)}</KeyFact>
              <KeyFact label="Disponibles">{fractions(asset.availableFractions)}</KeyFact>
              <KeyFact label="Precio por fracción">
                {amount(asset.pricePerFraction)} <span className="text-sm font-medium text-texto-suave">USDC</span>
              </KeyFact>
            </dl>

            <div className="mt-6">
              <div className="tabular mb-2 flex flex-wrap justify-between gap-x-3 text-sm">
                <span className="font-semibold text-siembra-700">{soldOut ? 'Todas vendidas' : `${percent(asset.soldFractions, asset.totalFractions)} vendido`}</span>
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
                className="h-2.5 overflow-hidden rounded-full bg-siembra-100"
              >
                <div className="h-full origin-left rounded-full bg-siembra-500" style={{ width: `${ratio}%` }} />
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-simulado-bg p-4">
              <p className="text-sm font-medium text-simulado-fg">Retorno simulado</p>
              <p className="mt-0.5 font-semibold wrap-anywhere text-texto">{asset.returnLabelSimulated}</p>
            </div>
          </section>

          <section aria-labelledby="trace-heading">
            <h2 id="trace-heading" className="text-h2 font-semibold">
              Trazabilidad
            </h2>
            <p className="mt-2 mb-5 text-texto-suave">Cada hito del activo queda registrado con su hash en Stellar.</p>
            <TraceTimeline items={trace} status={traceStatus} error={traceError} onRetry={loadTrace} />
          </section>
        </div>

        <aside className="order-first lg:sticky lg:top-24 lg:order-none">
          <BuyPanel asset={asset} balance={balance} balanceStatus={balanceStatus} onPurchased={onPurchased} />
        </aside>
      </div>
    </div>
  );
}
