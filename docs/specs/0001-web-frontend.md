# 0001 — Frontend web (`web/`) completo y pulido

Estado: **aprobado por Luis (22 nov)**
Dueño: Luis (`web/`). Implementa: Codex. Revisa: Opus (contexto frío, corrige él mismo).

## 1. Objetivo
Crear desde cero `web/` con las 4 pantallas de docs/07 §6, conectadas a la API (mocks primero, API real después), con un acabado visual de nivel producto: el jurado debe poder recorrer el flujo A→E de docs/06 sin tocar la consola.

## 2. Reglas que toca (fuente de verdad)
- `CLAUDE.md` (reglas de oro, propiedad de carpetas, JS ESM, interfaz en español, código en inglés).
- `docs/04-api-contrato.md`: el contrato es ley; no inventar endpoints ni campos.
- `docs/06-flujos-de-usuario.md`: flujos A–E y guion de demo.
- `docs/07-ux-ui-design-system.md`: marca, tokens, componentes, pantallas, estados, banco de textos.
- `docs/08-frontend-guia.md`: estructura, `api.js`, `errors.js`, sesión, reglas de implementación.
- `docs/13-testing-y-qa.md`: criterios de QA.

Decisiones de este spec:
- **Solo Plan B de entrada** (inversionista demo). Pollar queda fuera (docs/08 §5 permite descartarlo; no hay tiempo).
- Sin assets de Rafa todavía: el logo se hace en SVG propio (brote que forma una "S", docs/07 §1) y las imágenes son ilustraciones SVG o degradados con la paleta. Cuando Rafa entregue `web/public/brand/`, se reemplazan sin tocar componentes.
- Solo `web/`. No se toca `api/`, `scripts/` ni el contrato. Si la API real no coincide con docs/04, se anota en el PR y se avisa a Mateo.

## 3. Stack
Vite + React 18 + react-router + Tailwind v4 (`@tailwindcss/vite`) + `lucide-react`. Animaciones con CSS/Tailwind (sin librerías pesadas). Versiones fijas en `package.json`. Node >= 20.

## 4. Archivos
```
web/
├─ package.json · vite.config.js · index.html · .env.example
├─ public/brand/            ← logo.svg, favicon.svg, ilustraciones SVG
└─ src/
   ├─ main.jsx · App.jsx · index.css (tokens de docs/07 §4)
   ├─ lib/ api.js · errors.js · format.js · auth/ (AuthContext + proveedor demo)
   ├─ mocks/ index.js (respuestas de docs/04, latencia 300–600 ms, estado en memoria)
   ├─ components/ Navbar, Footer, AssetCard, SimulatedBadge, VerifiedBadge, FractionSelector,
   │              BuyPanel, TraceTimeline, TxLink, Toast, Skeleton, EmptyState, ErrorState, PortfolioTable, Button
   └─ pages/ Catalog, AssetDetail, Portfolio, Admin, NotFound
```
Además: agregar `web/.env` a nada (ya está en `.gitignore`); actualizar la lista de verificación de docs/08 §10 al terminar cada entrega.

## 5. Plan de implementación (3 entregas, un PR cada una, desde `main`)
**PR 1 — Base y catálogo (L1, L2).** Scaffold, tokens, fuentes, `api.js`/mocks/`errors.js`/`format.js`, layout (Navbar, Footer, aviso de testnet), componentes base (Button, badges, Skeleton, EmptyState, ErrorState, Toast), catálogo `/` con hero y `AssetCard` (barra de fracciones vendidas, estado agotado), página 404.

**PR 2 — Ficha, entrada y compra (L3, L4).** Proveedor demo de sesión (`localStorage` con try/catch), botón "Entrar como inversionista demo" en Navbar, `/activo/:id` con cabecera, datos clave, `BuyPanel` en 2 pasos (verificar → comprar), `FractionSelector` con total en vivo, banner de éxito con `TxLink`, `TraceTimeline` con sello "Verificado en Stellar".

**PR 3 — Portafolio, admin, estados e integración (L5, L6, L7, L8, L9).** `/portafolio` (tarjetas resumen, `PortfolioTable`, retornos con `TxLink`, estado vacío), `/admin` (clave en campo, sin guardarla; reparto y agregar hito, resultado con pagos y enlaces), revisión de todos los estados, responsive 360/640/1024/1440, prueba contra la API real con `VITE_USE_MOCKS=false`.

## 6. Nivel de pulido exigido (lo que hace que se vea increíble)
- Fiel a los tokens de docs/07: Fraunces en títulos, Inter en cuerpo/datos, radios 12/16, sombra suave, ancho máx. 1120 px, espaciado base 4 px.
- Hero del catálogo con jerarquía clara, ilustración del campo en SVG y el aviso de prototipo visible pero discreto.
- Microinteracciones: hover/focus en tarjetas y botones (transiciones 150–200 ms), selector +/− con feedback, botón "Comprar" con estado "enviando" (spinner) y bloqueo de doble envío, toast que entra y sale con animación, éxito de compra celebrado sin exagerar.
- Cifras con `Intl.NumberFormat('es-BO')`, USDC con 2 decimales, números tabulares (`font-variant-numeric: tabular-nums`).
- Esqueletos con la forma real de cada tarjeta/tabla; nunca pantallas en blanco; error con "Reintentar".
- Accesibilidad: contraste AA, foco visible con anillo `siembra-500`, `aria-live` en toasts y resultados, etiquetas en inputs, áreas táctiles de 44 px, `prefers-reduced-motion` respetado.
- Textos exactos del banco de docs/07 §8. Nunca "ganancia garantizada"; los retornos dicen "simulado".
- Cero errores ni warnings en la consola del navegador.

## 7. Cómo se prueba
1. `cd web && npm install && npm run build` sin errores ni warnings.
2. `npm run dev` con `VITE_USE_MOCKS=true`: recorrer A→E de docs/06 completo.
3. Con la API real (`api/.env` con `MOCK_MODE=false`, `npm run dev` en `api/`) y `VITE_USE_MOCKS=false`: recorrer A→E en testnet; cada transacción abre en stellar.expert.
4. Capturas (Playwright o navegador) de las 4 pantallas en 390 px y 1440 px, adjuntas al PR.
5. Errores forzados: comprar sin verificar, más fracciones de las disponibles, clave admin incorrecta, API apagada → mensajes de docs/08 §4.

## 8. Definición de terminado
- Las 3 entregas en `main` vía PR revisado.
- Flujo A→E funciona con mocks y contra testnet, en móvil y escritorio, sin consola.
- Todos los componentes y estados de docs/07 §5 y §7 existen y se ven.
- Checklist de docs/08 §10 marcado (excepto Pollar).
- Ningún secreto en el repo.
