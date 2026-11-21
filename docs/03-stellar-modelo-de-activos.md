# 03 — Modelo de activos en Stellar (testnet)

Dueño: **Mateo**. Todo lo que toca la red vive en `api/src/stellar/`. Las rutas del API solo usan las funciones exportadas (sección 5).

## 1. Cuentas
| Cuenta | Rol | Notas |
|---|---|---|
| `ISSUER` | Emite todas las fracciones (`SILO01`, `SOYA01`) y guarda los hashes de trazabilidad | Flags `AUTH_REQUIRED` + `AUTH_REVOCABLE` a nivel de cuenta |
| `DISTRIBUTOR` | Guarda las fracciones sin vender; recibe el USDC de las compras | Trustline a cada asset y a USDC |
| `TREASURY` | Paga los retornos | Trustline a USDC; se fondea con USDC de prueba para simular la venta de la cosecha |
| `USDC_ISSUER` | Emisor del USDC **de prueba** | Sin flags. En producción se usaría USDC real |
| `INVESTOR_n` | Cuentas demo custodiales (Plan B) | Creadas por el backend, fondeadas con Friendbot + USDC de prueba |

Un asset en Stellar se identifica por **código + emisor**. Nuestro `USDC` de prueba es distinto del USDC real; hay que decirlo en la demo.

## 2. Assets
| Código | Total de fracciones | Precio | Quién lo emite |
|---|---|---|---|
| `SILO01` | 1.000 | 50 USDC | `ISSUER` |
| `SOYA01` | 2.000 | 25 USDC | `ISSUER` |
| `USDC` (prueba) | ilimitado | 1 USDC = 1 USDC | `USDC_ISSUER` |

Las fracciones son **enteras**: Stellar admite hasta 7 decimales, así que la API valida que `fractions` sea un entero positivo.

## 3. Flags de autorización
- Constantes: `AUTH_REQUIRED = 1`, `AUTH_REVOCABLE = 2`.
- Se activan **una sola vez** en `ISSUER`, **antes** de crear trustlines.
- Con `AUTH_REQUIRED`, nadie puede tener fracciones hasta que el emisor autorice su trustline. Eso implementa el "solo wallets verificadas".
- Con `AUTH_REVOCABLE`, el emisor puede revocar la autorización (útil para explicar cumplimiento).

