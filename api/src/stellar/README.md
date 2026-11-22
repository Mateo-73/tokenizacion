# `api/src/stellar/` — capa Stellar

Todo lo que habla con la red vive aquí; es la **única carpeta que importa `@stellar/stellar-sdk`**. `services/` solo usa lo que exporta `index.js` (contrato en `services/stellar-port.js` y `docs/03-stellar-modelo-de-activos.md` §5). Solo testnet.

| Archivo | Qué hace |
|---|---|
| `index.js` | Exporta las funciones del contrato (`StellarPort`) |
| `client.js` | Conexión a Horizon, `submit` (firma y envía, con un reintento), `loadAccount`, helpers de assets y errores con códigos de Stellar |
| `keys.js` | Lee y guarda `api/.stellar-keys.json` (claves de las 4 cuentas) |
| `accounts.js` | `setupAccounts` (idempotente) y `createDemoInvestor` |
| `assets.js` | `issueAsset` (idempotente) y `authorizeInvestor` (KYC simulado) |
| `trading.js` | `buyFractions`: una transacción con dos pagos y dos firmas |
| `portfolio.js` | `getPortfolio` y `getHolders`, leídos de Horizon |
| `returns.js` | `distributeReturns`: pago proporcional desde `TREASURY`, lotes de 50 |
| `trace.js` | `recordTrace` y `verifyTrace`: hash del hito en `manageData` del `ISSUER` |

## Cómo usarla

La API usa esta capa cuando `MOCK_MODE=false` en `api/.env` (con `true` usa `services/mock-stellar.js`, sin red). Necesita `api/.stellar-keys.json`, que **no está en git**: se genera con `npm run setup:stellar` o se pide a quien lo ejecutó (ver README de la raíz).

## Scripts (desde la raíz del repo)

Los scripts viven en `scripts/` y solo importan módulos de `api/src/` (no paquetes npm).

| Comando | Para qué | Efecto en testnet |
|---|---|---|
| `npm run setup:stellar` | Crea y fondea las 4 cuentas, flags de autorización, USDC de prueba | Idempotente; hacerlo una sola vez |
| `npm run seed` | Emite `SILO01` y `SOYA01`, registra el hash de los hitos de la semilla y crea `api/data/db.json` | Idempotente. No lo ejecutes con la API encendida: reiníciala después |
| `npm run portfolio -- <G...>` | Muestra el portafolio de una wallet y los tenedores | Solo lectura |
| `npm run test:flow` | Flujo A→E completo a través de la API encendida (mock o real) | En modo real: compra 5 fracciones de `SILO01` y reparte 1 USDC; hito solo con `-- --con-hito` |
| `npm run demo:trace` | Registra y verifica un hito en un activo de pruebas y lo borra | Limpia lo que crea |
| `npm run demo:buy` | Flujo completo de compra y errores esperados | ⚠ Compra 10 fracciones de `SILO01` en cada ejecución |
| `npm run demo:distribute` | Reparto de retornos con dos inversionistas | ⚠ Compra fracciones de `SOYA01` y paga USDC de prueba a todos sus tenedores |

Notas: si `db.json` se borra y se recrea con `npm run seed`, los hitos recuperan su `txHash` original desde los efectos de Horizon (no se vuelve a escribir en Stellar). `npm run dev` ignora `data/` para que escribir `db.json` no corte una compra en curso; tras correr el seed, reinicia la API a mano para que lea la base actualizada.

## Orden para empezar de cero

1. `npm run setup:stellar` (genera `api/.stellar-keys.json`).
2. `npm run seed`.
3. Poner `MOCK_MODE=false` y `ADMIN_KEY` en `api/.env` y `npm run dev:api`.

## Reglas

- Montos siempre `string` con hasta 7 decimales (en enteros internamente, `src/money.js`); fracciones enteras.
- Los errores se lanzan con `.code` (`NOT_AUTHORIZED`, `INSUFFICIENT_USDC`, `INSUFFICIENT_FRACTIONS`, `STELLAR_ERROR`, `VALIDATION`, `NOT_FOUND`).
- Nada de secretos en logs ni en respuestas. Las claves solo están en `api/.stellar-keys.json` (ignorado por git).
- Si cambias una firma, cambia también `services/stellar-port.js` y `services/mock-stellar.js`: `api/test/stellar-port.test.js` falla si se desalinean.
