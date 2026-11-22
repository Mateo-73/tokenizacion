import { LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { errorMessage } from '../lib/errors.js';
import { Button } from './Button.jsx';
import { useToast } from './Toast.jsx';

const links = [
  { to: '/', label: 'Activos', end: true },
  { to: '/portafolio', label: 'Portafolio' },
];

const linkClass = ({ isActive }) =>
  `inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition duration-150 ${
    isActive ? 'bg-siembra-100 text-siembra-900' : 'text-texto-suave hover:bg-fondo hover:text-siembra-900'
  }`;

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function Session() {
  const { investor, loading, login, logout } = useAuth();
  const toast = useToast();

  if (!investor) {
    const enter = () => login().catch((error) => toast.error(errorMessage(error)));
    return (
      <Button onClick={enter} loading={loading}>
        Entrar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-2 rounded-full border border-borde bg-white py-1 pr-1 pl-1 sm:pr-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-siembra-700 text-xs font-semibold text-white" aria-hidden="true">
          {initials(investor.name)}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{investor.name}</span>
      </span>
      <button
        type="button"
        onClick={logout}
        className="flex size-11 items-center justify-center rounded-xl text-texto-suave transition duration-150 hover:bg-fondo hover:text-siembra-900"
        aria-label="Salir"
        title="Salir"
      >
        <LogOut size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-18">
        <div className="flex items-center gap-8">
          <Link to="/" className="-ml-1 flex items-center gap-2 rounded-xl p-1" aria-label="Siembra, inicio">
            <img src="/brand/logo.svg" alt="" className="size-9" />
            <span className="font-display text-2xl leading-none font-bold text-siembra-900">Siembra</span>
          </Link>
          <nav aria-label="Navegación principal" className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <Session />
      </div>
      <nav aria-label="Navegación principal" className="container-page grid grid-cols-2 gap-2 pb-2 sm:hidden">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
