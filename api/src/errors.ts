// Códigos y estados HTTP definidos en docs/tecnico/04-api-contrato.md
export const ERROR_CODES = [
  'VALIDATION',
  'FORBIDDEN',
  'NOT_AUTHORIZED',
  'NOT_FOUND',
  'INSUFFICIENT_FRACTIONS',
  'INSUFFICIENT_USDC',
  'STELLAR_ERROR',
  'INTERNAL',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION: 400,
  FORBIDDEN: 403,
  NOT_AUTHORIZED: 403,
  NOT_FOUND: 404,
  INSUFFICIENT_FRACTIONS: 409,
  INSUFFICIENT_USDC: 422,
  STELLAR_ERROR: 502,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}

/** Convierte cualquier error en un AppError. Los errores de `stellar/` llegan con `.code`. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof Error) {
    const { code, type } = err as { code?: unknown; type?: unknown };
    if (isErrorCode(code) && code !== 'INTERNAL') return new AppError(code, err.message);
    if (type === 'entity.parse.failed') {
      return new AppError('VALIDATION', 'El cuerpo de la petición no es un JSON válido.');
    }
    if (type === 'entity.too.large') {
      return new AppError('VALIDATION', 'El cuerpo de la petición es demasiado grande.');
    }
  }

  return new AppError('INTERNAL', 'Error interno del servidor.');
}
