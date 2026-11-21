# Probar la API con `curl`

Todos los comandos de esta página se ejecutaron contra la API real y las respuestas que ves son las que devuelve (con los valores de ejemplo del modo mock). Contrato completo: [`04-api-contrato.md`](04-api-contrato.md).

## 1. Preparación

```bash
cp api/.env.example api/.env        # trae MOCK_MODE=true (Stellar simulado, sin red)
npm run dev:api                     # http://localhost:3001/api
```

En otra terminal, define estas dos variables (la clave de administrador es la de `api/.env`):

```bash
API=http://localhost:3001/api
ADMIN_KEY=$(grep '^ADMIN_KEY=' api/.env | cut -d= -f2 | cut -d' ' -f1)
```

> **Modo mock vs real.** Con `MOCK_MODE=true` los `txHash` son falsos y `explorerUrl` es `null`; los datos viven en memoria y se reinician al apagar la API. Con `MOCK_MODE=false` los mismos comandos funcionan contra Stellar testnet (más lentos, y mueven fondos de prueba). Los ejemplos de abajo muestran el modo mock.
>
> Los comandos con `-H "x-admin-key: ..."` usan **comillas dobles** a propósito: con comillas simples el shell no expande `$ADMIN_KEY` y la API responde `FORBIDDEN`.

## 2. Flujo completo (en este orden)

### 2.1 Estado y catálogo
```bash
curl $API/health
curl $API/assets
curl $API/assets/SILO01
```
```json
{ "ok": true, "mock": true }
```
`GET /assets/SILO01` (el listado devuelve la misma forma sin `traceCount`):
```json
{
  "id": "SILO01",
  "name": "Silo de acopio, Santa Cruz (ejemplo)",
  "type": "silo",
  "vertical": "agro",
  "description": "Infraestructura de acopio de granos. Datos de ejemplo.",
  "location": "Santa Cruz, Bolivia",
  "imageUrl": null,
  "totalFractions": 1000,
  "pricePerFraction": "50.0000000",
  "returnLabelSimulated": "Renta de almacenaje simulada, pago periódico",
  "status": "active",
  "simulated": true,
  "soldFractions": 120,
  "availableFractions": 880,
  "issuer": "GMOCKAAAA…",
  "traceCount": 1
}
```

### 2.2 Entrar: crear (o recuperar) un inversionista demo
```bash
curl -X POST $API/investors/demo -H 'content-type: application/json' \
  -d '{"name":"Ana","email":"ana@ejemplo.com"}'
```
`201` la primera vez; `200` con el mismo `investorId` si el email ya existe. Nunca devuelve la clave secreta.
```json
{
  "investorId": "inv_001",
  "name": "Ana",
  "publicKey": "GGQ7E3X26IFLAFLKVN7HPHQZYRWRRBKLKJ7RK3XQYRS7ZOF5JYD27EUP",
  "usdcBalance": "1000.0000000"
}
```

### 2.3 Verificar identidad (KYC simulado)
```bash
curl -X POST $API/authorize -H 'content-type: application/json' \
  -d '{"investorId":"inv_001","assetId":"SILO01"}'
```
```json
{
  "authorized": true,
  "assetId": "SILO01",
  "txHash": "b19387161ce8e27872062691f9ffb3673b8a8bc5611143220c91d447d8016a17",
  "explorerUrl": null,
  "simulatedKyc": true
}
```

### 2.4 Comprar fracciones
```bash
curl -X POST $API/buy -H 'content-type: application/json' \
  -d '{"investorId":"inv_001","assetId":"SILO01","fractions":10}'
```
```json
{
  "assetId": "SILO01",
  "fractions": 10,
  "totalUsdc": "500.0000000",
  "txHash": "7324c15f0690cf3e959a6570c8dc2c51e3aebaba0ac2de9fd7ef5dff1f0063c6",
  "explorerUrl": null
}
```

### 2.5 Portafolio
```bash
curl $API/portfolio/inv_001
```
```json
{
  "investorId": "inv_001",
  "publicKey": "GGQ7E3X26IFLAFLKVN7HPHQZYRWRRBKLKJ7RK3XQYRS7ZOF5JYD27EUP",
  "usdcBalance": "500.0000000",
  "holdings": [
    {
      "assetId": "SILO01",
      "name": "Silo de acopio, Santa Cruz (ejemplo)",
      "fractions": 10,
      "pricePerFraction": "50.0000000",
      "valueUsdc": "500.0000000",
      "returnsReceivedUsdc": "0.0000000"
    }
  ],
  "returns": []
}
```