## 4. Código base (`api/src/stellar/client.js`)
```js
import { Horizon, Networks, TransactionBuilder, BASE_FEE, Keypair, Asset, Operation } from '@stellar/stellar-sdk';

export const server = new Horizon.Server(process.env.HORIZON_URL ?? 'https://horizon-testnet.stellar.org');
export const NETWORK = Networks.TESTNET;
export const AUTH_REQUIRED = 1;
export const AUTH_REVOCABLE = 2;

// Construye, firma y envía una transacción. `sourceKp` es la cuenta de la transacción;
// `extraSigners` son las claves de cuentas usadas como `source` de operaciones individuales.
export async function submit(sourceKp, ops, extraSigners = []) {
  const account = await server.loadAccount(sourceKp.publicKey());
  const builder = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK });
  ops.forEach((op) => builder.addOperation(op));
  const tx = builder.setTimeout(60).build();
  tx.sign(sourceKp, ...extraSigners);
  return server.submitTransaction(tx); // devuelve { hash, ... }
}

export async function fundWithFriendbot(publicKey) {
  const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!res.ok) throw new Error(`Friendbot falló para ${publicKey}`);
}

export const usdcAsset = () => new Asset('USDC', process.env.USDC_ISSUER_PUBLIC);
export const fractionAsset = (code) => new Asset(code, process.env.ISSUER_PUBLIC);
export const explorerTx = (hash) => `https://stellar.expert/explorer/testnet/tx/${hash}`;
```

### 4.1 Setup inicial (`scripts/setup-stellar.js`)
1. Generar keypairs de `ISSUER`, `DISTRIBUTOR`, `TREASURY`, `USDC_ISSUER` con `Keypair.random()`.
2. Fondear las cuatro con Friendbot.
3. Guardar las claves (públicas y secretas) en `api/.stellar-keys.json`; imprimir las líneas `*_PUBLIC` para pegarlas en `api/.env`.
4. `ISSUER` activa flags:
```js
await submit(issuerKp, [Operation.setOptions({ setFlags: AUTH_REQUIRED | AUTH_REVOCABLE })]);
```
5. `DISTRIBUTOR` y `TREASURY` crean trustline a USDC (`Operation.changeTrust({ asset: usdcAsset() })`).
6. `USDC_ISSUER` paga USDC de prueba a `TREASURY` (por ejemplo 100000) para simular fondos de retornos.

### 4.2 Emitir un activo (`assets.js` → `issueAsset`)
```js
const asset = fractionAsset(code);
// 1) el distribuidor confía en el asset
await submit(distributorKp, [Operation.changeTrust({ asset })]);
// 2) el emisor autoriza esa trustline (necesario por AUTH_REQUIRED)
await submit(issuerKp, [Operation.setTrustLineFlags({
  trustor: distributorKp.publicKey(), asset, flags: { authorized: true },
})]);
// 3) el emisor "acuña" todas las fracciones al distribuidor
await submit(issuerKp, [Operation.payment({
  destination: distributorKp.publicKey(), asset, amount: String(totalFractions),
})]);
```

### 4.3 Autorizar a un inversionista (`authorizeInvestor`)
```js
const asset = fractionAsset(code);
// El inversionista crea trustline al asset (lo firma él; en Plan B lo hace el backend con su clave demo)
await submit(investorKp, [Operation.changeTrust({ asset })]);
// El emisor autoriza la trustline = "KYC aprobado"
await submit(issuerKp, [Operation.setTrustLineFlags({
  trustor: investorKp.publicKey(), asset, flags: { authorized: true },
})]);
```
El inversionista también necesita trustline a `USDC` (se crea al crearlo, ver 4.7).

### 4.4 Compra atómica (`trading.js` → `buyFractions`)
Una sola transacción con dos pagos: si falla uno, falla todo.
```js
const total = (fractions * pricePerFraction).toFixed(7);
const ops = [
  Operation.payment({ source: investorKp.publicKey(), destination: distributorKp.publicKey(),
                      asset: usdcAsset(), amount: total }),
  Operation.payment({ source: distributorKp.publicKey(), destination: investorKp.publicKey(),
                      asset: fractionAsset(code), amount: String(fractions) }),
];
// La cuenta de la transacción es el distribuidor; el inversionista firma como source de su operación.
const res = await submit(distributorKp, ops, [investorKp]);
```
Precondiciones (validar antes y devolver error claro): trustline al asset autorizada, saldo USDC suficiente, fracciones disponibles en `DISTRIBUTOR`.

### 4.5 Portafolio (`getPortfolio`)
Leer `server.accounts().accountId(publicKey).call()` y filtrar `balances` por `asset_code` y `asset_issuer === ISSUER_PUBLIC` (fracciones) y por `USDC` (saldo).

### 4.6 Reparto de retornos (`distributeReturns`)
Regla: el retorno total `R` es para **todo el activo**; cada inversionista cobra `R × (sus fracciones / fracciones totales)`. La parte de las fracciones sin vender **no se paga** (queda en `TREASURY`, es del productor).
```js
const res = await server.accounts().forAsset(fractionAsset(code)).limit(200).call();
const holders = res.records
  .map((r) => ({
    publicKey: r.account_id,
    balance: Number(r.balances.find((b) => b.asset_code === code && b.asset_issuer === process.env.ISSUER_PUBLIC)?.balance ?? 0),
  }))
  .filter((h) => h.publicKey !== process.env.DISTRIBUTOR_PUBLIC && h.balance > 0);

const payouts = holders
  .map((h) => ({ ...h, usdc: Math.floor((totalUsdc * h.balance / totalFractions) * 1e7) / 1e7 }))
  .filter((p) => p.usdc > 0);

