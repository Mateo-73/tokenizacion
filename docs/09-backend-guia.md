# 09 — Guía del backend

Dueño: **Mateo** (API + capa Stellar). Contrato: `docs/04`. Datos: `docs/05`. Stellar: `docs/03`. Tareas y orden: `docs/11` (secciones 4 y 5).

**Orden de trabajo:** M1 (API en mock, desbloquea a Luis) → S1 → S2 → S3 (hito de hoy) → M2 → M3 → M4 → S4 → S5 → M5 → M6 → S6 → M7 → M8 → S7 → M9.

## 1. Estructura
```
api/
├─ package.json            "type": "module"
├─ .env / .env.example
├─ .stellar-keys.json      generado por setup, en .gitignore
├─ data/ seed.json · db.json (db.json en .gitignore)
└─ src/
   ├─ server.js
   ├─ errors.js            AppError, mapeo de códigos, errorHandler, wrap()
   ├─ middleware/adminAuth.js
   ├─ routes/              index.js, assets.js, investors.js, authorize.js, buy.js, portfolio.js, distribute.js, trace.js
   ├─ services/            db.js, assets.js, investors.js, trace.js
   ├─ mocks/fixtures.js    respuestas de docs/04
   └─ stellar/             client.js, accounts.js, assets.js, trading.js, trace.js, index.js
scripts/                   setup-stellar.js, seed.js, demo-buy.js, test-flow.js
```
Los scripts de `scripts/` **no importan paquetes npm directamente** (se resolverían desde `scripts/` y fallarían): importan módulos de `api/src/...`, que sí encuentran `api/node_modules`.

## 2. Scripts de `package.json` (en `api/`)
```json
{
  "scripts": {
    "dev": "nodemon --env-file=.env src/server.js",
    "start": "node --env-file=.env src/server.js",
    "setup:stellar": "node --env-file=.env ../scripts/setup-stellar.js",
    "seed": "node --env-file=.env ../scripts/seed.js",
    "demo:buy": "node --env-file=.env ../scripts/demo-buy.js",
    "test:flow": "node --env-file=.env ../scripts/test-flow.js"
  }
}
```
> En este repositorio la API carga `api/.env` con `dotenv` (en `server.js`), por eso los scripts de `package.json` no llevan `--env-file`.

`--env-file` requiere Node 20.6+. Todos se ejecutan desde `api/` (la ruta `data/` es relativa a ese directorio).

## 3. Servidor (`src/server.js`)
```js
import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { errorHandler } from './errors.js';

const app = express();
app.use(cors({ origin: ['http://localhost:5173'] }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true, mock: process.env.MOCK_MODE === 'true' }));
app.use('/api', router);
app.use(errorHandler);

const port = process.env.PORT ?? 3001;
app.listen(port, () => console.log(`API en http://localhost:${port} (mock: ${process.env.MOCK_MODE === 'true'})`));
```

## 4. Errores (`src/errors.js`)
```js
export class AppError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
const STATUS = {
  VALIDATION: 400, NOT_FOUND: 404, NOT_AUTHORIZED: 403, INSUFFICIENT_USDC: 400,
  INSUFFICIENT_FRACTIONS: 400, FORBIDDEN: 403, STELLAR_ERROR: 502,
};
export function toAppError(err) {
  if (err instanceof AppError) return err;
  if (err?.code && STATUS[err.code]) return new AppError(err.code, err.message, STATUS[err.code]);
  return new AppError('STELLAR_ERROR', 'Error al comunicarse con Stellar', 502);
}
export function errorHandler(err, _req, res, _next) {
  const e = toAppError(err);
  console.error(`[${e.code}] ${e.message}`);   // nunca registrar secretos ni cuerpos completos
  res.status(e.status).json({ error: { code: e.code, message: e.message } });
}
export const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
```

## 5. Datos (`src/services/db.js`)
> En este repositorio vive en `api/src/data/db.js` (`createStore`), con los mismos métodos agrupados por colección; ver `docs/05` § "Cómo lo implementa la API".

```js
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DB_PATH = resolve(process.cwd(), 'data/db.json');
const SEED_PATH = resolve(process.cwd(), 'data/seed.json');
let cache;