### 2.6 Repartir un retorno simulado (administrador)
```bash
curl -X POST $API/distribute -H 'content-type: application/json' \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{"assetId":"SILO01","totalUsdc":"2000","period":"2026-12"}'
```
Cada tenedor cobra `totalUsdc × (sus fracciones / total del activo)`; la parte sin vender no se paga. En mock hay además un inversionista de ejemplo (`inv_ejemplo`, 120 fracciones):
```json
{
  "assetId": "SILO01",
  "period": "2026-12",
  "totalUsdc": "2000.0000000",
  "simulated": true,
  "payouts": [
    { "investorId": "inv_ejemplo", "publicKey": "GNE3VYF2…", "fractions": 120, "usdc": "240.0000000" },
    { "investorId": "inv_001", "publicKey": "GGQ7E3X2…", "fractions": 10, "usdc": "20.0000000" }
  ],
  "txHashes": ["6046b3799f7c4fa6cd25de2b8262b25eeb8ac87b2882cee692077705a51982bf"],
  "explorerUrls": [null]
}
```
Vuelve a pedir `curl $API/portfolio/inv_001`: ahora `returnsReceivedUsdc` es `20.0000000`, `usdcBalance` sube a `520.0000000` y `returns` trae el pago (`period`, `usdc`, `txHash`, `explorerUrl`).

### 2.7 Trazabilidad
```bash
curl $API/trace/SOYA01
```
Hitos ordenados por `order`; `verified: true` significa que el hash recalculado coincide con el registrado en Stellar:
```json
{
  "id": "tr_001",
  "assetId": "SOYA01",
  "order": 1,
  "type": "siembra",
  "title": "Siembra completada",
  "date": "2026-11-10",
  "description": "200 ha sembradas. Dato de ejemplo.",
  "hash": "1e44ab6d1360cf060d2e73f2568552f7eef4068c4957f4eaa591bd10abc1ce77",
  "txHash": "ce6b1b44889a68735e0fca7915a9632cc17a5c743caf6e456d72bd863c0cf8d8",
  "simulated": true,
  "explorerUrl": null,
  "verified": true
}
```
Agregar un hito en vivo (administrador; `order` se asigna solo; `type`: `siembra`, `insumos`, `cosecha`, `almacenaje` o `venta`):
```bash
curl -X POST $API/trace -H 'content-type: application/json' \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{"assetId":"SOYA01","type":"cosecha","title":"Cosecha iniciada","date":"2027-03-15","description":"Dato de ejemplo."}'
```
Responde `201` con el hito creado (con su `hash`, `txHash` y `verified: true`).

> ⚠ En modo real, un hito agregado **queda grabado para siempre** en Stellar y aparece en la demo.

## 3. Errores

Todos tienen la forma `{ "error": { "code": "...", "message": "..." } }`. Decide siempre por `error.code`.

| Qué probar | Comando (resumen) | Respuesta |
|---|---|---|
| Fracciones inválidas | `POST /buy` con `"fractions":0` | `400 VALIDATION` |
| Comprar sin verificar | `POST /buy` de un inversionista nuevo | `403 NOT_AUTHORIZED` |
| USDC insuficiente | `POST /buy` con `"fractions":100` tras la compra de 10 | `400 INSUFFICIENT_USDC` |
| Más fracciones de las que hay | `POST /buy` con `"fractions":100000` | `400 INSUFFICIENT_FRACTIONS` |
| Administrador sin clave | `POST /distribute` o `POST /trace` sin el header | `403 FORBIDDEN` |
| Activo inexistente | `curl $API/assets/NOPE` | `404 NOT_FOUND` |

Ejemplo (valores reales):
```bash
curl -i -X POST $API/distribute -H 'content-type: application/json' \
  -d '{"assetId":"SILO01","totalUsdc":"1","period":"2026-12"}'
# HTTP/1.1 403 Forbidden
# {"error":{"code":"FORBIDDEN","message":"Falta o es inválido el header x-admin-key."}}
```

## 4. Todo el flujo, automatizado

`npm run test:flow` recorre estos mismos pasos (y los errores) y termina con `FLUJO OK` o con el motivo del fallo. Ver [`13-testing-y-qa.md`](13-testing-y-qa.md).
