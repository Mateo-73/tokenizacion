const money = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeZone: 'UTC' });

export function usdc(value) { return `${money.format(Number(value) || 0)} USDC`; }
export function fractions(value) { return integer.format(Number(value) || 0); }
export function formatDate(value) { if (!value) return ''; const parsed = new Date(`${value}`.length === 10 ? `${value}T00:00:00Z` : value); return Number.isNaN(parsed.getTime()) ? '' : date.format(parsed); }