export function load() {
  if (cache) return cache;
  if (!existsSync(DB_PATH)) { mkdirSync(dirname(DB_PATH), { recursive: true }); writeFileSync(DB_PATH, readFileSync(SEED_PATH)); }
  cache = JSON.parse(readFileSync(DB_PATH, 'utf8'));
  return cache;
}
export function save() {
  const tmp = `${DB_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(cache, null, 2));
  renameSync(tmp, DB_PATH);               // escritura atómica
}
export const nextId = (prefix, list) => `${prefix}_${String(list.length + 1).padStart(3, '0')}`;
```

## 6. Admin (`src/middleware/adminAuth.js`)
```js
import { AppError } from '../errors.js';
export function adminAuth(req, _res, next) {
  if (!process.env.ADMIN_KEY || req.header('x-admin-key') !== process.env.ADMIN_KEY) {
    return next(new AppError('FORBIDDEN', 'Clave de administrador inválida', 403));
  }
  next();
}
```
Aplicar a `POST /distribute` y `POST /trace`.

## 7. Modo mock
- `MOCK_MODE=true` → cada ruta devuelve su ejemplo de `docs/04` desde `src/mocks/fixtures.js` **antes** de tocar Stellar o `db.json`.
- Patrón en cada ruta: `if (process.env.MOCK_MODE === 'true') return res.json(fixtures.buy);`
- En mock, `txHash` es falso y `explorerUrl` es `null`.
- Entregar el modo mock completo es la **primera tarea (M1)**: Luis depende de él.

## 8. Ejemplo de ruta (`routes/buy.js`)
```js
import { Router } from 'express';
import { AppError, wrap } from '../errors.js';
import * as stellar from '../stellar/index.js';
import { getAsset } from '../services/assets.js';
import { getInvestor } from '../services/investors.js';
import { fixtures } from '../mocks/fixtures.js';

export const buyRouter = Router();

buyRouter.post('/', wrap(async (req, res) => {
  if (process.env.MOCK_MODE === 'true') return res.json(fixtures.buy);
  const { investorId, assetId, fractions } = req.body ?? {};
  if (!Number.isInteger(fractions) || fractions < 1) {
    throw new AppError('VALIDATION', 'fractions debe ser un entero mayor o igual a 1');
  }
  const asset = getAsset(assetId);          // lanza NOT_FOUND
  const investor = getInvestor(investorId); // lanza NOT_FOUND
  const out = await stellar.buyFractions({
    investorSecret: investor.secret, code: assetId, fractions, pricePerFraction: asset.pricePerFraction,
  });
  res.json({ assetId, fractions, totalUsdc: out.totalUsdc, txHash: out.txHash, explorerUrl: stellar.explorerTx(out.txHash) });
}));
```
Y en `routes/index.js`: `router.use('/buy', buyRouter)`, etc.

## 9. Fracciones vendidas (`services/assets.js`)
```js
export async function withLiveData(asset) {
  const dist = await stellar.getPortfolio({ publicKey: process.env.DISTRIBUTOR_PUBLIC });
  const left = dist.holdings.find((h) => h.code === asset.id)?.fractions ?? asset.totalFractions;
  return { ...asset, soldFractions: asset.totalFractions - left, availableFractions: left,
           issuer: process.env.ISSUER_PUBLIC, traceCount: traceFor(asset.id).length };
}
```

## 10. Qué llama a qué
| Ruta | Servicio | Función Stellar |
|---|---|---|
| `GET /assets`, `/assets/:id` | assets | `getPortfolio` (del distribuidor) |
| `POST /investors/demo` | investors | `createDemoInvestor` |
| `POST /authorize` | investors | `authorizeInvestor` |
| `POST /buy` | assets, investors | `buyFractions` |
| `GET /portfolio/:id` | investors, assets | `getPortfolio` |
| `POST /distribute` | assets | `getHolders`, `distributeReturns` |
| `GET/POST /trace` | trace | `recordTrace`, `verifyTrace` |

## 11. Scripts
- **`setup-stellar.js`** (docs/03 §4.1): idempotente. Si `.stellar-keys.json` existe, no regenera claves. `stellar/accounts.js` lee ese archivo y completa `process.env.*_PUBLIC` si faltan (así no hay que copiarlas a mano al `.env`).
- **`seed.js`:** (1) para cada activo de `seed.json` sin emitir, `issueAsset`; (2) para cada hito sin `hash`, `recordTrace` y guardar `hash` y `txHash` en `db.json`. Idempotente.
- **`demo-buy.js`:** crea inversionista demo, autoriza, compra 10 fracciones de `SILO01` y muestra el enlace al explorador.
- **`test-flow.js` (M9):** recorre el flujo completo contra la API local y falla si algo se rompe:
```js
const API = process.env.API_URL ?? 'http://localhost:3001/api';
async function call(path, method = 'GET', body, admin = false) {
  const res = await fetch(`${API}${path}`, { method,
    headers: { 'content-type': 'application/json', ...(admin ? { 'x-admin-key': process.env.ADMIN_KEY } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${data?.error?.code}: ${data?.error?.message}`);
  return data;
}
const inv = await call('/investors/demo', 'POST', { name: 'QA', email: `qa${Date.now()}@ejemplo.com` });
await call('/authorize', 'POST', { investorId: inv.investorId, assetId: 'SILO01' });
await call('/buy', 'POST', { investorId: inv.investorId, assetId: 'SILO01', fractions: 5 });
const pf = await call(`/portfolio/${inv.investorId}`);
if (!pf.holdings.some((h) => h.assetId === 'SILO01' && h.fractions >= 5)) throw new Error('Portafolio no refleja la compra');
await call('/distribute', 'POST', { assetId: 'SILO01', totalUsdc: '100', period: 'test' }, true);
const t = await call('/trace', 'POST', { assetId: 'SOYA01', type: 'cosecha', title: 'Prueba', date: '2027-03-15', description: 'QA' }, true);
const trace = await call('/trace/SOYA01');
if (!trace.at(-1)?.verified) throw new Error('El hito no quedó verificado');
console.log('FLUJO OK');
```

## 12. Validaciones mínimas
- `fractions`: entero ≥ 1. `assetId` e `investorId`: existen (si no, `NOT_FOUND`).
- `totalUsdc`: número positivo; convertir a string con 7 decimales.
- `type` de hito dentro de la lista permitida; `date` con formato `YYYY-MM-DD`.
- Nunca devolver `secret` en una respuesta.

## 13. Lista de verificación de Mateo
- [ ] M1 API en mock · [ ] S1 cuentas · [ ] S2 activos emitidos · [ ] S3 compra por script
- [ ] M2 db · [ ] M3 lectura · [ ] M4 investors/authorize/buy · [ ] S4 portafolio
- [ ] S5 retornos · [ ] M5 portfolio · [ ] M6 distribute · [ ] S6 trazabilidad
- [ ] M7 trace · [ ] M8 admin · [ ] S7 sin stubs · [ ] M9 `test:flow` en verde
