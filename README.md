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

### Comandos desde la raíz

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias de la raíz, `api/` y `web/` |
| `npm run dev` | Levanta la API (`http://localhost:3001`) y la web (`http://localhost:5173`) a la vez |
| `npm run dev:api` / `npm run dev:web` | Levanta solo una de las dos |
| `npm run setup:stellar` | Crea y fondea las cuentas en testnet (una sola vez) |
| `npm run seed` | Emite `SILO01` y `SOYA01` y carga los datos de ejemplo |

Para que `MOCK_MODE=true` funcione sin Stellar, revisa `docs/tecnico/02-stack-tecnologico.md`.

## Estructura del repositorio

```
├─ CLAUDE.md          ← contexto del proyecto para Claude Code
├─ docs/
│  ├─ proyecto/       ← visión, alcance, flujos de usuario, contexto y workflow del equipo
│  └─ tecnico/        ← arquitectura, stack, modelo de activos Stellar y contrato de API
├─ scripts/           ← utilidades (instalación, setup de Stellar)
├─ api/               ← backend: Node.js + Express
└─ web/               ← frontend: React + Vite + Tailwind
```

## Documentación

Antes de tocar código, lee `CLAUDE.md` y el documento de tu área:

- [Visión y alcance](docs/proyecto/00-vision-y-alcance.md)
- [Flujos de usuario y guion de demo](docs/proyecto/06-flujos-de-usuario.md)
- [Workflow del equipo](docs/proyecto/workflow-equipo.md)
- [Contexto del proyecto](docs/proyecto/contexto-proyecto.md)
- [Arquitectura](docs/tecnico/01-arquitectura.md)
- [Stack tecnológico](docs/tecnico/02-stack-tecnologico.md)
- [Modelo de activos en Stellar](docs/tecnico/03-stellar-modelo-de-activos.md)
- [Contrato de API](docs/tecnico/04-api-contrato.md)

## Reglas de oro

1. Solo testnet. Nunca claves, fondos ni cuentas reales.
2. Nunca commitear `.env`, `api/.stellar-keys.json` ni `api/data/db.json`.
3. El contrato de API (`docs/tecnico/04-api-contrato.md`) manda.
4. Una rama por tarea, PRs pequeños, revisión en menos de 30 minutos.
