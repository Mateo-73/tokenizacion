# Siembra

Plataforma web sobre **Stellar (testnet)** que tokeniza activos del campo cruceño (silos, almacenes, campañas de cosecha) para que inversionistas de cualquier lugar compren fracciones en USDC, reciban retornos y verifiquen la trazabilidad con hashes en la red.

> **Prototipo de hackathon (Ubihackathon 2026, Stellar para startups).** Corre en testnet. Los datos de producción, los retornos y el KYC son **simulados**. No es una oferta de inversión.

*"Santa Cruz alimenta al mundo; ahora el mundo puede invertir en Santa Cruz."*

## Qué hace

- **Activos como tokens:** cada activo es un asset de Stellar con un número definido de fracciones.
- **Acceso controlado:** solo wallets verificadas pueden poseerlo (`AUTH_REQUIRED`), con KYC simulado.
- **Compra atómica en USDC:** una transacción con dos pagos (USDC al distribuidor y fracciones al inversionista) y un memo legible con el activo comprado, por ejemplo `SIEMBRA COMPRA SILO01 1x`.
- **Portafolio** con fracciones, valor y retornos recibidos.
- **Reparto de retornos** en USDC, proporcional a las fracciones.
- **Trazabilidad verificable:** línea de tiempo de hitos (siembra, insumos, cosecha, almacenaje, venta) con hash registrado en Stellar y enlace a stellar.expert. El explorador muestra la hora en UTC; Bolivia es UTC-4 (resta 4 horas).

## Cómo está construido

```
Web (React + Vite + Tailwind)  →  API (Node.js + Express)  →  Stellar testnet (Horizon)
```

El frontend es una aplicación estática y se puede publicar en **Vercel**. La API corre aparte: en local para desarrollar, o en un hosting con disco persistente si se quiere un despliegue público con el flujo real. Detalle en [`docs/01-arquitectura.md`](docs/01-arquitectura.md).

## Requisitos

