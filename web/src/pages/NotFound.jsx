import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export function NotFound() {
  usePageTitle('Página no encontrada');
  return (
    <section className="container-page flex animate-fade-in flex-col items-center py-16 text-center sm:py-24">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-siembra-100 text-siembra-700">
        <Compass size={32} aria-hidden="true" />
      </span>
      <p className="tabular mt-6 text-sm font-semibold text-siembra-700">Error 404</p>
      <h1 className="mt-2 text-h2 font-semibold sm:text-h1">No encontramos esta página</h1>
      <p className="mt-4 max-w-md text-texto-suave">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <Button to="/" className="mt-8">
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a activos
      </Button>
    </section>
  );
}
