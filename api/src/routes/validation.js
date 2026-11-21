import { AppError } from '../errors.js';
import { parseAmount } from '../money.js';

const bad = (message) => new AppError('VALIDATION', message);

export function asBody(value) {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value;
  throw bad('El cuerpo de la petición debe ser un objeto JSON.');
}

export function text(body, field, max = 200) {
  const value = body[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw bad(`"${field}" es obligatorio y debe ser texto.`);
  }
  if (value.trim().length > max) throw bad(`"${field}" no puede superar ${max} caracteres.`);
  return value.trim();
}

export function email(body, field) {
  const value = text(body, field, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw bad(`"${field}" no es un correo válido.`);
  return value;
}

/** Entero ≥ 1 (las fracciones son enteras). */
export function positiveInt(body, field) {
  const value = body[field];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw bad(`"${field}" debe ser un entero mayor o igual a 1.`);
  }
  return value;
}

/** Monto positivo como string con hasta 7 decimales (ej. "2000" o "12.5"). */
export function positiveAmount(body, field) {
  const value = body[field];
  const parsed = parseAmount(value);
  if (parsed === null || parsed <= 0n) {
    throw bad(`"${field}" debe ser un monto positivo como texto, con hasta 7 decimales.`);
  }
  return value;
}

export function oneOf(body, field, allowed) {
  const value = body[field];
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw bad(`"${field}" debe ser uno de: ${allowed.join(', ')}.`);
  }
  return value;
}

/** Fecha real con formato YYYY-MM-DD. */
export function isoDate(body, field) {
  const value = text(body, field, 10);
  const parsed = new Date(`${value}T00:00:00Z`);
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
  if (!valid) throw bad(`"${field}" debe ser una fecha válida con formato YYYY-MM-DD.`);
  return value;
}

/** Período con formato YYYY-MM. */
export function period(body, field) {
  const value = text(body, field, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    throw bad(`"${field}" debe tener formato YYYY-MM (por ejemplo 2026-12).`);
  }
  return value;
}
