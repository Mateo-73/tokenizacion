// Prueba del flujo completo contra la API local (M9, docs/09 §11): falla si algo se rompe.
// Recorre A → E de docs/06: inversionista demo, KYC simulado, compra, portafolio, reparto de
// retornos y trazabilidad, más los errores principales.
//
// Requiere la API encendida (`npm run dev:api`). Sirve con MOCK_MODE=true (sin red) y con
// MOCK_MODE=false (testnet real; ver el aviso de efectos abajo).
//
// Uso:  npm run test:flow                  (API en http://localhost:3001/api)
//       npm run test:flow -- --con-hito    (en modo real, también agrega un hito de prueba)
//       API_URL=http://localhost:3001/api ADMIN_KEY=... npm run test:flow
//
// ⚠ En modo real, cada ejecución crea una cuenta nueva, COMPRA 5 fracciones de SILO01 y REPARTE
//   1 USDC de prueba entre todos los tenedores de SILO01. El hito de trazabilidad solo se agrega
//   con --con-hito, porque queda registrado para siempre en Stellar y aparecería en la demo.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Los scripts no importan paquetes npm, así que el .env de la API se carga con Node (20.12+).
const envFile = fileURLToPath(new URL('../api/.env', import.meta.url));
if (existsSync(envFile) && typeof process.loadEnvFile === 'function') process.loadEnvFile(envFile);

