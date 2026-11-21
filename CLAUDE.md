# Siembra — CLAUDE.md

Plataforma web sobre **Stellar (solo testnet)** que tokeniza activos del campo cruceño (silos, almacenes, campañas de cosecha) y, en fase 2, inmuebles urbanos. Los inversionistas compran fracciones en USDC, reciben retornos en USDC y verifican la trazabilidad con hashes en Stellar.

Contexto: Ubihackathon 2026 (Stellar para startups). **Cierre de envío: 22 de noviembre.** Final presencial: 27 de noviembre en Santa Cruz. El jurado evalúa un flujo funcionando, no ideas.

## Lee primero (antes de tocar código de tu área)
- `docs/proyecto/00-vision-y-alcance.md` — qué construimos y qué NO
- `docs/tecnico/01-arquitectura.md` — componentes y estructura del repo
- `docs/tecnico/02-stack-tecnologico.md` — librerías, comandos, variables de entorno
- `docs/tecnico/03-stellar-modelo-de-activos.md` — cuentas, assets, flags, código base de Stellar
- `docs/tecnico/04-api-contrato.md` — endpoints (el contrato es ley)
- `docs/proyecto/06-flujos-de-usuario.md` — flujos paso a paso y guion de demo

## Reglas de oro
1. **Solo testnet.** Nunca claves, fondos ni cuentas reales.
2. **Nunca commitear** `.env`, `api/.stellar-keys.json` ni `api/data/*.json` con claves. Verifica el `.gitignore`.
3. **El contrato de API (`docs/tecnico/04`) manda.** Si necesitas cambiarlo: edita el doc primero, avisa en el grupo y luego programa.
4. Una rama por tarea (`feat/stellar`, `feat/api`, `feat/ui`), PRs pequeños, merge a `main` apenas algo funcione. Revisa el PR de otro en menos de 30 minutos.
5. Si te bloqueas más de 20 minutos con Stellar o Pollar, usa mock (`MOCK_MODE=true`) y avisa en el grupo. No esperes.
6. Todo dato simulado (retornos, producción, KYC) se **etiqueta como simulado** en la interfaz. No prometemos rendimientos.
7. Núcleo irrenunciable: login, emisión, autorización, compra en USDC, portafolio, reparto de retornos. Lo demás se recorta primero (ver `docs/proyecto/00`).

## Propiedad de carpetas
| Carpeta | Dueño |
|---|---|
| `api/src/stellar/`, `scripts/` | Sebas |
| `api/src/routes/`, `api/src/services/`, `api/src/data/` | Mateo |
| `web/` | Luis |
| diseño, textos, README, demo | Rafa y Diego |

Si necesitas tocar la carpeta de otro, pídelo en el grupo o abre un PR hacia su rama.

## Comandos
```bash
# api
cd api && npm run setup:stellar   # crea y fondea cuentas en testnet (una sola vez)
npm run seed                      # emite SILO01 y SOYA01 y carga datos de ejemplo
npm run dev                       # API en http://localhost:3001
# web
cd web && npm run dev             # http://localhost:5173
```

## Cómo trabajar con Claude Code (vibecoding)
- Empieza cada sesión pidiendo: "Lee CLAUDE.md y el doc de mi área antes de empezar".
- Una tarea por sesión. Commits pequeños. Prueba con un script antes de exponer algo en la API.
- Pide a Claude que escriba el código, pero **tú ejecutas y verificas** en testnet (explorador: https://stellar.expert/explorer/testnet).
- No inventes endpoints ni campos: usa los de `docs/tecnico/04`.
- Idioma de la interfaz y los textos: español. Código y nombres de variables: inglés.

## Definición de terminado (por tarea)
Funciona de punta a punta en testnet, está en `main`, no rompe el flujo de demo y no expone secretos.
