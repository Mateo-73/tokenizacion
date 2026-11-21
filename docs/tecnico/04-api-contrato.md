# 04 — Contrato de API (es ley)

Base: `http://localhost:3001/api` · JSON · camelCase · montos de USDC como **string**.
Dueños: **Mateo** (implementa) y **Luis** (consume). Cambios: editar este doc primero y avisar al grupo.

## Convenciones
- Éxito: `200` con el objeto descrito. Creación: `201`.
- Error: `{ "error": { "code": "STRING", "message": "texto legible en español" } }`.
- Códigos de error: `VALIDATION`, `NOT_FOUND`, `NOT_AUTHORIZED` (wallet sin autorizar), `INSUFFICIENT_USDC`, `INSUFFICIENT_FRACTIONS`, `FORBIDDEN` (falta `x-admin-key`), `STELLAR_ERROR`.
- Endpoints de administrador requieren el header `x-admin-key: <ADMIN_KEY>`.
- En `MOCK_MODE=true`, mismas formas de respuesta, con `txHash` falso y `explorerUrl: null`.
- Todo dato simulado incluye `simulated: true` o está dentro de un campo etiquetado `...Simulated`.

## `GET /health`
`{ "ok": true, "mock": false }`

## `GET /assets`
Lista de activos.
```json
[{
  "id": "SILO01",
  "name": "Silo de acopio, Santa Cruz (ejemplo)",
  "type": "silo",
  "vertical": "agro",
  "description": "Infraestructura de acopio de granos. Datos de ejemplo.",
  "location": "Santa Cruz, Bolivia",
  "imageUrl": null,
  "totalFractions": 1000,
  "soldFractions": 120,
  "availableFractions": 880,
  "pricePerFraction": "50.0000000",
  "returnLabelSimulated": "Renta de almacenaje simulada, pago periódico",
  "status": "active",
  "issuer": "G...",
  "simulated": true
}]
```
`type`: `silo` | `campaign`. `vertical`: `agro` (el `urbano` es fase 2). `soldFractions` se calcula desde Stellar (`total − balance del DISTRIBUTOR`).

## `GET /assets/:id`
Mismo objeto que arriba, más `traceCount` (número de hitos). `404 NOT_FOUND` si no existe.

## `POST /investors/demo`
Crea (o recupera por `email`) un inversionista demo custodial (Plan B).
Body: `{ "name": "Ana", "email": "ana@ejemplo.com" }`
```json
{ "investorId": "inv_001", "name": "Ana", "publicKey": "G...", "usdcBalance": "1000.0000000" }
```
`investorId` es el identificador que usa el frontend en el resto de endpoints. Si se integra Pollar (Plan A), el frontend envía el identificador del usuario de Pollar en `email` o en un campo `externalId` acordado por Mateo y Luis.

## `POST /authorize`
KYC simulado: autoriza a un inversionista para un activo.
Body: `{ "investorId": "inv_001", "assetId": "SILO01" }`
```json
{ "authorized": true, "assetId": "SILO01", "txHash": "abc...", "explorerUrl": "https://stellar.expert/explorer/testnet/tx/abc...", "simulatedKyc": true }
```

## `POST /buy`
Compra atómica de fracciones.
Body: `{ "investorId": "inv_001", "assetId": "SILO01", "fractions": 10 }`
```json
{ "assetId": "SILO01", "fractions": 10, "totalUsdc": "500.0000000", "txHash": "abc...", "explorerUrl": "https://stellar.expert/explorer/testnet/tx/abc..." }
```
Errores: `NOT_AUTHORIZED` (si no pasó por `/authorize`), `INSUFFICIENT_USDC`, `INSUFFICIENT_FRACTIONS`, `VALIDATION` (`fractions` debe ser entero ≥ 1).

## `GET /portfolio/:investorId`
```json
{
  "investorId": "inv_001",
  "publicKey": "G...",
  "usdcBalance": "500.0000000",
  "holdings": [{
    "assetId": "SILO01", "name": "Silo de acopio, Santa Cruz (ejemplo)",
    "fractions": 10, "pricePerFraction": "50.0000000", "valueUsdc": "500.0000000",
    "returnsReceivedUsdc": "0.0000000"
  }],
  "returns": [{ "assetId": "SILO01", "period": "2026-12", "usdc": "12.0000000", "txHash": "abc...", "explorerUrl": "https://..." }]
}
```

## `POST /distribute` (admin)
Reparte un retorno **simulado** del activo entre los tenedores, proporcional a sus fracciones sobre el total del activo.
Body: `{ "assetId": "SILO01", "totalUsdc": "2000", "period": "2026-12" }`
```json
{
  "assetId": "SILO01", "period": "2026-12", "totalUsdc": "2000.0000000", "simulated": true,
  "payouts": [{ "investorId": "inv_001", "publicKey": "G...", "fractions": 10, "usdc": "20.0000000" }],
  "txHashes": ["abc..."], "explorerUrls": ["https://..."]
}
```

## `GET /trace/:assetId`
Hitos ordenados por `order` ascendente.
```json
[{
  "id": "tr_001", "assetId": "SOYA01", "order": 1,
  "type": "siembra", "title": "Siembra completada", "date": "2026-11-10",
  "description": "200 ha sembradas. Dato de ejemplo.",
  "hash": "9f2c...64hex", "txHash": "abc...", "explorerUrl": "https://...",
  "verified": true, "simulated": true
}]
```
`type`: `siembra` | `insumos` | `cosecha` | `almacenaje` | `venta`. `verified`: el hash recalculado coincide con el guardado en Stellar.

## `POST /trace` (admin)
Body: `{ "assetId": "SOYA01", "type": "cosecha", "title": "Cosecha iniciada", "date": "2027-03-15", "description": "..." }`
Respuesta `201`: el hito creado (misma forma que arriba). `order` se asigna automáticamente.

## Ejemplo de flujo completo (para probar con curl)
```bash
curl -X POST localhost:3001/api/investors/demo -H 'content-type: application/json' -d '{"name":"Ana","email":"ana@ejemplo.com"}'
curl -X POST localhost:3001/api/authorize -H 'content-type: application/json' -d '{"investorId":"inv_001","assetId":"SILO01"}'
curl -X POST localhost:3001/api/buy -H 'content-type: application/json' -d '{"investorId":"inv_001","assetId":"SILO01","fractions":10}'
curl localhost:3001/api/portfolio/inv_001
curl -X POST localhost:3001/api/distribute -H 'content-type: application/json' -H 'x-admin-key: $ADMIN_KEY' -d '{"assetId":"SILO01","totalUsdc":"2000","period":"2026-12"}'
```

## Responsabilidades
- **Mateo:** implementar rutas y servicios, `db.json`, `MOCK_MODE`, validaciones. Llama a `api/src/stellar/index.js` (docs/tecnico/03 §5).
- **Luis:** consumir solo estos endpoints; crear `web/src/mocks/` con las respuestas de arriba para trabajar sin backend.
- **Sebas:** garantizar que las funciones de `stellar/` devuelvan lo que este contrato necesita.
