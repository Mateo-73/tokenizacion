# 02 — Stack tecnológico

## Resumen
| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + react-router | JavaScript o TypeScript, lo decide Luis; mantener consistencia |
| Login / wallet | Pollar (`@pollar/core`, `@pollar/react`) | **Versiones y funciones por confirmar** en la documentación oficial y con los mentores |
| Backend | Node.js 20+ + Express (ESM) | `"type": "module"` |
| Blockchain | `@stellar/stellar-sdk` sobre Stellar **testnet** | Horizon: `https://horizon-testnet.stellar.org` |
| Datos | Archivo `api/data/db.json` | Sin base de datos externa (2 días) |
| Explorador | https://stellar.expert/explorer/testnet | Para mostrar transacciones en la demo |
| Faucet | Friendbot: `https://friendbot.stellar.org?addr=<G...>` | Fondea XLM de prueba |

Regla de versiones: instalar la última estable y **dejar la versión fija en `package.json`**. No actualizar a mitad de camino.

## Arranque del repo (una sola persona, 10 minutos)
```bash
mkdir siembra && cd siembra && git init
mkdir api web scripts docs
# Backend
cd api && npm init -y
npm pkg set type=module
npm i express cors dotenv @stellar/stellar-sdk
npm i -D nodemon
npm pkg set scripts.dev="nodemon src/server.js"
npm pkg set scripts.setup:stellar="node ../scripts/setup-stellar.js"
npm pkg set scripts.seed="node ../scripts/seed.js"
cd ..
# Frontend
npm create vite@latest web -- --template react
cd web && npm i && npm i react-router-dom
npm i -D tailwindcss @tailwindcss/vite   # seguir la guía oficial de Tailwind + Vite
```

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
MOCK_MODE=false
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
- ESM (`import`/`export`) en todo el repo.
- Montos de Stellar siempre como **string** con máximo 7 decimales.
- Códigos de asset: `SILO01`, `SOYA01` (alfanuméricos, máximo 12). El `assetId` de la API es el código del asset.
- Respuestas de la API en JSON, claves en camelCase (ver docs/tecnico/04).
- Manejo de errores uniforme: `{ "error": { "code": "...", "message": "..." } }`.

## Pendientes de confirmar con mentores (no bloquear por ellos)
1. Funciones de Pollar disponibles en testnet (firmar trustline, firmar pagos, KYC).
2. Si existe un USDC de testnet recomendado por la hackathon; por ahora usamos USDC de prueba propio.
3. Integración útil con Vaquita (opcional).
