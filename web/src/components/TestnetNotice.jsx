import { Info } from 'lucide-react';

export const TESTNET_NOTICE = 'Prototipo en testnet. Los datos y los retornos son de ejemplo.';

export function TestnetNotice() {
  return (
    <div className="bg-simulado-bg text-simulado-fg">
      <p className="container-page flex items-center justify-center gap-2 py-2 text-center text-xs font-medium">
        <Info size={14} className="shrink-0" aria-hidden="true" />
        {TESTNET_NOTICE}
      </p>
    </div>
  );
}
