import { Check, ChevronDown, Copy, LogOut, Wallet } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { useToast } from './Toast.jsx';

const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv']);
const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
const firstGrapheme = (word) => segmenter.segment(word)[Symbol.iterator]().next().value?.segment ?? '';

function initials(name) {
  const words = name.split(/\s+/).filter((word) => word && !SUFFIXES.has(word.toLowerCase()));
  if (!words.length) return '';
  const picked = words.length > 1 ? [words[0], words.at(-1)] : [words[0]];
  return picked.map((word) => firstGrapheme(word).toLocaleUpperCase('es')).join('');
}

const shortKey = (key) => (key.length > 14 ? `${key.slice(0, 6)}…${key.slice(-6)}` : key);

const itemClass = 'press flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold';

export function SessionMenu() {
  const { investor, logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(investor.publicKey);
      setCopied(true);
      toast.success('Clave pública copiada.');
    } catch {
      toast.error('No pudimos copiar la clave pública.');
    }
  };

  const avatar = initials(investor.name);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Cuenta de ${investor.name}`}
        onClick={() => setOpen((value) => !value)}
        className="press flex min-h-11 items-center gap-2 rounded-full border border-borde bg-white py-1 pr-2 pl-1 hover:border-siembra-500/50 sm:pr-3"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-siembra-700 text-xs font-semibold text-white" aria-hidden="true">
          {avatar || <Wallet size={16} />}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-texto sm:inline" aria-hidden="true">
          {investor.name}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-texto-suave transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute top-full right-0 z-50 mt-2 w-[min(18rem,calc(100vw-32px))] origin-top-right animate-popover-in rounded-2xl border border-borde bg-white p-2 shadow-lift"
        >
          <div className="px-3 pt-2 pb-3">
            <p className="text-xs text-texto-suave">Inversionista demo</p>
            <p className="mt-0.5 line-clamp-2 font-semibold break-words text-texto" title={investor.name}>
              {investor.name}
            </p>
            <p className="mt-3 text-xs text-texto-suave">Clave pública</p>
            <button
              type="button"
              onClick={copyKey}
              className="press mt-1 flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-fondo px-3 text-left hover:bg-siembra-100"
              aria-label="Copiar clave pública"
              title={investor.publicKey}
            >
              <span className="tabular truncate font-mono text-xs text-texto">{shortKey(investor.publicKey)}</span>
              {copied ? <Check size={16} className="shrink-0 text-siembra-700" aria-hidden="true" /> : <Copy size={16} className="shrink-0 text-texto-suave" aria-hidden="true" />}
            </button>
          </div>
          <div className="border-t border-borde pt-2">
            <Link to="/portafolio" onClick={() => setOpen(false)} className={`${itemClass} text-texto hover:bg-fondo`}>
              <Wallet size={16} aria-hidden="true" />
              Mi portafolio
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className={`${itemClass} text-error hover:bg-error/5`}
            >
              <LogOut size={16} aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
