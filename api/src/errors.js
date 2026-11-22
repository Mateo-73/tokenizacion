// Códigos y estados HTTP definidos en docs/04-api-contrato.md y docs/09-backend-guia.md §4
export const ERROR_CODES = [
  'VALIDATION',
  'FORBIDDEN',
  'NOT_AUTHORIZED',
  'NOT_FOUND',
  'INSUFFICIENT_FRACTIONS',
  'INSUFFICIENT_USDC',
  'STELLAR_ERROR',
];

export const HTTP_STATUS = {
  VALIDATION: 400,
  FORBIDDEN: 403,
  NOT_AUTHORIZED: 403,
  NOT_FOUND: 404,
  INSUFFICIENT_FRACTIONS: 400,
  INSUFFICIENT_USDC: 400,
  STELLAR_ERROR: 502,
};

export class AppError extends Error {
  /**
   * @param {string} code uno de ERROR_CODES
   * @param {string} message texto legible en español
   * @param {{ cause?: unknown }} [options] error original, solo para registrarlo en el servidor
   */
  constructor(code, message, options) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
  }
}

function isErrorCode(value) {
  return typeof value === 'string' && ERROR_CODES.includes(value);
}

/**
 * Convierte cualquier error en un AppError. Los errores de `stellar/` llegan con `.code`.
 * Todo error inesperado se responde como STELLAR_ERROR (502), como define docs/09; el error
 * original queda en `cause` para registrarlo en el servidor sin enviarlo al cliente.
 */
export function toAppError(err) {
  if (err instanceof AppError) return err;

  if (err instanceof Error) {
    const { code, type } = err;
    if (isErrorCode(code)) return new AppError(code, err.message);
    if (type === 'entity.parse.failed') {
      return new AppError('VALIDATION', 'El cuerpo de la petición no es un JSON válido.');
    }
    if (type === 'entity.too.large') {
      return new AppError('VALIDATION', 'El cuerpo de la petición es demasiado grande.');
    }
  }

  return new AppError('STELLAR_ERROR', 'Error al comunicarse con Stellar', { cause: err });
}
