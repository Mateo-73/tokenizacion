import { CircleAlert, CircleCheck, Coins, KeyRound, ListPlus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { m } from 'motion/react';
import { Button } from '../components/Button.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { TxLink } from '../components/TxLink.jsx';
import { VerifiedBadge } from '../components/VerifiedBadge.jsx';
import { api } from '../lib/api.js';
import { errorMessage } from '../lib/errors.js';
import { formatDate, formatPeriod, fractions, shortKey, usdc } from '../lib/format.js';
import { EASE_OUT } from '../lib/motion.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const TRACE_TYPES = [
  { value: 'siembra', label: 'Siembra' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'cosecha', label: 'Cosecha' },
  { value: 'almacenaje', label: 'Almacenaje' },
  { value: 'venta', label: 'Venta' },
];
const AMOUNT = /^\d+(\.\d{1,7})?$/;
const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;
const TITLE_MAX = 120;
const DESCRIPTION_MAX = 500;
const idle = { working: false, error: '', fieldErrors: {}, result: null };
const today = () => new Date().toISOString().slice(0, 10);
const reveal = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, ease: EASE_OUT } };
const PAYOUT_DELAYS = [0.08, 0.14, 0.19, 0.23, 0.26];

const controlClass = (error) =>
  `mt-1.5 min-h-11 w-full min-w-0 rounded-xl border bg-white px-3 text-texto outline-none placeholder:text-texto-suave transition-[border-color,box-shadow] duration-150 focus:border-siembra-500 focus:ring-3 focus:ring-siembra-500/20 ${
    error ? 'border-error' : 'border-borde'
  }`;

function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-error">
      {error}
    </p>
  );
}

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-texto">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClass(error)}
        {...props}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

