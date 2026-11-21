import 'dotenv/config';
import { createApp } from './app.js';
import { createRuntime } from './bootstrap.js';
import { loadConfig } from './config.js';

let config;
let services;
try {
  ({ config, services } = await createRuntime(loadConfig()));
} catch (err) {
  console.error(`No se pudo iniciar la API: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

createApp(config, services).listen(config.port, () => {
  console.log(
    `API de Siembra en http://localhost:${config.port}/api (MOCK_MODE=${config.mockMode})`,
  );
  console.log(
    config.mockMode
      ? 'Modo mock: datos y txHash simulados, sin tocar Stellar. Admin: header x-admin-key.'
      : 'Modo real: Stellar testnet. Las operaciones tardan unos segundos y las compras mueven fondos de prueba.',
  );
});
