import { Sprout } from 'lucide-react';
import { m } from 'motion/react';
import { Button } from './Button.jsx';

export function EmptyState({ icon: Icon = Sprout, title, description, actionLabel, actionTo }) {
  return (
    <div className="rounded-2xl border border-dashed border-borde bg-white px-6 py-12 text-center">
      <m.span
        initial={{ opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
        className="mx-auto flex size-14 items-center justify-center rounded-full bg-siembra-100 text-siembra-700"
      >
        <Icon size={28} aria-hidden="true" />
      </m.span>
      <h2 className="mt-4 text-xl font-semibold text-balance">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-texto-suave">{description}</p>}
      {actionLabel && actionTo && (
        <Button to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
