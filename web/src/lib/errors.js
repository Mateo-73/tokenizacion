const messages = {
  NOT_AUTHORIZED: 'Primero verifica tu identidad para este activo.',
  INSUFFICIENT_USDC: 'No tienes USDC suficiente para esta compra.',
  INSUFFICIENT_FRACTIONS: 'No hay tantas fracciones disponibles.',
  VALIDATION: 'Revisa los datos ingresados.',
  FORBIDDEN: 'Clave de administrador incorrecta.',
  STELLAR_ERROR: 'La red Stellar no respondió. Reintenta en unos segundos.',
  NETWORK: 'No pudimos conectar con el servidor. Reintenta en unos segundos.',
};

const FALLBACK = 'Algo salió mal. Reintenta.';

export function errorMessage(error) {
  return messages[error?.code] ?? FALLBACK;
}
