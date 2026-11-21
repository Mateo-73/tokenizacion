// Los montos viajan como string con hasta 7 decimales (docs/tecnico/02).
// Internamente se calcula en "stroops" (enteros BigInt) para no perder precisión.
const SCALE = 10_000_000n;
const AMOUNT_RE = /^\d+(\.\d{1,7})?$/;

/** "12.5" -> 125000000n. Devuelve null si no es un monto válido (solo string, sin signo). */
export function parseAmount(value: unknown): bigint | null {
  if (typeof value !== 'string' || !AMOUNT_RE.test(value)) return null;
  const [whole = '0', fraction = ''] = value.split('.');
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(7, '0'));
}

/** 125000000n -> "12.5000000" */
export function formatAmount(stroops: bigint): string {
  const whole = stroops / SCALE;
  const fraction = (stroops % SCALE).toString().padStart(7, '0');
  return `${whole}.${fraction}`;
}
