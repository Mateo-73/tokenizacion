import { ArrowRight, Wallet } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { m } from 'motion/react';
import { AnimatedAmount } from '../components/AnimatedAmount.jsx';
import { Button } from '../components/Button.jsx';
import { DemoLoginDialog } from '../components/DemoLoginDialog.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { useToast } from '../components/Toast.jsx';
import { TxLink } from '../components/TxLink.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { formatPeriod, fractions, usdc } from '../lib/format.js';
import { EASE_OUT } from '../lib/motion.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const SESSION_LOST = 'Tu sesión demo ya no existe en el servidor. Entra de nuevo para continuar.';
const CARD_DELAYS = [0, 0.06, 0.1];
const sum = (items, field) => items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
const reveal = (delay, rise = 10) => ({
  initial: { opacity: 0, y: rise },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay, ease: EASE_OUT },
});

function SimulatedTag() {
  return <span className="rounded-full bg-simulado-bg px-2.5 py-0.5 font-sans text-xs font-semibold text-simulado-fg">Simulado</span>;
}

function SummaryCard({ label, value, detail, index }) {
  return (
    <m.article {...reveal(CARD_DELAYS[index])} className="min-w-0 rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6">
      <p className="text-sm text-texto-suave">{label}</p>
      <p className="tabular mt-2 text-xl font-semibold wrap-anywhere text-siembra-900 lg:text-2xl">
        <AnimatedAmount value={value} countUp /> <span className="text-sm font-medium text-texto-suave">USDC</span>
      </p>
      {detail && <div className="mt-2 text-xs text-texto-suave">{detail}</div>}
    </m.article>
  );
}

function PortfolioSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <span role="status" className="sr-only">
        Cargando portafolio
      </span>
      <div className="grid gap-4 sm:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((key) => (
          <div key={key} className="rounded-2xl border border-borde bg-white p-5 sm:p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-7 w-36" />
          </div>
        ))}
      </div>
      <div aria-hidden="true">
        <Skeleton className="h-7 w-40" />
        <div className="mt-4 space-y-3 rounded-2xl border border-borde bg-white p-5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </div>
    </div>
  );
}

