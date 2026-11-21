# 05 — Modelo de datos

Dueño: **Mateo**. Persistencia en un archivo JSON (`api/data/db.json`), sin base de datos externa.

## Principio
**Stellar es la fuente de verdad** para balances y propiedad de fracciones. `db.json` guarda solo lo que Stellar no guarda: textos del catálogo, imágenes, precios, hitos, mapeo inversionista → wallet e historial de retornos.

| Dato | Dónde vive |
|---|---|
| Fracciones que tiene cada wallet, saldo USDC | Stellar (Horizon) |
| Fracciones vendidas / disponibles | Calculado desde Stellar (`total − balance del DISTRIBUTOR`) |
| Hash del hito | Stellar (entrada `t.<assetId>.<order>` de la cuenta `ISSUER`) y copia en `db.json` |
| Nombre, descripción, precio, imagen del activo | `db.json` |
| Inversionistas demo (nombre, email, wallet, clave) | `db.json` (**solo testnet**) |
| Historial de retornos repartidos | `db.json` |

## Archivos
- `api/data/seed.json` — semilla, **se versiona** (sin claves ni hashes).
- `api/data/db.json` — base en uso, se crea copiando la semilla si no existe; **en `.gitignore`** (puede contener claves demo).

## Estructura de `db.json`
```json
{
  "assets": [],
  "investors": [],
  "trace": [],
  "returns": []
}
```

### `assets[]`
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
  "simulated": true
}
```
Campos que **no** se guardan y se calculan al responder: `soldFractions`, `availableFractions`, `issuer`, `traceCount`.

### `investors[]`
```json
{
  "id": "inv_001",
  "name": "Ana",
  "email": "ana@ejemplo.com",
  "publicKey": "G...",
  "secret": "S...",
  "authorizedAssets": ["SILO01"],
  "createdAt": "2026-11-21T10:00:00.000Z"
}
```
`secret` **nunca** sale en una respuesta de la API ni en logs. `authorizedAssets` es un caché de conveniencia; la verdad es la trustline autorizada en Stellar.

### `trace[]`
```json
{
  "id": "tr_001",
  "assetId": "SOYA01",
  "order": 1,
  "type": "siembra",
  "title": "Siembra completada",
  "date": "2026-11-10",
  "description": "200 ha sembradas. Dato de ejemplo.",
  "hash": null,
  "txHash": null,
  "simulated": true
}
```
`hash` y `txHash` son `null` hasta que el hito se registra on-chain (el `seed.js` los registra al correrse). `type`: `siembra | insumos | cosecha | almacenaje | venta`. El hash se calcula sobre `{assetId, type, title, date, description}` en ese orden de claves (docs/03 §4.8): **no cambiar esos campos después de registrar** o `verified` dará `false`.

### `returns[]`
```json
{
  "id": "ret_001",
  "assetId": "SILO01",
  "period": "2026-12",
  "totalUsdc": "2000.0000000",
  "payouts": [{ "investorId": "inv_001", "publicKey": "G...", "fractions": 10, "usdc": "20.0000000" }],
  "txHashes": ["abc..."],
  "simulated": true,
  "createdAt": "2026-12-01T10:00:00.000Z"
}
```

## Semilla (`seed.json`)
```json
{
  "assets": [
    { "id": "SILO01", "name": "Silo de acopio, Santa Cruz (ejemplo)", "type": "silo", "vertical": "agro",
      "description": "Infraestructura de acopio de granos. Datos de ejemplo.", "location": "Santa Cruz, Bolivia",
      "imageUrl": null, "totalFractions": 1000, "pricePerFraction": "50.0000000",
      "returnLabelSimulated": "Renta de almacenaje simulada, pago periódico", "status": "active", "simulated": true },
    { "id": "SOYA01", "name": "Campaña de soya verano 2026/27, 200 ha (ejemplo)", "type": "campaign", "vertical": "agro",
      "description": "Financiamiento de una campaña de soya. Datos de ejemplo.", "location": "Santa Cruz, Bolivia",
      "imageUrl": null, "totalFractions": 2000, "pricePerFraction": "25.0000000",
      "returnLabelSimulated": "Pago único simulado al vender la cosecha", "status": "active", "simulated": true }
  ],
  "investors": [],
  "trace": [
    { "id": "tr_001", "assetId": "SOYA01", "order": 1, "type": "siembra", "title": "Siembra completada",
      "date": "2026-11-10", "description": "200 ha sembradas. Dato de ejemplo.", "hash": null, "txHash": null, "simulated": true },
    { "id": "tr_002", "assetId": "SOYA01", "order": 2, "type": "insumos", "title": "Insumos aplicados",
      "date": "2026-11-25", "description": "Fertilización y control de plagas. Dato de ejemplo.", "hash": null, "txHash": null, "simulated": true },
    { "id": "tr_003", "assetId": "SILO01", "order": 1, "type": "almacenaje", "title": "Ingreso de grano al silo",
      "date": "2026-11-15", "description": "Primer lote almacenado. Dato de ejemplo.", "hash": null, "txHash": null, "simulated": true }
  ],
  "returns": []
}
```
`order` es **por activo** (cada activo empieza en 1).

## Reglas
1. Escritura atómica (archivo temporal + rename) para no corromper el JSON.
2. IDs legibles: `inv_001`, `tr_001`, `ret_001` (prefijo + contador de 3 dígitos).
3. Montos USDC siempre como string con 7 decimales.
4. Todo registro de ejemplo lleva `simulated: true`.
5. Para "empezar de cero" en la demo: borrar `api/data/db.json` y correr `npm run seed`.
