import { Sprout } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({ icon: Icon = Sprout, title, description, actionLabel, actionTo }) {
  return (
    <div className="rounded-2xl border border-dashed border-borde bg-white px-6 py-12 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-siembra-100 text-siembra-700">
        <Icon size={28} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-texto-suave">{description}</p>}
      {actionLabel && actionTo && (
        <Button to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
