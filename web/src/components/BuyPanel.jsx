import { CircleAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { m } from 'motion/react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { useAuthorization } from '../lib/auth/authorization.js';
import { errorMessage } from '../lib/errors.js';
import { fractions as formatFractions, usdc } from '../lib/format.js';
import { EASE_OUT } from '../lib/motion.js';
import { AnimatedAmount } from './AnimatedAmount.jsx';
import { Button } from './Button.jsx';
import { DemoLoginDialog } from './DemoLoginDialog.jsx';
import { FractionSelector } from './FractionSelector.jsx';
import { PurchaseSuccess } from './PurchaseSuccess.jsx';
import { TxLink } from './TxLink.jsx';

const SESSION_LOST = 'Tu sesión demo ya no existe en el servidor. Entra de nuevo para continuar.';
const swap = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.24, ease: EASE_OUT } };

function Step({ number, title, done, children }) {
  return (
    <li className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
      <span
        className={`flex size-7 items-center justify-center rounded-full border text-xs font-semibold tabular transition-colors duration-200 ${
          done ? 'border-siembra-700 bg-siembra-700 text-white' : 'border-siembra-700 text-siembra-700'
        }`}
        aria-hidden="true"
      >
        {number}
      </span>
      <div className="min-w-0">
        <h3 className="font-sans text-sm leading-7 font-semibold text-texto">{title}</h3>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  );
}

export function BuyPanel({ asset, balance, balanceStatus, onPurchased }) {
  const { investor, logout } = useAuth();
  const {
    authorized,
    verificationResult,
    verify: verifyIdentity,
    clear: clearAuthorization,
  } = useAuthorization(investor?.investorId, asset.id);
  const [count, setCount] = useState(1);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [selectorError, setSelectorError] = useState('');
  const [success, setSuccess] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [owner, setOwner] = useState(investor?.investorId);
  const soldOut = asset.availableFractions < 1;

  if (owner !== investor?.investorId) {
    setOwner(investor?.investorId);
    setSuccess(null);
    setSelectorError('');
    if (investor) setError('');
  }

  const fail = (err) => {
    if (err?.code === 'NOT_FOUND') {
      logout();
      setError(SESSION_LOST);
      return;
    }
    if (err?.code === 'NOT_AUTHORIZED') clearAuthorization();
    setError(errorMessage(err));
  };

  const verify = async () => {
    setWorking('verify');
    setError('');
    try {
      await verifyIdentity();
    } catch (err) {
      fail(err);
    } finally {
      setWorking('');
    }
  };

  const buy = async () => {
    setError('');
    setSelectorError('');
    setSuccess(null);
    if (!Number.isInteger(count) || count < 1) {
      setSelectorError('Ingresa al menos 1 fracción.');
      return;
    }
    if (count > asset.availableFractions) {
      setSelectorError(`No hay tantas fracciones disponibles. Quedan ${formatFractions(asset.availableFractions)}.`);
      return;
    }
    setWorking('buy');
    try {
      const result = await api.buy({ investorId: investor.investorId, assetId: asset.id, fractions: count });
      setSuccess(result);
      setCount(1);
      await onPurchased(result);
    } catch (err) {
      fail(err);
    } finally {
      setWorking('');
    }
  };

  return (
    <section className="rounded-2xl border border-borde bg-white p-5 shadow-soft sm:p-6" aria-labelledby="buy-heading">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="buy-heading" className="text-2xl leading-tight font-semibold">
            Comprar fracciones
          </h2>
          <p className="tabular mt-1 text-sm text-texto-suave">{usdc(asset.pricePerFraction)} por fracción</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-siembra-100 text-siembra-700">
          <ShieldCheck size={20} aria-hidden="true" />
        </span>
      </div>

      {soldOut ? (
        <div className="mt-5 rounded-xl bg-fondo p-4">
          <p className="font-semibold text-texto">Agotado</p>
          <p className="mt-1 text-sm text-texto-suave">Ya se vendieron todas las fracciones de este activo.</p>
        </div>
      ) : !investor ? (
        <div className="mt-5">
          <p className="rounded-xl bg-fondo p-4 text-sm text-texto-suave">
            Entra como inversionista demo para verificar tu identidad y comprar fracciones.
          </p>
          <Button className="mt-4 w-full" onClick={() => setShowLogin(true)}>
            Entrar como inversionista demo
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-y border-borde py-3 text-sm">
            <span className="text-texto-suave">Saldo disponible</span>
            <strong className="tabular font-semibold text-texto">
              {balanceStatus === 'loading' ? (
                'Cargando…'
              ) : balance == null ? (
                'No disponible'
              ) : (
                <>
                  <AnimatedAmount value={balance} /> USDC
                </>
              )}
            </strong>
          </div>
          <ol className="mt-5 space-y-6">
            <Step number={1} title="Verificar identidad" done={authorized}>
              {authorized ? (
                <m.div key="verified" {...swap}>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-siembra-100 px-3 py-1 text-sm font-semibold text-siembra-900 verified-shine">
                    <ShieldCheck size={15} aria-hidden="true" />
                    Identidad verificada (simulada)
                  </p>
                  <TxLink explorerUrl={verificationResult?.explorerUrl} className="mt-1" />
                </m.div>
              ) : (
                <div key="pending">
                  <p className="text-sm text-texto-suave">Verificación simulada (KYC de ejemplo) para este activo.</p>
                  <Button
                    className="mt-3 w-full"
                    variant="secondary"
                    disabled={Boolean(working)}
                    loading={working === 'verify'}
                    onClick={verify}
                  >
                    {working === 'verify' ? 'Verificando…' : 'Verificar identidad'}
                  </Button>
                </div>
              )}
            </Step>
            <Step number={2} title="Comprar">
              <FractionSelector
                value={count}
                onChange={(value) => {
                  setCount(value);
                  setSelectorError('');
                }}
                available={asset.availableFractions}
                price={asset.pricePerFraction}
                disabled={Boolean(working)}
                error={selectorError}
              />
              <Button className="mt-4 w-full" disabled={Boolean(working) || !authorized} loading={working === 'buy'} onClick={buy}>
                {working === 'buy' ? 'Enviando compra…' : 'Comprar fracciones'}
              </Button>
              {!authorized && <p className="mt-2 text-xs text-texto-suave">Primero verifica tu identidad para este activo.</p>}
            </Step>
          </ol>
        </>
      )}

      {success && <PurchaseSuccess result={success} />}

      {error && (
        <p
          role="alert"
          className="mt-4 flex animate-confirm-in items-start gap-2 rounded-xl border border-error/25 bg-error/5 p-3 text-sm text-error"
        >
          <CircleAlert size={18} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {showLogin && <DemoLoginDialog onClose={() => setShowLogin(false)} />}
    </section>
  );
}
