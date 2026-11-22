import { Minus, Plus } from 'lucide-react';
import { useId } from 'react';
import { amount, fractions } from '../lib/format.js';

const stepClass =
  'press flex size-12 shrink-0 items-center justify-center rounded-xl border border-borde bg-white text-siembra-700 hover:bg-siembra-100 disabled:pointer-events-none disabled:opacity-40';

export function FractionSelector({ value, onChange, available, price, disabled = false, error }) {
  const id = useId();
  const count = Number.isInteger(value) ? value : 0;
  const total = Number(price) * count;
  const soldOut = available < 1;
  const locked = disabled || soldOut;
  const clamp = (next) => Math.max(1, Math.min(available, next));

  const onInput = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 9);
    onChange(digits === '' ? '' : Number(digits));
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-texto">
          Fracciones
        </label>
        <span className="tabular text-xs text-texto-suave">
          {soldOut ? 'Agotado' : `Máximo ${fractions(available)}`}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" aria-label="Quitar una fracción" disabled={locked || count <= 1} onClick={() => onChange(clamp(count - 1))} className={stepClass}>
          <Minus size={18} aria-hidden="true" />
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          autoComplete="off"
          value={soldOut ? 0 : value}
          disabled={locked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-total`}
          onChange={onInput}
          onBlur={() => {
            if (count < 1) onChange(1);
          }}
          className={`tabular h-12 w-0 min-w-0 flex-1 rounded-xl border bg-white text-center text-lg font-semibold text-texto outline-none transition-[border-color,box-shadow] duration-150 focus:border-siembra-500 focus:ring-3 focus:ring-siembra-500/20 disabled:bg-fondo disabled:text-texto-suave ${
            error ? 'border-error' : 'border-borde'
          }`}
        />
        <button type="button" aria-label="Agregar una fracción" disabled={locked || count >= available} onClick={() => onChange(clamp(count + 1))} className={stepClass}>
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-medium text-error">
          {error}
        </p>
      )}
      <div id={`${id}-total`} className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-xl bg-fondo px-4 py-3">
        <span className="text-sm text-texto-suave">Total a pagar</span>
        <strong className="tabular text-lg font-semibold text-siembra-900 sm:text-xl">
          {amount(total)} <span className="text-sm font-medium text-texto-suave">USDC</span>
        </strong>
      </div>
    </div>
  );
}
