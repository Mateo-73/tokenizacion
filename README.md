# Siembra

Plataforma web sobre **Stellar (testnet)** que tokeniza activos del campo cruceño (silos, almacenes, campañas de cosecha) para que inversionistas de cualquier lugar compren fracciones en USDC, reciban retornos y verifiquen la trazabilidad con hashes en la red.

> **Prototipo de hackathon (Ubihackathon 2026, Stellar para startups).** Corre en testnet. Los datos de producción, los retornos y el KYC son **simulados**. No es una oferta de inversión.

*"Santa Cruz alimenta al mundo; ahora el mundo puede invertir en Santa Cruz."*

## Qué hace
- **Activos como tokens:** cada activo es un asset de Stellar con un número definido de fracciones.
- **Acceso controlado:** solo wallets verificadas pueden poseerlo (`AUTH_REQUIRED`), con KYC simulado.
- **Compra atómica en USDC:** una transacción con dos pagos (USDC al distribuidor y fracciones al inversionista).
- **Portafolio** con fracciones, valor y retornos recibidos.
- **Reparto de retornos** en USDC, proporcional a las fracciones.
- **Trazabilidad verificable:** línea de tiempo de hitos (siembra, insumos, cosecha, almacenaje, venta) con hash registrado en Stellar.

## Cómo está construido
```
Web (React + Vite + Tailwind)  →  API (Node.js + Express)  →  Stellar testnet (Horizon)
```
Detalle en [`docs/01-arquitectura.md`](docs/01-arquitectura.md).

## Requisitos
Node.js 20.6 o superior y npm.

## Puesta en marcha
```bash
git clone <este-repo> && cd siembra

# Backend
cd api
npm install
cp .env.example .env          # completar ADMIN_KEY con un valor largo y aleatorio
npm run setup:stellar         # crea y fondea las cuentas en testnet (una sola vez)
npm run seed                  # emite SILO01 y SOYA01 y registra los hitos
npm run dev                   # http://localhost:3001

# Frontend (otra terminal)
cd web
npm install
cp .env.example .env          # VITE_USE_MOCKS=false para usar la API real
npm run dev                   # http://localhost:5173
```
Prueba rápida del flujo de la API (con la API encendida): `npm run test:flow` desde la raíz, o `cd api && npm run test:flow` (debe terminar con `FLUJO OK`). Funciona con `MOCK_MODE=true` y con `false`; en modo real compra 5 fracciones de `SILO01` y reparte 1 USDC de prueba en cada ejecución, y solo agrega un hito de trazabilidad con `npm run test:flow -- --con-hito`.

**Sin red o con Stellar caído:** `MOCK_MODE=true` en `api/.env` y `VITE_USE_MOCKS=true` en `web/.env` permiten recorrer la interfaz con datos fijos.

### Atajos desde la raíz
`npm install` en la raíz instala la raíz, `api/` y `web/` de una vez (las carpetas que aún no existan se omiten), y `npm run dev` levanta API y web juntas. También están `npm run dev:api`, `npm run dev:web`, `npm run setup:stellar` y `npm run seed`.

### Cuentas de Stellar (importante: no vienen con el repo)
Las claves secretas de las cuentas de testnet están en `api/.stellar-keys.json`. **Ese archivo no se sube a git**, así que al clonar no lo tendrás. Cada persona debe ponerlo a mano en su propia máquina:

1. Pídele el archivo a quien ejecutó `npm run setup:stellar` (Mateo), por un canal privado.
2. Guárdalo como `api/.stellar-keys.json`.
3. Completa en `api/.env` las líneas `ISSUER_PUBLIC`, `DISTRIBUTOR_PUBLIC`, `TREASURY_PUBLIC` y `USDC_ISSUER_PUBLIC` (las claves públicas están dentro de ese archivo).

No ejecutes `npm run setup:stellar` por tu cuenta si vas a trabajar con las cuentas del equipo: generaría cuentas distintas, con otro USDC y otros activos. Sin el archivo, puedes trabajar igual con `MOCK_MODE=true`.

### Scripts de prueba contra testnet (desde la raíz)
| Comando | Qué hace |
|---|---|
| `npm --prefix api test` | Pruebas de la API (35, en proceso y sin red) |
| `npm run test:flow` | Flujo A→E contra la API encendida; termina con `FLUJO OK` o falla indicando el motivo |
| `npm run portfolio -- <clave pública>` | Solo lectura: portafolio de una wallet y tenedores de cada activo |
| `npm run demo:trace` | Registra y verifica el hash de un hito en un activo de pruebas y borra su entrada |
| `npm run demo:buy` | ⚠ **Compra 10 fracciones reales de `SILO01`** en cada ejecución |
| `npm run demo:distribute` | ⚠ **Compra fracciones de `SOYA01` y paga USDC de prueba** a todos sus tenedores |

## Demo en 2 minutos
1. Abrir el catálogo (dos activos de ejemplo).
2. Entrar como inversionista demo y verificar identidad (simulada).
3. Comprar fracciones y abrir la transacción en el explorador de Stellar.
4. Ver el portafolio y la trazabilidad con el sello "Verificado en Stellar".
5. Desde `/admin`, repartir un retorno simulado y verlo en el portafolio.

## Documentación
| Documento | Contenido |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Reglas y contexto para trabajar con Claude Code |
| [`docs/00`](docs/00-vision-y-alcance.md) | Visión y alcance |
| [`docs/01`](docs/01-arquitectura.md) · [`02`](docs/02-stack-tecnologico.md) | Arquitectura y stack |
| [`docs/03`](docs/03-stellar-modelo-de-activos.md) | Modelo de activos en Stellar |
| [`docs/04`](docs/04-api-contrato.md) · [`05`](docs/05-modelo-de-datos.md) | Contrato de API y datos |
| [`docs/06`](docs/06-flujos-de-usuario.md) | Flujos y guion de demo |
| [`docs/07`](docs/07-ux-ui-design-system.md) · [`08`](docs/08-frontend-guia.md) · [`09`](docs/09-backend-guia.md) | Diseño, frontend y backend |
| [`docs/10`](docs/10-seguridad-y-claves.md) | Seguridad y claves |
| [`docs/11`](docs/11-plan-de-tareas-y-prompts.md) | Plan de tareas y prompts (incluye lo que sería un doc 12 de prompts) |
| [`docs/13`](docs/13-testing-y-qa.md) · [`14`](docs/14-demo-y-pitch.md) · [`15`](docs/15-negocio-y-roadmap.md) | QA, demo/pitch y negocio |
| [`contexto-proyecto`](docs/contexto-proyecto.md) · [`workflow-equipo`](docs/workflow-equipo.md) | Contexto de la hackathon y workflow del equipo |

## Limitaciones conocidas
- Solo testnet. El USDC es un activo de prueba emitido por nosotros, distinto del USDC real.
- Los inversionistas demo son cuentas custodiales de prueba; en producción cada usuario firmaría con su propia wallet.
- No hay respaldo legal del token ni cumplimiento regulatorio: el vehículo legal y el marco boliviano están en el roadmap.
- Producción agrícola, ventas y retornos son datos de ejemplo.

## Ecosistema
Stellar · Pollar · Vaquita · Buidlers · BAF.

## Equipo
Mateo · Luis · Rafa · Diego.