// Lotes de máximo 50 pagos por transacción
for (const batch of chunk(payouts, 50)) {
  await submit(treasuryKp, batch.map((p) => Operation.payment({
    destination: p.publicKey, asset: usdcAsset(), amount: p.usdc.toFixed(7),
  })));
}
```
Devolver `txHashes` y la lista de pagos.

### 4.7 Crear inversionista demo (`createDemoInvestor`)
1. `Keypair.random()` + Friendbot.
2. `changeTrust` a `USDC`.
3. `USDC_ISSUER` le paga USDC de prueba (por ejemplo 1000) → "fondeo de demo".
4. Guardar `publicKey` y `secret` en `api/data/db.json` (solo testnet, en `.gitignore`).

### 4.8 Trazabilidad (`trace.js`)
Cada hito se resume en un hash SHA-256 que se guarda on-chain como entrada de datos de la cuenta `ISSUER`.
```js
import { createHash } from 'node:crypto';
// Orden de claves FIJO para que el hash sea reproducible
const canonical = JSON.stringify({ assetId, type, title, date, description });
const hash = createHash('sha256').update(canonical).digest(); // 32 bytes
await submit(issuerKp, [Operation.manageData({ name: `t.${assetId}.${order}`, value: hash })]);
```
- El nombre de la entrada tiene máximo 64 bytes; el valor, máximo 64 bytes (usamos 32).
- Verificar: recalcular el hash del hito guardado en `db.json` y compararlo con `data` de `server.accounts().accountId(ISSUER).call()` (los valores vienen en base64). `verified: true` si coinciden.
- Cada entrada de datos sube la reserva mínima de la cuenta (0,5 XLM); en testnet no es problema.

### 4.9 Opcional: reventa en el DEX
`Operation.manageSellOffer({ selling: fractionAsset(code), buying: usdcAsset(), amount, price })`. Solo si el núcleo ya funciona; el comprador necesita trustline autorizada al asset.

## 5. Interfaz exportada (`api/src/stellar/index.js`), consumida por las rutas del API
> **El contrato exacto de esta interfaz está documentado en `api/src/services/stellar-port.js`** (`StellarPort`, con JSDoc). Si hay diferencias con el bloque de abajo, manda ese archivo. Diferencias acordadas al implementarlo:
> - `distributeReturns` devuelve `payouts: [{ publicKey, fractions, usdc, txHash }]` (el `txHash` del lote en que viajó cada pago).
> - `explorerTx(hash)` es síncrona y devuelve `string | null` (`null` en modo mock).
> - `getHolders` no incluye la cuenta `DISTRIBUTOR`.
> - `recordTrace` no reescribe lo ya registrado: con el mismo hash devuelve `txHash: null`; con otro contenido lanza `VALIDATION`. `hashTrace` vive en `api/src/trace-hash.js`, compartido con `services/`.
> - `issueAsset` es idempotente: si el asset ya estaba emitido no emite nada y devuelve `txHash: null`.
> - Para conectar `stellar/` hay que devolverlo en `loadStellar` (`api/src/bootstrap.js`) cuando `MOCK_MODE=false`. `services/mock-stellar.js` es una implementación completa de referencia.

Todas son `async`. Los montos son strings; los errores se lanzan como `Error` con `.code` (`NOT_AUTHORIZED`, `INSUFFICIENT_USDC`, `INSUFFICIENT_FRACTIONS`, `STELLAR_ERROR`).
```js
setupAccounts()                                  // idempotente; usado por el script de setup
issueAsset({ code, totalFractions })             // → { txHash }
createDemoInvestor({ initialUsdc })              // → { publicKey, secret }
authorizeInvestor({ investorSecret, code })      // → { txHash }
buyFractions({ investorSecret, code, fractions, pricePerFraction }) // → { txHash, totalUsdc }
getPortfolio({ publicKey })                      // → { usdcBalance, holdings: [{ code, fractions }] }
getHolders({ code })                             // → [{ publicKey, balance }]
distributeReturns({ code, totalUsdc, totalFractions }) // → { txHashes, payouts }
recordTrace({ assetId, type, title, date, description, order }) // → { hash, txHash }
verifyTrace({ assetId, order, hash })            // → boolean
explorerTx(hash)                                 // → URL
```

## 6. Lista de verificación de la capa Stellar (en este orden)
1. [x] `setup-stellar.js` crea y fondea las 4 cuentas; claves en `.stellar-keys.json`.
2. [x] Flags activos en `ISSUER` (verificar en el explorador).
3. [x] `issueAsset` para `SILO01` y `SOYA01`; el distribuidor muestra el total.
4. [x] `createDemoInvestor` + `authorizeInvestor` + `buyFractions` funcionan **por script** (`npm run demo:buy`), con `txHash` visible en el explorador.
5. [x] `getPortfolio` refleja la compra (`npm run portfolio -- <clave pública>`).
6. [x] `distributeReturns` paga USDC proporcional (`npm run demo:distribute`).
7. [x] `recordTrace` + `verifyTrace` (`npm run demo:trace`).
8. [ ] Exportar todo desde `stellar/index.js` con las firmas de arriba.
9. [ ] (Opcional) reventa en DEX.

## 7. Errores típicos
- `op_no_trust`: falta la trustline. `op_not_authorized`: el emisor no autorizó la trustline. `op_underfunded`: saldo insuficiente. `tx_bad_auth`: falta una firma (en compras atómicas deben firmar distribuidor **e** inversionista).
- Si Horizon responde lento o falla, reintentar una vez; si persiste, avisar y usar mock.
