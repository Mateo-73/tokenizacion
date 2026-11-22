import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { Button } from './Button.jsx';
import { DemoLoginDialog } from './DemoLoginDialog.jsx';
import { SessionMenu } from './SessionMenu.jsx';

const links = [
  { to: '/', label: 'Activos', end: true },
  { to: '/portafolio', label: 'Portafolio' },
];

const linkClass = ({ isActive }) =>
  `press inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold ${
    isActive ? 'bg-siembra-100 text-siembra-900' : 'text-texto-suave hover:bg-fondo hover:text-siembra-900'
  }`;

function NavLinks() {
  return links.map((link) => (
    <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
      {link.label}
    </NavLink>
  ));
}

function Session() {
  const { investor } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  if (investor) return <SessionMenu />;
  return (
    <>
      <Button onClick={() => setShowLogin(true)} className="shrink-0">
        <span className="hidden sm:inline">Entrar como inversionista demo</span>
        <span className="sm:hidden">Entrar</span>
      </Button>
      {showLogin && <DemoLoginDialog onClose={() => setShowLogin(false)} />}
    </>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-[72px]">
        <div className="flex min-w-0 items-center gap-3 sm:gap-8">
          <Link to="/" className="-ml-1 flex shrink-0 items-center gap-2 rounded-xl p-1" aria-label="Siembra, inicio">
            <img src="/brand/logo.svg" alt="" className="size-9" />
            <span className="font-display text-2xl leading-none font-bold text-siembra-900">Siembra</span>
          </Link>
          <nav aria-label="Navegación principal" className="hidden items-center gap-1 sm:flex">
            <NavLinks />
          </nav>
        </div>
        <Session />
      </div>
      <nav aria-label="Navegación principal móvil" className="container-page grid grid-cols-2 gap-2 pb-2 sm:hidden">
        <NavLinks />
      </nav>
    </header>
  );
}
