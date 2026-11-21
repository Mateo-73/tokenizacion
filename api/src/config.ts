export interface Config {
  port: number;
  mockMode: boolean;
  adminKey: string;
  issuerPublic: string;
  webOrigin: string;
}

// Clave pública falsa (56 caracteres) que se usa como emisor en modo mock.
const MOCK_ISSUER = `G${'MOCK'.padEnd(55, 'A')}`;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const mockMode = env.MOCK_MODE === 'true';

  let adminKey = env.ADMIN_KEY ?? '';
  if (adminKey === '') {
    if (!mockMode) {
      throw new Error('Falta ADMIN_KEY en api/.env (obligatoria cuando MOCK_MODE no es true).');
    }
    adminKey = 'dev-admin-key';
  }

  return {
    port: Number(env.PORT ?? 3001),
    mockMode,
    adminKey,
    issuerPublic: env.ISSUER_PUBLIC || (mockMode ? MOCK_ISSUER : ''),
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
  };
}