- **Node.js 20.6 o superior** y npm.
- Opcional: una cuenta de [Vercel](https://vercel.com) para publicar el frontend.

## Instalación y ejecución

### Opción A — Demo local sin red (la más rápida)

Usa datos fijos: no necesita claves, red ni cuenta de Stellar.

```bash
git clone <URL-DEL-REPO> && cd tokenizacion
npm install

cp api/.env.example api/.env      # MOCK_MODE=true (valor por defecto)
cp web/.env.example web/.env      # VITE_USE_MOCKS=true (valor por defecto)

npm run dev                       # levanta API y web juntas
```

Abre **http://localhost:5173**. La API queda en **http://localhost:3001/api**.

### Opción B — Flujo real en Stellar testnet

```bash
# 1) Preparar cuentas de prueba (una sola vez)
npm run setup:stellar
# Imprime 4 claves públicas y crea api/.stellar-keys.json (NO se sube a git).

# 2) Copiar esas 4 líneas a api/.env y configurar:
#    MOCK_MODE=false
#    ADMIN_KEY=<valor largo y aleatorio>
cp api/.env.example api/.env

# 3) Emitir los activos de ejemplo y registrar los hitos
npm run seed

# 4) Configurar el frontend
cp web/.env.example web/.env
#    VITE_API_URL=http://localhost:3001/api
#    VITE_USE_MOCKS=false

# 5) Arrancar
npm run dev
```

Si ya tienes `api/.stellar-keys.json`, **no vuelvas a ejecutar `setup:stellar`**: reutilízalo y copia sus claves públicas a `api/.env`. Las operaciones reales tardan unos segundos y mueven fondos de prueba.

> `api/.env`, `web/.env`, `api/.stellar-keys.json` y `api/data/db.json` están en `.gitignore`. **Nunca los commitees.**

### Atajos y comandos útiles

| Comando (desde la raíz) | Qué hace |
|---|---|
| `npm install` | Instala dependencias de la raíz, `api/` y `web/` de una vez |
| `npm run dev` | Levanta API + web juntas |
| `npm run dev:api` / `npm run dev:web` | Levanta solo una parte |
| `npm run seed` | Emite `SILO01` y `SOYA01` y registra los hitos (idempotente) |
| `npm --prefix api test` | 42 pruebas de la API, sin red |
| `npm run test:flow` | Flujo completo contra la API encendida; termina con `FLUJO OK` |
| `npm run portfolio -- <clave-pública>` | Solo lectura: portafolio y tenedores |
| `npm run demo:trace` | Registra y verifica un hito de prueba |
| `npm run demo:buy` | ⚠ Compra 10 fracciones de `SILO01` en cada ejecución |
| `npm run demo:distribute` | ⚠ Compra fracciones de `SOYA01` y reparte USDC de prueba |

Para probar un endpoint puntual con `curl`, está [`docs/api-mock-curl.md`](docs/api-mock-curl.md).

## Demo en 2 minutos

1. Abrir el catálogo (dos activos de ejemplo).
2. Entrar como inversionista demo y verificar identidad (simulada).
3. Comprar fracciones y abrir la transacción en el explorador de Stellar (busca el **Memo** con el activo comprado).
4. Ver el portafolio y la trazabilidad con el sello "Verificado en Stellar".
5. Desde `/admin`, repartir un retorno simulado y verlo en el portafolio.

Guion completo en [`docs/06`](docs/06-flujos-de-usuario.md) y [`docs/14`](docs/14-demo-y-pitch.md).

**Demo en vivo (modo simulado):** https://siembra-stellar.vercel.app

## Presentación

[Siembra: Tokenización Agrícola en Stellar (Google Slides)](https://docs.google.com/presentation/d/17gAMO1-TBrURtR5rrdbgC-k3umPnN-aOMOWl92kmaBI/edit?usp=sharing)

## Despliegue en Vercel

El repo incluye un `vercel.json` que publica **el frontend** (`web/`) como sitio estático, con reescritura de rutas para React Router.

### Desde la interfaz de Vercel

1. Sube el repo a GitHub y en Vercel elige **Add New → Project** e impórtalo.
2. Vercel detectará la configuración del `vercel.json`:
   - Install: `npm ci --prefix web`
   - Build: `npm run build --prefix web`
   - Output: `web/dist`
3. En **Environment Variables** agrega, **antes de desplegar** (Vite las gráfica en el build):

| Variable | Demo pública (recomendada para el concurso) | Con API real |
|---|---|---|
| `VITE_USE_MOCKS` | `true` | `false` |
| `VITE_API_URL` | no hace falta | `https://<tu-api>/api` |

4. **Deploy**. Cada cambio en `main` genera un despliegue nuevo.

### Desde la CLI

```bash
npm i -g vercel
vercel login

vercel env add VITE_USE_MOCKS production     # true para la demo pública
# o: vercel env add VITE_API_URL production  # https://<tu-api>/api

vercel --prod
```

### La API en Vercel: limitación importante

La API guarda su estado en `api/data/db.json`. Las functions de Vercel tienen **sistema de archivos efímero**, así que ese archivo no sobrevive entre invocaciones: desplegar la API tal cual en Vercel **perdería inversionistas y compras**.

- Para un **enlace público de presentación**, despliega solo el frontend con `VITE_USE_MOCKS=true`: la interfaz completa funciona sin backend.
- Para el **flujo real en testnet**, deja la API en local o en un hosting con disco persistente (Render, Railway, Fly.io o un VPS) y configura allí:

```env
MOCK_MODE=false
WEB_ORIGIN=https://<tu-app>.vercel.app
ADMIN_KEY=<valor largo y aleatorio>
```

`WEB_ORIGIN` es necesario para que el CORS de la API acepte el dominio de Vercel. Las claves de Stellar se entregan como archivo `api/.stellar-keys.json` en ese servidor; **nunca** como variable visible en el frontend.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/00`](docs/00-vision-y-alcance.md) | Visión y alcance |
| [`docs/01`](docs/01-arquitectura.md) · [`02`](docs/02-stack-tecnologico.md) | Arquitectura y stack |
| [`docs/03`](docs/03-stellar-modelo-de-activos.md) | Modelo de activos en Stellar |
| [`docs/04`](docs/04-api-contrato.md) · [`05`](docs/05-modelo-de-datos.md) | Contrato de API y datos |
| [`docs/06`](docs/06-flujos-de-usuario.md) | Flujos y guion de demo |
| [`docs/07`](docs/07-ux-ui-design-system.md) · [`08`](docs/08-frontend-guia.md) · [`09`](docs/09-backend-guia.md) | Diseño, frontend y backend |
| [`docs/10`](docs/10-seguridad-y-claves.md) | Seguridad y claves |
| [`docs/11`](docs/11-plan-de-tareas-y-prompts.md) | Plan de tareas y prompts |
| [`docs/13`](docs/13-testing-y-qa.md) · [`14`](docs/14-demo-y-pitch.md) · [`15`](docs/15-negocio-y-roadmap.md) | QA, demo/pitch y negocio |

## Limitaciones conocidas

- Solo testnet. El USDC es un activo de prueba emitido por nosotros, distinto del USDC real.
- Los inversionistas demo son cuentas custodiales de prueba; en producción cada usuario firmaría con su propia wallet.
- No hay respaldo legal del token ni cumplimiento regulatorio: el vehículo legal y el marco boliviano están en el roadmap.
- Producción agrícola, ventas y retornos son datos de ejemplo, siempre etiquetados como simulados en la interfaz.
- StellarExpert muestra la hora en UTC y no permite cambiarla; Bolivia es UTC-4.
