import { Minus, Plus } from 'lucide-react';
import { fractions, usdc } from '../lib/format.js';

export function FractionSelector({ value, onChange, available, price, disabled = false, error }) {
  const total = Number(price) * value;
  const update = (next) => onChange(Math.max(1, Math.min(available, Number.isFinite(next) ? Math.trunc(next) : 1)));

  return (
    <div>
      <label htmlFor="fraction-count" className="text-sm font-semibold text-texto">Fracciones</label>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" aria-label="Quitar una fracción" disabled={disabled || value <= 1} onClick={() => update(value - 1)} className="flex size-11 items-center justify-center rounded-xl border border-borde bg-white text-siembra-700 transition hover:bg-siembra-100 disabled:opacity-40"><Minus size={18} /></button>
        <input id="fraction-count" type="number" min="1" max={available} step="1" value={value} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))} onBlur={() => { if (!Number.isInteger(Number(value)) || Number(value) < 1) update(1); }} className="tabular h-11 min-w-0 flex-1 rounded-xl border border-borde bg-white text-center font-semibold outline-none focus:border-siembra-500" />
        <button type="button" aria-label="Agregar una fracción" disabled={disabled || value >= available} onClick={() => update(value + 1)} className="flex size-11 items-center justify-center rounded-xl border border-borde bg-white text-siembra-700 transition hover:bg-siembra-100 disabled:opacity-40"><Plus size={18} /></button>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm"><span className="text-texto-suave">Total de compra</span><strong className="tabular text-siembra-900">{usdc(total)}</strong></div>
      <p className="mt-1 text-xs text-texto-suave">{fractions(available)} fracciones disponibles</p>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-error">{error}</p>}
    </div>
  );
}
