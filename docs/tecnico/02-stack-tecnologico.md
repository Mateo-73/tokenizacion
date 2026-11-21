# 02 — Stack tecnológico

## Resumen
| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + react-router | **TypeScript** (plantilla `react-ts`) |
| Login / wallet | Pollar (`@pollar/core`, `@pollar/react`) | **Versiones y funciones por confirmar** en la documentación oficial y con los mentores |
| Backend | Node.js 20+ + Express 5 + **TypeScript** (ESM) | `"type": "module"`; desarrollo con `tsx`, compilación con `tsc` |
| Blockchain | `@stellar/stellar-sdk` sobre Stellar **testnet** | Horizon: `https://horizon-testnet.stellar.org` |
| Datos | Archivo `api/data/db.json` | Sin base de datos externa (2 días) |
| Explorador | https://stellar.expert/explorer/testnet | Para mostrar transacciones en la demo |
| Faucet | Friendbot: `https://friendbot.stellar.org?addr=<G...>` | Fondea XLM de prueba |

Regla de versiones: instalar la última estable y **dejar la versión fija en `package.json`**. No actualizar a mitad de camino.

## Arranque del repo (una sola persona, 10 minutos)
La raíz ya existe (`package.json`, `scripts/install-all.mjs`). Falta crear `api/` y `web/`:
```bash
# Backend (TypeScript + Express 5)
mkdir api && cd api && npm init -y
npm pkg set type=module
npm i --save-exact express cors dotenv @stellar/stellar-sdk
npm i -D --save-exact typescript tsx @types/node @types/express @types/cors
npm pkg set scripts.dev="tsx watch src/server.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/server.js"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.setup:stellar="tsx ../scripts/setup-stellar.ts"
npm pkg set scripts.seed="tsx ../scripts/seed.ts"
cd ..
# Frontend (React + TypeScript)
npm create vite@latest web -- --template react-ts
cd web && npm i && npm i react-router-dom
npm i -D tailwindcss @tailwindcss/vite   # seguir la guía oficial de Tailwind + Vite
npm pkg set scripts.typecheck="tsc -b --noEmit"
```
Desde la raíz, `npm install` instala todo y `npm run dev` levanta API y web.

## `.gitignore` mínimo (raíz)
```
node_modules
.env
api/.env
api/.stellar-keys.json
api/data/
dist
.DS_Store
```
(Se trackea `api/data/seed.json` si se crea; `db.json` con claves demo NO.)

## Variables de entorno — `api/.env.example`
```
PORT=3001
MOCK_MODE=true                            # pasar a false cuando api/src/stellar/ esté conectado
HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK=testnet
ADMIN_KEY=cambiar-por-un-valor-largo      # header x-admin-key para endpoints de admin
# Las siguientes las genera `npm run setup:stellar` y se guardan en .stellar-keys.json
ISSUER_PUBLIC=
DISTRIBUTOR_PUBLIC=
TREASURY_PUBLIC=
USDC_ISSUER_PUBLIC=
```
Los secretos (`*_SECRET`) viven **solo** en `api/.stellar-keys.json`, que no se commitea.

## Variables del frontend — `web/.env.example`
```
VITE_API_URL=http://localhost:3001/api
VITE_POLLAR_API_KEY=            # según la documentación de Pollar
```

## CORS y puertos
API en `3001`, web en `5173`. La API habilita CORS para `http://localhost:5173`.

## Convenciones de código
- ESM (`import`/`export`) en todo el repo. TypeScript estricto (`"strict": true`).
- En el backend, los imports relativos llevan extensión `.js` (`import { x } from './x.js'`), requisito de ESM en Node con TypeScript.
- Montos de Stellar siempre como **string** con máximo 7 decimales.
- Códigos de asset: `SILO01`, `SOYA01` (alfanuméricos, máximo 12). El `assetId` de la API es el código del asset.
- Respuestas de la API en JSON, claves en camelCase (ver docs/tecnico/04).
- Manejo de errores uniforme: `{ "error": { "code": "...", "message": "..." } }`.

## Pendientes de confirmar con mentores (no bloquear por ellos)
1. Funciones de Pollar disponibles en testnet (firmar trustline, firmar pagos, KYC).
2. Si existe un USDC de testnet recomendado por la hackathon; por ahora usamos USDC de prueba propio.
3. Integración útil con Vaquita (opcional).
