import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const DURATION = 5000;
const EXIT = 160;
const ToastContext = createContext(null);

function ToastItem({ toast, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  const leave = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    const timer = window.setTimeout(leave, DURATION);
    return () => window.clearTimeout(timer);
  }, [leave]);

  useEffect(() => {
    if (!leaving) return undefined;
    const timer = window.setTimeout(() => onDismiss(toast.id), EXIT);
    return () => window.clearTimeout(timer);
  }, [leaving, onDismiss, toast.id]);

  const isError = toast.type === 'error';
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-white p-4 shadow-lift ${isError ? 'border-error/30' : 'border-borde'} ${leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${isError ? 'text-error' : 'text-siembra-700'}`} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium text-texto">{toast.message}</p>
      <button
        type="button"
        onClick={leave}
        className="-m-2 flex size-9 shrink-0 items-center justify-center rounded-lg text-texto-suave transition-colors duration-150 hover:bg-fondo hover:text-texto"
        aria-label="Cerrar aviso"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const sequence = useRef(0);

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const show = useCallback((message, type) => {
    sequence.current += 1;
    const id = sequence.current;
    setToasts((current) => [...current.slice(-2), { id, message, type }]);
  }, []);
  const value = useMemo(
    () => ({ success: (message) => show(message, 'success'), error: (message) => show(message, 'error') }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-[calc(24px+env(safe-area-inset-bottom))] sm:w-96"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
