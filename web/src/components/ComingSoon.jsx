import { ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from './Button.jsx';

export function ComingSoon({ icon: Icon, eyebrow, title, description, features }) {
  return (
    <section className="container-page py-8 sm:py-12">
      <Link
        to="/"
        className="-ml-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-siembra-700 transition-colors duration-150 hover:bg-siembra-100"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a activos
      </Link>
      <div className="mt-4 rounded-2xl border border-borde bg-white p-6 shadow-soft sm:p-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-siembra-100 text-siembra-700">
            <Icon size={28} aria-hidden="true" />
          </span>
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-siembra-100 px-3 py-1 text-xs font-semibold text-siembra-700">Próximamente</span>
              {eyebrow && <span className="rounded-full border border-borde px-3 py-1 text-xs font-semibold text-texto-suave">{eyebrow}</span>}
            </div>
            <h1 className="mt-4 text-h2 font-semibold sm:text-h1">{title}</h1>
            <p className="mt-4 text-texto-suave">{description}</p>
            <ul className="mt-6 grid gap-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-texto">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-siembra-100 text-siembra-700">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button to="/" className="mt-8">
              Explorar activos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
