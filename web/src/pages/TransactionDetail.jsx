import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, ExternalLink, Hash, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '../components/Button.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

const HORIZON = 'https://horizon-testnet.stellar.org';

const shortKey = (key) => (key ? `${key.slice(0, 6)}…${key.slice(-4)}` : '—');

/** Horizon devuelve el memo TEXT en claro; si viniera en base64 (como en StellarExpert), lo decodifica. */
function readableMemo(tx) {
  const memo = String(tx?.memo ?? '');
  if (!memo || tx.memo_type !== 'text') return memo || null;
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(memo) && memo.length % 4 === 0) {
    try {
      const bytes = Uint8Array.from(atob(memo), (char) => char.charCodeAt(0));
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (/^[\x20-\x7e]+$/.test(decoded)) return decoded;
    } catch {
      // No era base64: se muestra tal cual.
    }
  }
  return memo;
}

const localDate = new Intl.DateTimeFormat('es-BO', {
  timeZone: 'America/La_Paz',
  dateStyle: 'full',
  timeStyle: 'long',
});
const utcDate = new Intl.DateTimeFormat('es-BO', {
  timeZone: 'UTC',
  dateStyle: 'medium',
  timeStyle: 'medium',
});

export function TransactionDetail() {
  const { hash } = useParams();
  usePageTitle('Detalle de transacción');
  const [state, setState] = useState({ status: 'loading', tx: null, operations: [], error: '' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', tx: null, operations: [], error: '' });
    Promise.all([
      fetch(`${HORIZON}/transactions/${encodeURIComponent(hash)}`),
      fetch(`${HORIZON}/transactions/${encodeURIComponent(hash)}/operations?limit=50`),
    ])
      .then(async ([txRes, opRes]) => {
        if (!txRes.ok) throw new Error(txRes.status === 404 ? 'No existe esa transacción en testnet.' : 'Horizon no respondió.');
        const [tx, operations] = await Promise.all([txRes.json(), opRes.json()]);
        if (alive) setState({ status: 'ok', tx, operations: operations._embedded?.records ?? [], error: '' });
      })
      .catch((err) => {
        if (alive) setState({ status: 'error', tx: null, operations: [], error: err.message });
      });
    return () => {
      alive = false;
    };
  }, [hash]);

  const { tx, operations, status, error } = state;
  const memo = readableMemo(tx);
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${hash}`;

  return (
    <section className="container-page py-10 sm:py-14">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-siembra-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a activos
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-siembra-700 uppercase">Stellar testnet · Verificación legible</p>
        <h1 className="mt-2 text-h2 font-semibold sm:text-h1">Detalle de la transacción</h1>
        <p className="mt-3 text-texto-suave">
          mismo comprobante on-chain, con la etiqueta en claro y la hora de Bolivia (UTC−4). StellarExpert muestra el memo en
          base64 y la hora en UTC; acá lo traducimos.
        </p>
      </div>

      {status === 'loading' && <p className="mt-10 text-texto-suave">Consultando Horizon…</p>}
      {status === 'error' && (
        <div className="mt-10 rounded-xl border border-borde bg-white p-6 shadow-soft">
          <p className="font-semibold text-error">{error}</p>
          <p className="mt-2 text-sm text-texto-suave">Revisa el hash o vuelve a intentarlo en unos segundos.</p>
        </div>
      )}

      {status === 'ok' && (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-siembra-500/30 bg-siembra-100 p-6 shadow-soft lg:col-span-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-siembra-800">
              <Tag size={16} aria-hidden="true" />
              Etiqueta de la transacción (memo)
            </p>
            <p className="tabular mt-3 text-2xl font-semibold wrap-anywhere text-siembra-900 sm:text-3xl">
              {memo ?? 'Esta transacción no tiene memo'}
            </p>
            <p className="mt-3 text-sm text-siembra-900/75">
              Es el mismo dato que StellarExpert muestra codificado, por ejemplo{' '}
              <span className="font-mono">U0lFTUJSQSBDT01QUkEgU09ZQTAxIDF4</span> = <span className="font-semibold">SIEMBRA COMPRA SOYA01 1x</span>.
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-6 shadow-soft">
            <p className="flex items-center gap-2 text-sm font-semibold text-siembra-700">
              <CheckCircle2 size={16} aria-hidden="true" />
              Estado
            </p>
            <p className="mt-3 text-xl font-semibold">{tx.successful ? 'Exitosa' : 'Fallida'}</p>
            <p className="mt-1 text-sm text-texto-suave">Ledger {tx.ledger}</p>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-6 shadow-soft">
            <p className="flex items-center gap-2 text-sm font-semibold text-siembra-700">
              <Clock3 size={16} aria-hidden="true" />
              Fecha y hora
            </p>
            <p className="mt-3 font-semibold">{localDate.format(new Date(tx.created_at))}</p>
            <p className="mt-2 text-sm text-texto-suave">
              Hora de Bolivia (UTC−4). En el explorador: <span className="tabular">{utcDate.format(new Date(tx.created_at))} UTC</span>.
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-6 shadow-soft lg:col-span-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-siembra-700">
              <Hash size={16} aria-hidden="true" />
              Hash de la transacción
            </p>
            <p className="mt-3 font-mono text-xs wrap-anywhere text-texto-suave sm:text-sm">{tx.hash}</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-siembra-700 hover:underline">
                Ver en StellarExpert
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a href={`${HORIZON}/transactions/${hash}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-siembra-700 hover:underline">
                Ver datos en Horizon
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-6 shadow-soft lg:col-span-3">
            <h2 className="text-lg font-semibold">Operaciones incluidas</h2>
            <ul className="mt-4 divide-y divide-borde">
              {operations.map((op) => (
                <li key={op.id} className="py-4">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold text-siembra-700">{shortKey(op.from ?? op.source_account)}</span>
                    <span className="text-texto-suave">envió</span>
                    <strong className="tabular text-texto">{op.amount} {op.asset_code ?? 'XLM'}</strong>
                    <span className="text-texto-suave">a</span>
                    <span className="font-semibold text-siembra-700">{shortKey(op.to)}</span>
                  </p>
                  <p className="mt-1 text-xs text-texto-suave" title={`${op.from ?? ''} → ${op.to ?? ''}`}>
                    {op.type}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-texto-suave">
              Datos leídos directamente de Horizon (testnet). Los importes y activos son de prueba.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button to="/portafolio" variant="secondary">Ver mi portafolio</Button>
      </div>
    </section>
  );
}
