// Instala las dependencias de api/ y web/ al ejecutar `npm install` en la raíz.
// Salta las carpetas que todavía no tienen package.json.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const dir of ['api', 'web']) {
  if (!existsSync(join(root, dir, 'package.json'))) {
    console.log(`[install-all] ${dir}/ aún no tiene package.json, se omite.`);
    continue;
  }
  console.log(`[install-all] Instalando dependencias de ${dir}/ ...`);
  const result = spawnSync(npm, ['install'], {
    cwd: join(root, dir),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error(`[install-all] Falló la instalación en ${dir}/`);
    process.exit(result.status ?? 1);
  }
}