const API = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3001}/api`;
const withTrace = process.argv.includes('--con-hito');
let adminKey = process.env.ADMIN_KEY;

class StepError extends Error {}

/** Última respuesta de la API: si un paso falla, se muestra para saber el motivo real. */
let last;

async function call(method, path, body, { admin = false } = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(admin && adminKey ? { 'x-admin-key': adminKey } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new StepError(
      `No se pudo conectar con la API en ${API}. ¿Está encendida (npm run dev:api)?`,
    );
  }
  const json = await res.json().catch(() => ({}));
  last = { request: `${method} ${path}`, status: res.status, json };
  return { status: res.status, json };
}

function expect(ok, message) {
  if (!ok) {
    const e = last?.json?.error;
    throw new StepError(
      e
        ? `${message}\n    Motivo: la API respondió ${last.request} → ${e.code} (HTTP ${last.status}): ${e.message}`
        : message,
    );
  }
  console.log(`  ✓ ${message}`);
}

const errorOf = (r) => `${r.json?.error?.code ?? '?'} (HTTP ${r.status})`;
const started = Date.now();

try {
  console.log(`Flujo completo contra ${API}\n`);

  const health = await call('GET', '/health');
  expect(
    health.status === 200 && health.json.ok === true,
    `API responde (modo ${health.json.mock ? 'mock' : 'real, Stellar testnet'})`,
  );
  const mock = health.json.mock === true;
  adminKey ??= mock ? 'dev-admin-key' : undefined;
  if (!adminKey)
    throw new StepError(
      'Falta ADMIN_KEY (en api/.env o en el entorno) para los endpoints de administrador.',
    );

  const assets = await call('GET', '/assets');
  const ids = assets.json.map?.((a) => a.id) ?? [];
  expect(
    assets.status === 200 && ids.includes('SILO01') && ids.includes('SOYA01'),
    `GET /assets → ${ids.join(', ')}`,
  );

  console.log('\nA. Entrar y ser autorizado');
  const email = `qa${Date.now()}@ejemplo.com`;
  const inv = await call('POST', '/investors/demo', { name: 'QA', email });
  expect(
    inv.status === 201 && inv.json.usdcBalance === '1000.0000000' && inv.json.secret === undefined,
    `POST /investors/demo → ${inv.json.investorId} con ${inv.json.usdcBalance} USDC (sin 'secret' en la respuesta)`,
  );
  const id = inv.json.investorId;
  const early = await call('POST', '/buy', { investorId: id, assetId: 'SILO01', fractions: 5 });
  expect(early.json?.error?.code === 'NOT_AUTHORIZED', `comprar sin verificar → ${errorOf(early)}`);
  const auth = await call('POST', '/authorize', { investorId: id, assetId: 'SILO01' });
  expect(
    auth.status === 200 && auth.json.authorized === true && auth.json.simulatedKyc === true,
    'POST /authorize → wallet verificada (KYC simulado)',
  );

  console.log('\nB. Comprar fracciones');
  const buy = await call('POST', '/buy', { investorId: id, assetId: 'SILO01', fractions: 5 });
  expect(
    buy.status === 200 &&
      buy.json.totalUsdc === '250.0000000' &&
      /^[0-9a-f]{64}$/.test(buy.json.txHash),
    `POST /buy 5 fracciones → ${buy.json.totalUsdc} USDC${buy.json.explorerUrl ? `\n    ${buy.json.explorerUrl}` : ''}`,
  );
  const poor = await call('POST', '/buy', { investorId: id, assetId: 'SILO01', fractions: 100 });
  expect(
    poor.json?.error?.code === 'INSUFFICIENT_USDC',
    `pagar con USDC insuficiente → ${errorOf(poor)}`,
  );
  const gone = await call('POST', '/buy', { investorId: id, assetId: 'SILO01', fractions: 100000 });
  expect(
    gone.json?.error?.code === 'INSUFFICIENT_FRACTIONS',
    `pedir más fracciones de las que hay → ${errorOf(gone)}`,
  );
  const bad = await call('POST', '/buy', { investorId: id, assetId: 'SILO01', fractions: 1.5 });
  expect(bad.json?.error?.code === 'VALIDATION', `fracciones no enteras → ${errorOf(bad)}`);

  console.log('\nC. Portafolio');
  const pf = await call('GET', `/portfolio/${id}`);
  const silo = pf.json.holdings?.find((h) => h.assetId === 'SILO01');
  expect(
    pf.status === 200 &&
      silo?.fractions === 5 &&
      silo.valueUsdc === '250.0000000' &&
      pf.json.usdcBalance === '750.0000000',
    `GET /portfolio → ${pf.json.usdcBalance} USDC y ${silo?.fractions} fracciones de SILO01 (valor ${silo?.valueUsdc})`,
  );

  console.log('\nD. Retornos (administrador)');
  const period = new Date().toISOString().slice(0, 7);
  const body = { assetId: 'SILO01', totalUsdc: '1', period };
  const denied = await call('POST', '/distribute', body);
  expect(
    denied.json?.error?.code === 'FORBIDDEN',
    `sin clave de administrador → ${errorOf(denied)}`,
  );
  const dist = await call('POST', '/distribute', body, { admin: true });
  const mine = dist.json.payouts?.find((p) => p.investorId === id);
  expect(
    dist.status === 200 && dist.json.simulated === true && mine?.usdc === '0.0050000',
    `POST /distribute 1 USDC → el inversionista (5/1000 fracciones) cobra ${mine?.usdc}`,
  );
  const pf2 = await call('GET', `/portfolio/${id}`);
  const received = pf2.json.holdings?.[0]?.returnsReceivedUsdc;
  expect(
    received === '0.0050000' && pf2.json.returns?.[0]?.period === period,
    `el portafolio refleja el retorno (${received} USDC, período ${pf2.json.returns?.[0]?.period})`,
  );

  console.log('\nE. Trazabilidad');
  const trace = await call('GET', '/trace/SOYA01');
  expect(
    trace.status === 200 && trace.json.length >= 2 && trace.json.every((m) => m.verified === true),
    `GET /trace/SOYA01 → ${trace.json.length} hitos, todos "Verificado en Stellar"`,
  );
  const hito = {
    assetId: 'SOYA01',
    type: 'cosecha',
    title: 'Prueba de flujo',
    date: '2027-03-15',
    description: 'Hito de prueba (npm run test:flow).',
  };
  const noKey = await call('POST', '/trace', hito);
  expect(
    noKey.json?.error?.code === 'FORBIDDEN',
    `agregar hito sin clave de administrador → ${errorOf(noKey)}`,
  );
  if (mock || withTrace) {
    const added = await call('POST', '/trace', hito, { admin: true });
    expect(
      added.status === 201 &&
        added.json.verified === true &&
        /^[0-9a-f]{64}$/.test(added.json.hash),
      `POST /trace → hito ${added.json.order} con hash, verified: ${added.json.verified}`,
    );
    const after = await call('GET', '/trace/SOYA01');
    expect(
      after.json.at(-1)?.title === hito.title && after.json.at(-1)?.verified === true,
      'el hito nuevo aparece al final de la línea de tiempo, verificado',
    );
  } else {
    console.log(
      '  – no se agregó un hito de prueba (modo real: queda grabado en Stellar). Usa --con-hito para incluirlo.',
    );
  }

  const asset = await call('GET', '/assets/SILO01');
  expect(
    asset.status === 200 && asset.json.soldFractions >= 5 && asset.json.traceCount >= 1,
    `GET /assets/SILO01 → ${asset.json.soldFractions} vendidas, ${asset.json.traceCount} hito(s)`,
  );

  console.log(`\nFLUJO OK (${((Date.now() - started) / 1000).toFixed(0)} s)`);
} catch (err) {
  console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  console.error('FLUJO FALLÓ');
  process.exitCode = 1;
}
