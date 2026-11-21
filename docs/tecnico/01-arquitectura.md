# 01 — Arquitectura

## Vista general
```
  Navegador (React + Vite + Tailwind)
   ├─ Login / wallet: Pollar (Plan A)  |  inversionista demo custodial (Plan B)
   └─ fetch JSON
          │
          ▼
  API Node.js (Express)  :3001
   ├─ routes/    → endpoints (docs/tecnico/04)           [Mateo]
   ├─ services/  → reglas de negocio + datos     [Mateo]
   ├─ stellar/   → todo lo que toca la red       [Sebas]
   └─ data/db.json  → catálogo, hitos, inversionistas demo (sin balances)
          │
          ▼
  Stellar TESTNET (Horizon: horizon-testnet.stellar.org)
   ├─ assets SILO01, SOYA01 (emisor con AUTH_REQUIRED)
   ├─ USDC de prueba (emisor propio)
   └─ hashes de trazabilidad (manageData en la cuenta emisora)
```

## Principio clave: Stellar es la fuente de verdad
- **Balances y propiedad de fracciones se leen de Horizon**, nunca de nuestra base.
- `db.json` guarda solo lo que Stellar no guarda: textos, imágenes, precios, hitos, mapeo inversionista → wallet.
- Todo cambio de estado relevante devuelve `txHash` y `explorerUrl` para mostrarlo en la interfaz.

## Cuentas Stellar (detalle en docs/tecnico/03)
`ISSUER` (emite fracciones, flags de autorización), `DISTRIBUTOR` (guarda fracciones sin vender y recibe pagos), `TREASURY` (paga retornos), `USDC_ISSUER` (USDC de prueba).

## Interfaz entre Sebas y Mateo
Mateo **no** usa el SDK de Stellar directamente. Llama a las funciones exportadas por `api/src/stellar/index.ts` (firmas en docs/tecnico/03). Así cada uno trabaja sin pisarse.

## Modo mock
`MOCK_MODE=true` hace que la API responda con datos fijos sin tocar Stellar. Mateo lo entrega en la primera hora para que Luis no espere. En mock, los `txHash` son falsos y el `explorerUrl` es `null`.

## Wallets de inversionista: Plan A y Plan B
- **Plan A (deseable):** el inversionista entra con Pollar y usa su wallet Stellar. Requiere que la wallet firme la trustline y la compra. Es lo más atractivo, pero depende de las capacidades de Pollar en testnet (por confirmar).
- **Plan B (base de la demo):** el backend crea cuentas de inversionista "demo" custodiales (clave guardada en el servidor, solo testnet), las fondea con XLM (Friendbot) y USDC de prueba. El login de Pollar identifica al usuario y el backend lo mapea a su cuenta demo.
- **Decisión:** construir primero Plan B de punta a punta. Plan A se integra encima si Pollar lo permite. No bloquear el flujo por Pollar.

## Patrón de arquitectura (decisión del MVP)
Cliente-servidor con un backend monolítico modular: una SPA en React que consume una API REST en JSON, y una API Express organizada en capas. Stellar testnet es el registro de propiedad y de saldos.

| # | Decisión | Por qué |
|---|---|---|
| 1 | Frontend (SPA) y backend separados, comunicados solo por REST/JSON según `docs/tecnico/04` | Permite que Luis y Mateo trabajen en paralelo con datos mock desde el inicio |
| 2 | Backend en un solo proceso, con capas `routes/` → `services/` → `stellar/` y `data/` | Un solo proceso para levantar y demostrar; las capas separan el trabajo de Mateo (negocio) y Sebas (Stellar) |
| 3 | Stellar es la fuente de verdad para saldos y fracciones; `db.json` guarda solo lo que Stellar no guarda | Evita tener dos fuentes de verdad sobre quién posee qué |
| 4 | Almacenamiento en archivo JSON, sin base de datos externa | Suficiente para 2 días y una demo en testnet |
| 5 | `MOCK_MODE` para desacoplar el frontend del backend y de Stellar | Si Stellar o Pollar fallan, la demo no se detiene |
| 6 | Fuera del MVP: microservicios, base de datos, Soroban (contratos) como dependencia | Cada una añade riesgo de tiempo sin aportar al flujo núcleo |

**Limitaciones aceptadas:** `db.json` no soporta escrituras concurrentes ni escala; el sistema solo funciona en testnet. Ambas cosas deben decirse en la demo.

## Estructura del repositorio
```
siembra/
├─ CLAUDE.md
├─ README.md
├─ docs/
│  ├─ proyecto/               ← qué construimos y cómo trabajamos (producto y equipo)
│  │  ├─ 00-vision-y-alcance.md
│  │  ├─ 06-flujos-de-usuario.md
│  │  ├─ contexto-proyecto.md
│  │  └─ workflow-equipo.md
│  └─ tecnico/                ← cómo se construye (contratos y decisiones técnicas)
│     ├─ 01-arquitectura.md
│     ├─ 02-stack-tecnologico.md
│     ├─ 03-stellar-modelo-de-activos.md
│     └─ 04-api-contrato.md
├─ scripts/                   ← utilidades sueltas de Stellar (Sebas)
├─ api/                       ← backend: Node.js 20+ + Express 5 + TypeScript
│  ├─ package.json            ("type": "module")
│  ├─ tsconfig.json           ← TypeScript estricto (tsconfig.build.json para compilar)
│  ├─ test/                   ← pruebas del flujo completo en modo mock (`npm test`)
│  ├─ .env / .env.example
│  ├─ .stellar-keys.json      ← generado, en .gitignore
│  ├─ data/db.json            ← runtime, en .gitignore (puede contener claves demo)
│  └─ src/
│     ├─ server.ts            ← arranque de Express, CORS, montaje de rutas
│     ├─ routes/              ← capa HTTP: valida la petición y llama a services (Mateo)
│     ├─ services/            ← reglas de negocio, mock y acceso a db.json (Mateo)
│     ├─ data/                ← esquema y lectura/escritura de db.json (Mateo)
│     └─ stellar/             ← única capa que toca Stellar: client, accounts, assets, trading, trace, index (Sebas)
└─ web/                       ← frontend: React 18 + Vite + Tailwind (Luis)
   └─ src/
      ├─ pages/               ← pantallas de la ruta (catálogo, ficha, compra, portafolio)
      ├─ components/          ← piezas reutilizables de UI
      ├─ lib/api.ts           ← único punto de llamadas HTTP a la API
      └─ mocks/               ← respuestas de docs/tecnico/04 para trabajar sin backend
```

### Capas y dependencias

La API tiene tres capas y solo se puede depender hacia abajo:

```
routes  →  services  →  stellar/ (red Stellar)
              ↓
            data/ (db.json)
```

- `routes/` no conoce Stellar ni `db.json`; solo valida la entrada y responde.
- `services/` aplica reglas (fracciones disponibles, autorización) y llama a `stellar/` y a `data/`.
- `stellar/` es la única carpeta que importa `@stellar/stellar-sdk`.
- El frontend solo llama a la API a través de `web/src/lib/api.ts`.

## Flujo de datos en una compra (resumen)
Web → `POST /api/buy` → `services/buy` valida (fracciones disponibles, autorización) → `stellar.buyFractions(...)` arma una transacción atómica (pago USDC del inversionista al distribuidor + pago de fracciones del distribuidor al inversionista) → devuelve `txHash` → API responde → Web muestra confirmación con enlace al explorador.
