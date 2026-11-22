const LOCALE = 'es-BO';

const money = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const percentage = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeZone: 'UTC' });

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function amount(value) {
  return money.format(toNumber(value));
}

export function usdc(value) {
  return `${amount(value)} USDC`;
}

export function fractions(value) {
  return integer.format(Math.trunc(toNumber(value)));
}

export function percent(part, total) {
  const ratio = toNumber(total) > 0 ? Math.min(1, Math.max(0, toNumber(part) / toNumber(total))) : 0;
  if (ratio > 0 && ratio < 0.01) return `< ${percentage.format(0.01)}`;
  if (ratio > 0.99 && ratio < 1) return `> ${percentage.format(0.99)}`;
  return percentage.format(ratio);
}

export function formatDate(value) {
  if (!value) return '';
  const text = String(value);
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00Z` : text);
  return Number.isNaN(parsed.getTime()) ? '' : day.format(parsed);
}

const month = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatPeriod(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) return String(value ?? '');
  return month.format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)));
}
