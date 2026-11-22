import { Sprout, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { errorMessage } from '../lib/errors.js';
import { Button } from './Button.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 100;
const EMAIL_MAX = 254;

function validate({ name, email }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Ingresa tu nombre.';
  else if (name.trim().length > NAME_MAX) errors.name = `Usa como máximo ${NAME_MAX} caracteres.`;
  if (!email.trim()) errors.email = 'Ingresa tu correo electrónico.';
  else if (email.trim().length > EMAIL_MAX || !EMAIL.test(email.trim()))
    errors.email = 'Escribe un correo válido, por ejemplo ana@ejemplo.com.';
  return errors;
}

const inputClass =
  'mt-1.5 h-12 w-full min-w-0 rounded-xl border bg-white px-4 text-base text-texto outline-none placeholder:text-texto-suave transition-[border-color,box-shadow] duration-150 focus:border-siembra-500 focus:ring-3 focus:ring-siembra-500/20';

function Field({ id, label, error, ...props }) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-texto">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`${inputClass} ${error ? 'border-error' : 'border-borde'}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function DemoLoginDialog({ onClose }) {
  const { login, loading } = useAuth();
  const ref = useRef(null);
  const uid = useId();
  const [values, setValues] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [closing, setClosing] = useState(false);
  const errors = submitted ? validate(values) : {};

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  const close = () => {
    if (closing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ref.current?.close();
      return;
    }
    setClosing(true);
    window.setTimeout(() => ref.current?.close(), 150);
  };
  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setServerError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError('');
    const found = validate(values);
    if (Object.keys(found).length) {
      document.getElementById(`${uid}-${found.name ? 'name' : 'email'}`)?.focus();
      return;
    }
    try {
      await login({ name: values.name.trim(), email: values.email.trim() });
      close();
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-description`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className={`m-auto w-[min(100%-32px,28rem)] max-w-none overflow-visible bg-transparent p-0 text-texto backdrop:bg-siembra-900/50 ${
        closing ? 'pointer-events-none animate-dialog-out backdrop:animate-overlay-out' : 'animate-dialog-in backdrop:animate-overlay-in'
      }`}
    >
      <div className="relative max-h-[calc(100dvh-32px)] overflow-y-auto overscroll-contain rounded-2xl border border-borde bg-white p-6 shadow-lift sm:p-8">
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="press absolute top-3 right-3 flex size-11 items-center justify-center rounded-xl text-texto-suave hover:bg-fondo hover:text-texto"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <span className="flex size-11 items-center justify-center rounded-xl bg-siembra-100 text-siembra-700">
          <Sprout size={22} aria-hidden="true" />
        </span>
        <h2 id={`${uid}-title`} className="mt-4 pr-10 text-2xl leading-tight font-semibold">
          Entrar como inversionista demo
        </h2>
        <p id={`${uid}-description`} className="mt-2 text-sm text-texto-suave">
          Te creamos una cuenta de prueba con 1.000 USDC de ejemplo. Con el mismo correo recuperas tu cuenta.
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <Field
            id={`${uid}-name`}
            label="Nombre"
            value={values.name}
            onChange={update('name')}
            error={errors.name}
            autoComplete="name"
            maxLength={NAME_MAX}
            enterKeyHint="next"
            autoFocus
          />
          <Field
            id={`${uid}-email`}
            label="Correo electrónico"
            type="email"
            inputMode="email"
            value={values.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={EMAIL_MAX}
            enterKeyHint="go"
            placeholder="ana@ejemplo.com"
          />
          {serverError && (
            <p role="alert" className="rounded-xl border border-error/25 bg-error/5 p-3 text-sm text-error">
              {serverError}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </dialog>
  );
}
