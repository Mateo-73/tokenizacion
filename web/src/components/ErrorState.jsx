import { RotateCw, WifiOff } from 'lucide-react';
import { errorMessage } from '../lib/errors.js';
import { Button } from './Button.jsx';

export function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="animate-fade-in rounded-2xl border border-error/25 bg-white px-6 py-12 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-error/10 text-error">
        <WifiOff size={26} aria-hidden="true" />
      </span>
      <p className="mx-auto mt-4 max-w-md font-medium text-texto">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          <RotateCw size={16} aria-hidden="true" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
