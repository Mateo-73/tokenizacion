import { BadgeCheck, Clock } from 'lucide-react';

const pill = 'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold';

export function VerifiedBadge({ verified = true, explorerUrl }) {
  if (!verified) {
    return (
      <span className={`${pill} border border-borde bg-white text-texto-suave`}>
        <Clock size={13} aria-hidden="true" />
        Pendiente de verificación
      </span>
    );
  }
  const content = (
    <>
      <BadgeCheck size={14} aria-hidden="true" />
      Verificado en Stellar
    </>
  );
  if (!explorerUrl) return <span className={`${pill} verified-shine bg-siembra-100 text-siembra-900`}>{content}</span>;
  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noreferrer"
      className={`${pill} verified-shine bg-siembra-100 text-siembra-900 transition-colors duration-150 hover:bg-siembra-700 hover:text-white`}
      aria-label="Verificado en Stellar: ver transacción en el explorador"
    >
      {content}
    </a>
  );
}
