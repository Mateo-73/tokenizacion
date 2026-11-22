import { Check, Copy, LogOut, Sprout, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { errorMessage } from '../lib/errors.js';
import { Button } from './Button.jsx';
import { useToast } from './Toast.jsx';

const links = [{ to: '/', label: 'Activos', end: true }, { to: '/portafolio', label: 'Portafolio' }];
const linkClass = ({ isActive }) => `inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition duration-150 ${isActive ? 'bg-siembra-100 text-siembra-900' : 'text-texto-suave hover:bg-fondo hover:text-siembra-900'}`;
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

function DemoLogin({ close }) {
  const { login, loading } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!name.trim()) { setError('Ingresa tu nombre para continuar.'); return; }
    try { await login({ name: name.trim(), email: email.trim() || undefined }); close(); toast.success('Sesión demo iniciada.'); }
    catch (err) { setError(errorMessage(err)); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-siembra-900/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="login-title" className="animate-fade-in relative w-full max-w-md rounded-2xl border border-borde bg-white p-6 shadow-lift sm:p-8">
      <button type="button" onClick={close} aria-label="Cerrar" className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-xl text-texto-suave hover:bg-fondo"><X size={20} /></button>
      <span className="flex size-11 items-center justify-center rounded-xl bg-siembra-100 text-siembra-700"><Sprout size={22} /></span>
      <h2 id="login-title" className="mt-4 text-2xl font-semibold">Entrar como inversionista demo</h2>
      <p className="mt-2 text-sm text-texto-suave">Crea una sesión de prueba para explorar el flujo de inversión.</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div><label htmlFor="investor-name" className="text-sm font-semibold">Nombre</label><input autoFocus required id="investor-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-borde px-4 outline-none focus:border-siembra-500" autoComplete="name" /></div>
        <div><label htmlFor="investor-email" className="text-sm font-semibold">Correo electrónico <span className="font-normal text-texto-suave">(opcional)</span></label><input id="investor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-borde px-4 outline-none focus:border-siembra-500" autoComplete="email" /></div>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Entrar</Button>
      </form>
    </section>
  </div>;
}

function Session() {
  const { investor, loading, logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyKey = async () => {
    try { await navigator.clipboard.writeText(investor.publicKey); setCopied(true); toast.success('Clave pública copiada.'); window.setTimeout(() => setCopied(false), 1800); }
    catch { toast.error('No pudimos copiar la clave pública.'); }
  };
  if (!investor) return <><Button onClick={() => setShowLogin(true)} loading={loading}><span className="hidden sm:inline">Entrar como inversionista demo</span><span className="sm:hidden">Entrar</span></Button>{showLogin && <DemoLogin close={() => setShowLogin(false)} />}</>;
  return <div className="relative"><button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex min-h-11 items-center gap-2 rounded-full border border-borde bg-white py-1 pr-3 pl-1 transition hover:border-siembra-500/50"><span className="flex size-8 items-center justify-center rounded-full bg-siembra-700 text-xs font-semibold text-white" aria-hidden="true">{initials(investor.name)}</span><span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{investor.name}</span></button>{open && <div className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-borde bg-white p-4 shadow-lift"><p className="truncate font-semibold">{investor.name}</p><p className="mt-3 text-xs text-texto-suave">Clave pública</p><button type="button" onClick={copyKey} className="mt-1 flex min-h-11 w-full items-center justify-between gap-2 rounded-lg bg-fondo px-3 text-left font-mono text-xs text-texto"><span className="truncate">{investor.publicKey.slice(0, 7)}…{investor.publicKey.slice(-5)}</span>{copied ? <Check size={16} /> : <Copy size={16} />}</button><button type="button" onClick={() => { logout(); setOpen(false); }} className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-error transition hover:bg-error/5"><LogOut size={16} />Salir</button></div>}</div>;
}

export function Navbar() {
  return <header className="sticky top-0 z-40 border-b border-borde bg-white/95 backdrop-blur">
    <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-[72px]">
      <div className="flex min-w-0 items-center gap-3 sm:gap-8"><Link to="/" className="-ml-1 flex shrink-0 items-center gap-2 rounded-xl p-1" aria-label="Siembra, inicio"><img src="/brand/logo.svg" alt="" className="size-9" /><span className="font-display text-2xl leading-none font-bold text-siembra-900">Siembra</span></Link><nav aria-label="Navegación principal" className="hidden items-center gap-1 sm:flex">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>{link.label}</NavLink>)}</nav></div>
      <Session />
    </div>
    <nav aria-label="Navegación principal" className="container-page grid grid-cols-2 gap-2 pb-2 sm:hidden">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>{link.label}</NavLink>)}</nav>
  </header>;
}
