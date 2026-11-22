import { Check, CircleAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api.js';
import { errorMessage } from '../lib/errors.js';
import { usdc } from '../lib/format.js';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { Button } from './Button.jsx';
import { FractionSelector } from './FractionSelector.jsx';
import { TxLink } from './TxLink.jsx';

export function BuyPanel({ asset, balance, onPurchased }) {
  const { investor } = useAuth();
  const [fractions, setFractions] = useState(1);
  const [authorized, setAuthorized] = useState(false);
  const [authorization, setAuthorization] = useState(null);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [selectorError, setSelectorError] = useState('');
  const [success, setSuccess] = useState(null);

  const verify = async () => {
    if (!investor) return;
    setWorking('verify'); setError('');
    try {
      const result = await api.authorize({ investorId: investor.investorId, assetId: asset.id });
      setAuthorized(true); setAuthorization(result);
    } catch (err) { setError(errorMessage(err)); }
    finally { setWorking(''); }
  };

  const buy = async () => {
    setError(''); setSelectorError(''); setSuccess(null);
    if (!investor) { setError('Entra como inversionista demo para continuar.'); return; }
    if (!Number.isInteger(Number(fractions)) || Number(fractions) < 1) { setSelectorError('Ingresa al menos 1 fracción.'); return; }
    if (Number(fractions) > asset.availableFractions) { setSelectorError('No hay tantas fracciones disponibles.'); return; }
    if (!authorized) { setError('Primero verifica tu identidad para este activo.'); return; }
    setWorking('buy');
    try {
      const result = await api.buy({ investorId: investor.investorId, assetId: asset.id, fractions: Number(fractions) });
      setSuccess(result);
      await onPurchased(result);
    } catch (err) { setError(errorMessage(err)); }
    finally { setWorking(''); }
  };

  return <section className="rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6" aria-labelledby="buy-heading">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-siembra-700">Participa en el activo</p><h2 id="buy-heading" className="mt-1 text-2xl font-semibold">Comprar fracciones</h2></div><span className="flex size-10 items-center justify-center rounded-xl bg-siembra-100 text-siembra-700"><ShieldCheck size={20} /></span></div>
    {!investor ? <div className="mt-5 rounded-xl bg-fondo p-4 text-sm text-texto-suave">Entra como inversionista demo para verificar tu identidad y comprar.</div> : <>
      <div className="mt-5 flex items-center justify-between rounded-xl bg-fondo px-4 py-3 text-sm"><span className="text-texto-suave">Saldo disponible</span><strong className="tabular text-texto">{balance == null ? 'Cargando…' : usdc(balance)}</strong></div>
      <ol className="mt-6 space-y-5">
        <li className="border-l-2 border-siembra-100 pl-4"><p className="text-sm font-semibold"><span className="mr-2 text-siembra-700">1</span>Verificar identidad</p><p className="mt-1 text-xs text-texto-suave">Verificación simulada para este activo.</p><Button className="mt-3 w-full" variant={authorized ? 'secondary' : 'primary'} disabled={Boolean(working) || authorized} loading={working === 'verify'} onClick={verify}>{authorized ? <><Check size={16} />Identidad verificada (simulada)</> : 'Verificar identidad'}</Button>{authorization && <TxLink explorerUrl={authorization.explorerUrl} className="mt-1" />}</li>
        <li className="border-l-2 border-siembra-100 pl-4"><p className="mb-3 text-sm font-semibold"><span className="mr-2 text-siembra-700">2</span>Comprar</p><FractionSelector value={fractions} onChange={(value) => { setFractions(value); setSelectorError(''); }} available={asset.availableFractions} price={asset.pricePerFraction} disabled={Boolean(working)} error={selectorError} /><Button className="mt-4 w-full" disabled={Boolean(working) || !asset.availableFractions} loading={working === 'buy'} onClick={buy}>{working === 'buy' ? 'Enviando compra…' : 'Comprar fracciones'}</Button></li>
      </ol>
      {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-error/25 bg-error/5 p-3 text-sm text-error"><CircleAlert size={18} className="shrink-0" />{error}</p>}
      {success && <div aria-live="polite" className="mt-4 rounded-xl border border-siembra-500/30 bg-siembra-100/60 p-4"><p className="font-semibold text-siembra-900">¡Compra confirmada! Ya eres parte de este activo.</p><TxLink explorerUrl={success.explorerUrl} className="mt-1" /></div>}
    </>}
  </section>;
}
