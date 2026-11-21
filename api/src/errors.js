// Códigos y estados HTTP definidos en docs/04-api-contrato.md
export const ERROR_CODES = [
  'VALIDATION',
  'FORBIDDEN',
  'NOT_AUTHORIZED',
  'NOT_FOUND',
  'INSUFFICIENT_FRACTIONS',
  'INSUFFICIENT_USDC',
  'STELLAR_ERROR',
  'INTERNAL',
];

export const HTTP_STATUS = {
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
  constructor(code, message) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

function isErrorCode(value) {
  return typeof value === 'string' && ERROR_CODES.includes(value);
}

/** Convierte cualquier error en un AppError. Los errores de `stellar/` llegan con `.code`. */
export function toAppError(err) {
  if (err instanceof AppError) return err;

  if (err instanceof Error) {
    const { code, type } = err;
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
