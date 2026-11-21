import 'dotenv/config';
import { createApp } from './app.js';
import { createRuntime } from './bootstrap.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const { services } = await createRuntime(config);

createApp(config, services).listen(config.port, () => {
  console.log(
    `API de Siembra en http://localhost:${config.port}/api (MOCK_MODE=${config.mockMode})`,
  );
  if (config.mockMode) {
    console.log(
      'Modo mock: datos y txHash simulados, sin tocar Stellar. Admin: header x-admin-key.',
    );
  }
});
