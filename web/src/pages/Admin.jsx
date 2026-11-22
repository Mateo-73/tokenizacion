import { CircleAlert, CircleCheck, KeyRound, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/Button.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { TxLink } from '../components/TxLink.jsx';
import { api } from '../lib/api.js';
import { errorMessage } from '../lib/errors.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const assetOptions = [{ id: 'SILO01', name: 'Silo de acopio' }, { id: 'SOYA01', name: 'Campaña de soya' }];
const traceTypes = ['siembra', 'insumos', 'cosecha', 'almacenaje', 'venta'];
const today = new Date().toISOString().slice(0, 10);

function Field({ label, error, className = '', ...props }) {
  const id = props.id || props.name;
  return <label htmlFor={id} className="block text-sm font-medium text-texto">{label}<input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`mt-1.5 min-h-11 w-full rounded-xl border ${error ? 'border-error' : 'border-borde'} bg-white px-3 text-texto shadow-soft outline-none focus:border-siembra-500 ${className}`} />{error && <span id={`${id}-error`} className="mt-1 block text-xs text-error">{error}</span>}</label>;
}

function AssetSelect({ value, onChange, name, assets }) {
  return <label className="block text-sm font-medium text-texto">Activo<select name={name} value={value} onChange={onChange} className="mt-1.5 min-h-11 w-full rounded-xl border border-borde bg-white px-3 text-texto shadow-soft outline-none focus:border-siembra-500">{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>;
}

function Result({ title, children }) { return <div role="status" aria-live="polite" className="mt-4 rounded-xl border border-siembra-500/30 bg-siembra-100 p-4"><p className="flex items-center gap-2 font-semibold text-siembra-900"><CircleCheck size={18} />{title}</p>{children}</div>; }

export function Admin() {
  usePageTitle('Administración');
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [adminKey, setAdminKey] = useState('');
  const [distribution, setDistribution] = useState({ assetId: 'SILO01', totalUsdc: '', period: today.slice(0, 7) });
  const [milestone, setMilestone] = useState({ assetId: 'SILO01', type: 'siembra', title: '', date: today, description: '' });
  const [distributionState, setDistributionState] = useState({ working: false, error: '', fieldErrors: {}, result: null });
  const [traceState, setTraceState] = useState({ working: false, error: '', fieldErrors: {}, result: null });
  const load = useCallback(async () => { setStatus('loading'); try { setAssets(await api.getAssets()); setStatus('ready'); } catch (err) { setLoadError(err); setStatus('error'); } }, []);
  useEffect(() => { load(); }, [load]);
  const updateDistribution = (event) => setDistribution((state) => ({ ...state, [event.target.name]: event.target.value }));
  const updateMilestone = (event) => setMilestone((state) => ({ ...state, [event.target.name]: event.target.value }));
  const submitDistribution = async (event) => {
    event.preventDefault();
    const fieldErrors = {};
    if (!distribution.totalUsdc || !Number.isFinite(Number(distribution.totalUsdc)) || Number(distribution.totalUsdc) <= 0) fieldErrors.totalUsdc = 'Ingresa un monto mayor que cero.';
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(distribution.period)) fieldErrors.period = 'Usa el formato AAAA-MM.';
    if (!adminKey.trim()) fieldErrors.adminKey = 'Ingresa la clave de administrador.';
    if (Object.keys(fieldErrors).length) { setDistributionState((s) => ({ ...s, fieldErrors, error: '', result: null })); return; }
    setDistributionState({ working: true, error: '', fieldErrors: {}, result: null });
    try { const result = await api.distribute({ ...distribution, totalUsdc: String(distribution.totalUsdc) }, adminKey); setDistributionState({ working: false, error: '', fieldErrors: {}, result }); }
    catch (err) { setDistributionState({ working: false, error: errorMessage(err), fieldErrors: {}, result: null }); }
  };
  const submitTrace = async (event) => {
    event.preventDefault();
    const fieldErrors = {};
    if (!milestone.title.trim()) fieldErrors.title = 'Escribe un título.';
    if (!milestone.description.trim()) fieldErrors.description = 'Escribe una descripción.';
    if (!milestone.date) fieldErrors.date = 'Selecciona una fecha.';
    if (!adminKey.trim()) fieldErrors.adminKey = 'Ingresa la clave de administrador.';
    if (Object.keys(fieldErrors).length) { setTraceState((s) => ({ ...s, fieldErrors, error: '', result: null })); return; }
    setTraceState({ working: true, error: '', fieldErrors: {}, result: null });
    try { const result = await api.addTrace(milestone, adminKey); setTraceState({ working: false, error: '', fieldErrors: {}, result }); }
    catch (err) { setTraceState({ working: false, error: errorMessage(err), fieldErrors: {}, result: null }); }
  };
  if (status === 'loading') return <section className="container-page space-y-5 py-10" aria-busy="true"><Skeleton className="h-14 w-80" /><Skeleton className="h-20" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[440px]" /><Skeleton className="h-[440px]" /></div></section>;
  if (status === 'error') return <section className="container-page py-10"><ErrorState error={loadError} onRetry={load} /></section>;
  const adminKeyError = distributionState.fieldErrors.adminKey || traceState.fieldErrors.adminKey;
  const options = assets.length ? assets : assetOptions;
  return <section className="container-page py-8 sm:py-12"><header className="mb-8"><p className="text-sm font-semibold text-siembra-700">Herramientas de operación</p><h1 className="mt-1 text-h1 font-semibold">Administración</h1><p className="mt-2 text-texto-suave">Las operaciones de retorno son simuladas y quedan reflejadas en el portafolio demo.</p></header>
    <div className="mb-6 rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6"><label htmlFor="adminKey" className="flex items-center gap-2 text-sm font-semibold text-texto"><KeyRound size={18} aria-hidden="true" />Clave de administrador</label><input id="adminKey" type="password" autoComplete="new-password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} className="mt-2 min-h-11 w-full max-w-xl rounded-xl border border-borde px-3 outline-none focus:border-siembra-500" aria-describedby={adminKeyError ? 'admin-key-error' : 'key-note'} aria-invalid={Boolean(adminKeyError)} />{adminKeyError && <p id="admin-key-error" role="alert" className="mt-1 text-xs text-error">{adminKeyError}</p>}<p id="key-note" className="mt-2 text-xs text-texto-suave">Se usa solo durante esta sesión y no se guarda.</p></div>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <form onSubmit={submitDistribution} noValidate className="rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6"><h2 className="text-2xl font-semibold">Repartir retorno</h2><p className="mb-5 mt-1 text-sm text-texto-suave">Distribución simulada entre los tenedores del activo.</p><div className="space-y-4"><AssetSelect assets={options} name="assetId" value={distribution.assetId} onChange={updateDistribution} /><Field label="Monto en USDC" id="totalUsdc" name="totalUsdc" inputMode="decimal" placeholder="2000" value={distribution.totalUsdc} onChange={updateDistribution} error={distributionState.fieldErrors.totalUsdc} /><Field label="Período" id="period" name="period" type="month" value={distribution.period} onChange={updateDistribution} error={distributionState.fieldErrors.period} /><Button type="submit" loading={distributionState.working} className="w-full">{distributionState.working ? 'Enviando reparto…' : 'Repartir retorno'}</Button></div>
        {distributionState.fieldErrors.adminKey && <p role="alert" className="mt-3 text-sm text-error">{distributionState.fieldErrors.adminKey}</p>}{distributionState.error && <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-error/5 p-3 text-sm text-error"><CircleAlert size={18} />{distributionState.error}</p>}
        {distributionState.result && <Result title="Retorno repartido"><p className="mt-1 text-sm text-siembra-900">{distributionState.result.payouts.length} pagos · {distributionState.result.period} · {distributionState.result.totalUsdc} USDC</p><ul className="mt-3 divide-y divide-siembra-700/10">{distributionState.result.payouts.map((payment, i) => <motion.li key={`${payment.investorId}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(i, 5) * 0.06 }} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><span>{payment.investorId} · {payment.fractions} fracciones</span><strong>{payment.usdc} USDC</strong></motion.li>)}</ul>{distributionState.result.txHashes.map((hash, i) => <div key={hash} className="mt-2"><p className="break-all text-xs text-texto-suave">Transacción: {hash}</p><TxLink explorerUrl={distributionState.result.explorerUrls[i]} /></div>)}</Result>}
      </form>
      <form onSubmit={submitTrace} noValidate className="rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6"><h2 className="text-2xl font-semibold">Agregar hito</h2><p className="mb-5 mt-1 text-sm text-texto-suave">Registra una novedad en la trazabilidad del activo.</p><div className="space-y-4"><AssetSelect assets={options} name="assetId" value={milestone.assetId} onChange={updateMilestone} /><label className="block text-sm font-medium text-texto">Tipo<select name="type" value={milestone.type} onChange={updateMilestone} className="mt-1.5 min-h-11 w-full rounded-xl border border-borde bg-white px-3">{traceTypes.map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select></label><Field label="Título" id="title" name="title" value={milestone.title} onChange={updateMilestone} error={traceState.fieldErrors.title} /><Field label="Fecha" id="date" name="date" type="date" value={milestone.date} onChange={updateMilestone} error={traceState.fieldErrors.date} /><label className="block text-sm font-medium text-texto">Descripción<textarea id="description" name="description" rows="3" value={milestone.description} onChange={updateMilestone} aria-invalid={Boolean(traceState.fieldErrors.description)} className={`mt-1.5 w-full rounded-xl border ${traceState.fieldErrors.description ? 'border-error' : 'border-borde'} p-3 outline-none focus:border-siembra-500`} />{traceState.fieldErrors.description && <span className="mt-1 block text-xs text-error">{traceState.fieldErrors.description}</span>}</label><Button type="submit" loading={traceState.working} className="w-full">{traceState.working ? 'Guardando hito…' : 'Agregar hito'}</Button></div>
        {traceState.fieldErrors.adminKey && <p role="alert" className="mt-3 text-sm text-error">{traceState.fieldErrors.adminKey}</p>}{traceState.error && <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-error/5 p-3 text-sm text-error"><CircleAlert size={18} />{traceState.error}</p>}{traceState.result && <Result title="Hito agregado"><p className="mt-1 font-semibold">{traceState.result.title}</p><p className="break-all text-xs text-texto-suave">Hash: {traceState.result.hash}</p><TxLink explorerUrl={traceState.result.explorerUrl} /></Result>}
      </form>
    </div>
  </section>;
}
