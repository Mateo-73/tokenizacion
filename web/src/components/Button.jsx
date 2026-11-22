import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router';

const base =
  'press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:pointer-events-none disabled:opacity-55';

const variants = {
  primary: 'bg-siembra-700 text-white shadow-soft hover:bg-siembra-900',
  secondary: 'border border-siembra-700 bg-transparent text-siembra-700 hover:bg-siembra-100',
  ghost: 'bg-transparent text-siembra-700 hover:bg-siembra-100',
};

export function Button({ variant = 'primary', loading = false, to, href, className = '', children, disabled, type = 'button', ...props }) {
  const classes = `${base} ${variants[variant]} ${className}`;
  const content = (
    <>
      {loading && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