function Select({ id, label, options, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-texto">
        {label}
      </label>
      <select id={id} className={controlClass(false)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormError({ message }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-4 flex animate-confirm-in items-start gap-2 rounded-xl border border-error/25 bg-error/5 p-3 text-sm text-error"
    >
      <CircleAlert size={18} className="shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function Result({ title, children }) {
  return (
    <m.div {...reveal} role="status" className="mt-5 rounded-xl border border-siembra-500/30 bg-siembra-100 p-4">
      <p className="flex items-center gap-2 font-semibold text-siembra-900">
        <CircleCheck size={18} className="shrink-0" aria-hidden="true" />
        {title}
      </p>
      {children}
    </m.div>
  );
}

function DistributionResult({ result, assetName }) {
  const count = result.payouts.length;
  return (
    <Result title="Retorno simulado repartido">
      <p className="tabular mt-1 text-sm wrap-anywhere text-siembra-900/80">
        {usdc(result.totalUsdc)} de {assetName} para {formatPeriod(result.period)}
      </p>
      {count === 0 ? (
        <p className="mt-3 text-sm text-siembra-900">Este activo aún no tiene tenedores, así que no se hizo ningún pago.</p>
      ) : (
        <>
          <p className="mt-3 text-sm font-semibold text-siembra-900">{count === 1 ? '1 pago' : `${fractions(count)} pagos`}</p>
          <ul className="mt-1 max-h-80 divide-y divide-siembra-700/10 overflow-y-auto overscroll-contain pr-1">
            {result.payouts.map((payout, index) => (
              <m.li
                key={`${payout.investorId ?? payout.publicKey}-${index}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.26, delay: PAYOUT_DELAYS[Math.min(index, PAYOUT_DELAYS.length - 1)], ease: EASE_OUT }}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm"
              >
                <span className="min-w-0 wrap-anywhere text-texto">
                  {payout.investorId || (
                    <span className="font-mono text-xs" title={payout.publicKey}>
                      {shortKey(payout.publicKey)}
                    </span>
                  )}
                  <span className="text-texto-suave">
                    {' '}
                    con {fractions(payout.fractions)} {Number(payout.fractions) === 1 ? 'fracción' : 'fracciones'}
                  </span>
                </span>
                <strong className="tabular font-semibold wrap-anywhere text-siembra-900">{usdc(payout.usdc)}</strong>
              </m.li>
            ))}
          </ul>
        </>
      )}
      {result.txHashes.map((hash, index) => (
        <div key={hash} className="mt-2 border-t border-siembra-700/10 pt-2">
          <p className="font-mono text-xs break-all text-texto-suave">{hash}</p>
          <TxLink explorerUrl={result.explorerUrls?.[index]} />
        </div>
      ))}
    </Result>
  );
}

function TraceResult({ result }) {
  return (
    <Result title="Hito agregado">
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold wrap-anywhere text-texto">{result.title}</p>
          <p className="text-sm text-texto-suave">{formatDate(result.date)}</p>
        </div>
        <VerifiedBadge verified={result.verified} explorerUrl={result.explorerUrl} />
      </div>
      <p className="mt-3 text-xs text-texto-suave">Hash del hito</p>
      <p className="font-mono text-xs break-all text-texto">{result.hash}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-4">
        <TxLink explorerUrl={result.explorerUrl} />
        <Link
          to={`/activo/${encodeURIComponent(result.assetId)}`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-siembra-700 underline-offset-4 hover:text-siembra-900 hover:underline"
        >
          Ver en la ficha del activo
        </Link>
      </div>
    </Result>
  );
}

function AdminSkeleton() {
  return (
    <section className="container-page py-8 sm:py-12" aria-busy="true">
      <span className="sr-only" role="status">
        Cargando administración
      </span>
      <div aria-hidden="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-10 w-64 max-w-full" />
        <Skeleton className="mt-8 h-32 rounded-2xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, description, children, ...props }) {
  return (
    <form noValidate className="min-w-0 rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6" {...props}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-siembra-100 text-siembra-700">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-2xl leading-tight font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-texto-suave">{description}</p>
        </div>
      </div>
      {children}
    </form>
  );
}

export function Admin() {
  usePageTitle('Administración');
  const keyRef = useRef(null);
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [adminKey, setAdminKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [distribution, setDistribution] = useState({ assetId: '', totalUsdc: '', period: today().slice(0, 7) });
  const [milestone, setMilestone] = useState({ assetId: '', type: 'siembra', title: '', date: today(), description: '' });
  const [distributionState, setDistributionState] = useState(idle);
  const [traceState, setTraceState] = useState(idle);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await api.getAssets();
      setAssets(list);
      const first = list[0]?.id ?? '';
      setDistribution((current) => ({ ...current, assetId: current.assetId || first }));
      setMilestone((current) => ({ ...current, assetId: current.assetId || first }));
      setStatus('ready');
    } catch (err) {
      setLoadError(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const requireKey = () => {
    if (adminKey.trim()) return true;
    setKeyError('Ingresa la clave de administrador.');
    keyRef.current?.focus();
    return false;
  };

  const handleAdminError = (err) => {
    if (err?.code === 'FORBIDDEN') {
      setKeyError(errorMessage(err));
      keyRef.current?.focus();
    }
    return errorMessage(err);
  };

  const submitDistribution = async (event) => {
    event.preventDefault();
    const totalUsdc = distribution.totalUsdc.trim().replace(',', '.');
    const fieldErrors = {};
    if (!AMOUNT.test(totalUsdc) || Number(totalUsdc) <= 0)
      fieldErrors.totalUsdc = 'Ingresa un monto mayor que cero, con hasta 7 decimales.';
    if (!PERIOD.test(distribution.period)) fieldErrors.period = 'Elige un período con el formato AAAA-MM.';
    setDistributionState({ ...idle, fieldErrors });
    if (Object.keys(fieldErrors).length || !requireKey()) return;
    setDistributionState({ ...idle, working: true });
    try {
      const result = await api.distribute({ assetId: distribution.assetId, totalUsdc, period: distribution.period }, adminKey);
      setDistributionState({ ...idle, result });
      setDistribution((current) => ({ ...current, totalUsdc: '' }));
    } catch (err) {
      setDistributionState({ ...idle, error: handleAdminError(err) });
    }
  };

  const submitTrace = async (event) => {
    event.preventDefault();
    const title = milestone.title.trim();
    const description = milestone.description.trim();
    const fieldErrors = {};
    if (!title) fieldErrors.title = 'Escribe un título.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(milestone.date)) fieldErrors.date = 'Elige una fecha.';
    if (!description) fieldErrors.description = 'Escribe una descripción.';
    setTraceState({ ...idle, fieldErrors });
    if (Object.keys(fieldErrors).length || !requireKey()) return;
    setTraceState({ ...idle, working: true });
    try {
      const result = await api.addTrace({ ...milestone, title, description }, adminKey);
      setTraceState({ ...idle, result });
      setMilestone((current) => ({ ...current, title: '', description: '' }));
    } catch (err) {
      setTraceState({ ...idle, error: handleAdminError(err) });
    }
  };

  if (status === 'loading') return <AdminSkeleton />;
  if (status === 'error') {
    return (
      <section className="container-page py-10">
        <ErrorState error={loadError} onRetry={load} />
      </section>
    );
  }

  const assetOptions = assets.map((asset) => ({ value: asset.id, label: asset.name }));
  const assetName = (id) => assets.find((asset) => asset.id === id)?.name ?? id;
  const updateDistribution = (field) => (event) => setDistribution((current) => ({ ...current, [field]: event.target.value }));
  const updateMilestone = (field) => (event) => setMilestone((current) => ({ ...current, [field]: event.target.value }));

  return (
    <section className="container-page py-8 sm:py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold text-siembra-700">Herramientas de la demo</p>
        <h1 className="mt-1 text-h2 font-semibold sm:text-h1">Administración</h1>
        <p className="mt-2 max-w-2xl text-texto-suave">
          Reparte retornos simulados entre los tenedores y registra hitos de trazabilidad en Stellar.
        </p>
      </header>

      <div className="mb-6 rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6">
        <label htmlFor="admin-key" className="flex items-center gap-2 text-sm font-semibold text-texto">
          <KeyRound size={18} className="text-siembra-700" aria-hidden="true" />
          Clave de administrador
        </label>
        <input
          ref={keyRef}
          id="admin-key"
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={adminKey}
          onChange={(event) => {
            setAdminKey(event.target.value);
            setKeyError('');
          }}
          aria-invalid={Boolean(keyError)}
          aria-describedby={keyError ? 'admin-key-error admin-key-note' : 'admin-key-note'}
          className={`${controlClass(keyError)} max-w-md`}
        />
        <FieldError id="admin-key-error" error={keyError} />
        <p id="admin-key-note" className="mt-2 text-xs text-texto-suave">
          Solo se usa en esta pestaña y no se guarda.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card
          icon={Coins}
          title="Repartir retorno"
          description="Pago simulado en USDC, proporcional a las fracciones de cada tenedor."
          onSubmit={submitDistribution}
        >
          <div className="mt-5 space-y-4">
            <Select
              id="dist-asset"
              label="Activo"
              options={assetOptions}
              value={distribution.assetId}
              onChange={updateDistribution('assetId')}
            />
            <Field
              id="dist-amount"
              label="Monto en USDC"
              inputMode="decimal"
              autoComplete="off"
              placeholder="2000"
              value={distribution.totalUsdc}
              onChange={updateDistribution('totalUsdc')}
              error={distributionState.fieldErrors.totalUsdc}
            />
            <Field
              id="dist-period"
              label="Período"
              type="month"
              placeholder="2026-12"
              value={distribution.period}
              onChange={updateDistribution('period')}
              error={distributionState.fieldErrors.period}
            />
            <Button type="submit" loading={distributionState.working} className="w-full">
              {distributionState.working ? 'Repartiendo…' : 'Repartir retorno'}
            </Button>
          </div>
          <FormError message={distributionState.error} />
          {distributionState.result && (
            <DistributionResult result={distributionState.result} assetName={assetName(distributionState.result.assetId)} />
          )}
        </Card>

        <Card icon={ListPlus} title="Agregar hito" description="El hash del hito queda registrado en Stellar." onSubmit={submitTrace}>
          <div className="mt-5 space-y-4">
            <Select
              id="trace-asset"
              label="Activo"
              options={assetOptions}
              value={milestone.assetId}
              onChange={updateMilestone('assetId')}
            />
            <Select id="trace-type" label="Tipo" options={TRACE_TYPES} value={milestone.type} onChange={updateMilestone('type')} />
            <Field
              id="trace-title"
              label="Título"
              maxLength={TITLE_MAX}
              value={milestone.title}
              onChange={updateMilestone('title')}
              error={traceState.fieldErrors.title}
            />
            <Field
              id="trace-date"
              label="Fecha"
              type="date"
              value={milestone.date}
              onChange={updateMilestone('date')}
              error={traceState.fieldErrors.date}
            />
            <div>
              <label htmlFor="trace-description" className="text-sm font-semibold text-texto">
                Descripción
              </label>
              <textarea
                id="trace-description"
                rows={3}
                maxLength={DESCRIPTION_MAX}
                value={milestone.description}
                onChange={updateMilestone('description')}
                aria-invalid={Boolean(traceState.fieldErrors.description)}
                aria-describedby={traceState.fieldErrors.description ? 'trace-description-error' : undefined}
                className={`${controlClass(traceState.fieldErrors.description)} py-2.5`}
              />
              <FieldError id="trace-description-error" error={traceState.fieldErrors.description} />
            </div>
            <Button type="submit" loading={traceState.working} className="w-full">
              {traceState.working ? 'Registrando hito…' : 'Agregar hito'}
            </Button>
          </div>
          <FormError message={traceState.error} />
          {traceState.result && <TraceResult result={traceState.result} />}
        </Card>
      </div>
    </section>
  );
}