function HoldingLink({ holding }) {
  return (
    <Link
      to={`/activo/${encodeURIComponent(holding.assetId)}`}
      className="group inline-flex min-h-11 items-center gap-2 font-semibold wrap-anywhere text-siembra-700 hover:text-siembra-900"
    >
      <span className="underline-offset-4 group-hover:underline">{holding.name}</span>
      <ArrowRight size={15} className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

function Holdings({ holdings }) {
  if (!holdings.length) {
    return (
      <EmptyState
        icon={Wallet}
        title="Aún no tienes fracciones. Explora los activos."
        description="Cuando compres fracciones, aparecerán aquí con su valor y los retornos recibidos."
        actionLabel="Explorar activos"
        actionTo="/"
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-borde bg-white shadow-soft">
      <ul className="divide-y divide-borde sm:hidden">
        {holdings.map((holding) => (
          <li key={holding.assetId} className="px-5 py-4">
            <HoldingLink holding={holding} />
            <dl className="tabular mt-2 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-texto-suave">Fracciones</dt>
                <dd className="mt-0.5 font-semibold wrap-anywhere">{fractions(holding.fractions)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-texto-suave">Valor</dt>
                <dd className="mt-0.5 font-semibold wrap-anywhere">{usdc(holding.valueUsdc)}</dd>
              </div>
              <div className="col-span-2 min-w-0">
                <dt className="text-xs text-texto-suave">Retornos recibidos (simulados)</dt>
                <dd className="mt-0.5 font-semibold wrap-anywhere">{usdc(holding.returnsReceivedUsdc)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-fondo text-xs text-texto-suave">
            <tr>
              <th scope="col" className="min-w-56 px-5 py-3 font-semibold">
                Activo
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Fracciones
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Valor
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Retornos recibidos
              </th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding.assetId} className="border-t border-borde align-top">
                <td className="px-5 py-2">
                  <HoldingLink holding={holding} />
                </td>
                <td className="tabular px-5 py-4 text-right whitespace-nowrap">{fractions(holding.fractions)}</td>
                <td className="tabular px-5 py-4 text-right whitespace-nowrap">{usdc(holding.valueUsdc)}</td>
                <td className="tabular px-5 py-4 text-right whitespace-nowrap">{usdc(holding.returnsReceivedUsdc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Returns({ items, names }) {
  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-borde bg-white p-5 text-sm text-texto-suave">
        Aún no has recibido retornos. Cuando se reparta uno, verás aquí el pago y su transacción.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-borde rounded-2xl border border-borde bg-white px-5 shadow-soft">
      {items.map((item, index) => (
        <li key={`${item.txHash}-${item.assetId}-${index}`} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-4">
          <div className="min-w-0 flex-1 basis-48">
            <Link
              to={`/activo/${encodeURIComponent(item.assetId)}`}
              className="font-semibold wrap-anywhere text-siembra-700 underline-offset-4 hover:text-siembra-900 hover:underline"
            >
              {names[item.assetId] ?? item.assetId}
            </Link>
            <p className="mt-0.5 text-sm text-texto-suave">Período {formatPeriod(item.period)}</p>
          </div>
          <div className="min-w-0 sm:text-right">
            <p className="tabular font-semibold wrap-anywhere text-texto">{usdc(item.usdc)}</p>
            <TxLink explorerUrl={item.explorerUrl} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Portfolio() {
  usePageTitle('Portafolio');
  const { investor, logout } = useAuth();
  const toast = useToast();
  const [showLogin, setShowLogin] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const investorId = investor?.investorId;

  const load = useCallback(async () => {
    if (!investorId) return;
    setStatus('loading');
    try {
      setData(await api.getPortfolio(investorId));
      setStatus('ready');
    } catch (err) {
      if (err?.code === 'NOT_FOUND') {
        logout();
        toast.error(SESSION_LOST);
        return;
      }
      setError(err);
      setStatus('error');
    }
  }, [investorId, logout, toast]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  return (
    <>
      {investor ? (
        <PortfolioBody investor={investor} status={status} data={data} error={error} onRetry={load} />
      ) : (
        <SignedOut onLogin={() => setShowLogin(true)} />
      )}
      {showLogin && <DemoLoginDialog onClose={() => setShowLogin(false)} />}
    </>
  );
}

function SignedOut({ onLogin }) {
  return (
    <section className="container-page py-10 sm:py-14">
      <div className="rounded-2xl border border-dashed border-borde bg-white px-6 py-12 text-center">
        <m.span
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-siembra-100 text-siembra-700"
        >
          <Wallet size={28} aria-hidden="true" />
        </m.span>
        <h1 className="mt-4 text-h2 font-semibold">Tu portafolio</h1>
        <p className="mx-auto mt-2 max-w-md text-texto-suave">
          Entra como inversionista demo para ver tu saldo, tus fracciones y los retornos recibidos.
        </p>
        <Button className="mt-6" onClick={onLogin}>
          Entrar como inversionista demo
        </Button>
      </div>
    </section>
  );
}

function PortfolioBody({ investor, status, data, error, onRetry }) {
  const holdings = data?.holdings ?? [];
  const returns = data?.returns ?? [];
  const names = Object.fromEntries(holdings.map((holding) => [holding.assetId, holding.name]));

  return (
    <section className="container-page py-8 sm:py-12">
      <header className="mb-8 min-w-0">
        <p className="text-sm font-semibold wrap-anywhere text-siembra-700">Hola, {investor.name}</p>
        <h1 className="mt-1 text-h2 font-semibold sm:text-h1">Tu portafolio</h1>
        <p className="mt-2 text-texto-suave">Tu saldo, tus fracciones y los retornos simulados que recibiste.</p>
      </header>
      {status === 'loading' && <PortfolioSkeleton />}
      {status === 'error' && <ErrorState error={error} onRetry={onRetry} />}
      {status === 'ready' && data && (
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard index={0} label="USDC disponible" value={data.usdcBalance} detail="Saldo de prueba en testnet" />
            <SummaryCard index={1} label="Valor invertido" value={sum(holdings, 'valueUsdc')} detail="Según el precio de compra" />
            <SummaryCard index={2} label="Retornos recibidos" value={sum(returns, 'usdc')} detail={<SimulatedTag />} />
          </div>
          <m.section {...reveal(0.14, 8)} aria-labelledby="holdings-title">
            <h2 id="holdings-title" className="mb-4 text-2xl font-semibold">
              Mis activos
            </h2>
            <Holdings holdings={holdings} />
          </m.section>
          <m.section {...reveal(0.18, 8)} aria-labelledby="returns-title">
            <h2 id="returns-title" className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold">
              Retornos recibidos
              <SimulatedTag />
            </h2>
            <Returns items={returns} names={names} />
          </m.section>
        </div>
      )}
    </section>
  );
}
