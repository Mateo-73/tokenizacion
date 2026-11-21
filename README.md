# Siembra

Plataforma web sobre **Stellar (solo testnet)** que tokeniza activos del campo cruceño (silos, almacenes, campañas de cosecha). Los inversionistas compran fracciones en USDC, reciben retornos en USDC y verifican la trazabilidad con hashes en Stellar. Proyecto de la Ubihackathon 2026.

## Cómo empezar (después de clonar)

Requisitos: **Node.js 20 o superior** y npm.

```bash
git clone <url-del-repositorio>
cd tokenizacion
git checkout develop
npm install        # instala la raíz, api/ y web/ de una vez
```

Con un solo `npm install` en la raíz se instalan las dependencias de `api/` y `web/` (carpetas que aún no existan se omiten). No hace falta entrar a cada carpeta.

### Variables de entorno

Copia los ejemplos y completa los valores (no se suben a git):

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env
```

### Cuentas de Stellar (importante: no vienen con el repo)

Las claves secretas de las cuentas de testnet están en `api/.stellar-keys.json`. **Ese archivo no se sube a git**, así que al clonar no lo tendrás. Cada persona debe ponerlo a mano en su propia máquina:

1. Pídele el archivo a quien ejecutó `npm run setup:stellar` (Mateo), por un canal privado.
2. Guárdalo como `api/.stellar-keys.json`.
3. Completa en `api/.env` las líneas `ISSUER_PUBLIC`, `DISTRIBUTOR_PUBLIC`, `TREASURY_PUBLIC` y `USDC_ISSUER_PUBLIC` (las claves públicas están dentro de ese archivo).

No ejecutes `npm run setup:stellar` por tu cuenta si vas a trabajar con las cuentas del equipo: generaría cuentas distintas, con otro USDC y otros activos. Sin el archivo, puedes trabajar igual con `MOCK_MODE=true`.

### Comandos desde la raíz

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias de la raíz, `api/` y `web/` |
| `npm run dev` | Levanta la API (`http://localhost:3001`) y la web (`http://localhost:5173`) a la vez |
| `npm run dev:api` / `npm run dev:web` | Levanta solo una de las dos |
| `npm --prefix api test` | Ejecuta las pruebas de la API (flujo completo en modo mock) |
| `npm run setup:stellar` | Crea y fondea las cuentas en testnet (una sola vez) |
| `npm run seed` | Emite `SILO01` y `SOYA01` en testnet (idempotente) |
| `npm run portfolio -- <clave pública>` | Solo lectura: muestra el portafolio de una wallet y los tenedores de cada activo |
| `npm run demo:distribute` | Prueba el reparto de retornos por script: ⚠ **compra fracciones de `SOYA01` y paga USDC de prueba** a todos sus tenedores en cada ejecución |
| `npm run demo:trace` | Prueba la trazabilidad por script: registra y verifica el hash de un hito en un activo de pruebas y borra su entrada |
| `npm run demo:buy` | Prueba la compra de punta a punta por script: ⚠ **compra 10 fracciones reales de `SILO01`** en cada ejecución |

Para trabajar sin Stellar usa `MOCK_MODE=true` (ver `docs/02-stack-tecnologico.md`).

## Estructura del repositorio

```
├─ CLAUDE.md          ← contexto del proyecto para Claude Code
├─ docs/              ← documentación (00 a 11, ver abajo)
├─ scripts/           ← utilidades (instalación, setup de Stellar)
├─ api/               ← backend: Node.js + Express (JavaScript)
└─ web/               ← frontend: React + Vite + Tailwind (JavaScript)
```

## Documentación

Antes de tocar código, lee `CLAUDE.md` y el documento de tu área (todo está en `docs/`):

- [00 · Visión y alcance](docs/00-vision-y-alcance.md)
- [01 · Arquitectura](docs/01-arquitectura.md)
- [02 · Stack tecnológico](docs/02-stack-tecnologico.md)
- [03 · Modelo de activos en Stellar](docs/03-stellar-modelo-de-activos.md)
- [04 · Contrato de API](docs/04-api-contrato.md) (manda sobre cualquier otra lista de endpoints)
- [06 · Flujos de usuario y guion de demo](docs/06-flujos-de-usuario.md)
- [11 · Plan de tareas y prompts](docs/11-plan-de-tareas-y-prompts.md)
- [Contexto del proyecto](docs/contexto-proyecto.md) y [workflow del equipo](docs/workflow-equipo.md)

## Reglas de oro

1. Solo testnet. Nunca claves, fondos ni cuentas reales.
2. Nunca commitear `.env`, `api/.stellar-keys.json` ni `api/data/db.json`.
3. El contrato de API (`docs/04-api-contrato.md`) manda.
4. Una rama por tarea, PRs pequeños, revisión en menos de 30 minutos.
