# 07 — UX/UI y sistema de diseño

Dueños: **Rafa** (diseño) y **Diego**. Consumidor: **Luis** (`web/`). Este documento es el handoff: Luis debe poder implementar sin interpretar.

## 1. Marca
- **Nombre de trabajo:** Siembra (Rafa confirma o cambia hoy; si cambia, avisar para reemplazarlo en textos).
- **Idea:** capital del mundo para el campo cruceño, con transparencia verificable.
- **Tono:** sobrio, confiable, orgulloso de Santa Cruz sin exagerar. Evitar lenguaje de "ganancias garantizadas" y jerga cripto en pantalla.
- **Identidad:** verde y blanco (colores de Santa Cruz), acento dorado (grano).
- **Logo:** simple, SVG, legible a 24 px. Idea: una hoja o brote que forma una "S".

## 2. Paleta (tokens)
| Token | Hex | Uso |
|---|---|---|
| `siembra-900` | `#0B3D24` | Títulos, fondo del pie de página |
| `siembra-700` | `#14703F` | Botón principal, enlaces |
| `siembra-500` | `#1FA35A` | Hover, íconos activos |
| `siembra-100` | `#E3F4EA` | Fondos suaves, badge de verificado |
| `fondo` | `#F7FAF8` | Fondo de la app |
| `blanco` | `#FFFFFF` | Tarjetas |
| `texto` | `#12211A` | Texto principal |
| `texto-suave` | `#5B6B63` | Texto secundario |
| `borde` | `#DDE7E1` | Bordes y divisores |
| `grano` | `#D9A441` | Acento (precio, destacados) |
| `simulado-bg` / `simulado-fg` | `#FFF4D6` / `#8A5A00` | Badge "datos de ejemplo" |
| `error` | `#C0392B` | Errores |

Contraste: texto sobre `fondo`/`blanco` y blanco sobre `siembra-700` cumplen AA; verificar `grano` solo como acento, no como texto pequeño.

## 3. Tipografía y espaciado
- Títulos: **Fraunces** (serif, Google Fonts). Cuerpo y datos: **Inter**.
- Escala: 12 / 14 / 16 / 20 / 28 / 40 px. Cuerpo 16 px. Interlineado 1,5.
- Radios: 12 px (controles), 16 px (tarjetas). Sombra suave: `0 1px 2px rgba(11,61,36,.08)`.
- Espaciado base 4 px (4, 8, 12, 16, 24, 32, 48). Ancho máximo del contenido: 1120 px.
- Mobile-first. Puntos de quiebre: 640 y 1024 px.

## 4. Tokens en Tailwind v4 (`web/src/index.css`)
```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600&display=swap");

@theme {
  --color-siembra-900: #0B3D24;
  --color-siembra-700: #14703F;
  --color-siembra-500: #1FA35A;
  --color-siembra-100: #E3F4EA;
  --color-fondo: #F7FAF8;
  --color-texto: #12211A;
  --color-texto-suave: #5B6B63;
  --color-borde: #DDE7E1;
  --color-grano: #D9A441;
  --color-simulado-bg: #FFF4D6;
  --color-simulado-fg: #8A5A00;
  --color-error: #C0392B;
  --font-display: "Fraunces", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
}
body { background: var(--color-fondo); color: var(--color-texto); font-family: var(--font-sans); }
```
Uso: `bg-siembra-700 text-white`, `font-display`, `border-borde`.

## 5. Componentes
| Componente | Descripción | Estados |
|---|---|---|
| `Navbar` | Logo, enlaces (Activos, Portafolio), botón Entrar / avatar del inversionista | Con y sin sesión |
| `AssetCard` | Imagen, nombre, tipo, precio por fracción, barra de fracciones vendidas, badge "Datos de ejemplo" | Normal, hover, agotado |
| `SimulatedBadge` | Pastilla `simulado-bg`/`simulado-fg`: "Datos de ejemplo" | — |
| `VerifiedBadge` | Pastilla `siembra-100`: "Verificado en Stellar" con enlace al explorador | Verificado / pendiente |
| `FractionSelector` | Entero ≥ 1, botones − y +, total en USDC en vivo | Válido, error, deshabilitado |
| `BuyPanel` | Selector, saldo USDC, botón "Comprar", resumen | Sin verificar, listo, enviando, éxito, error |
| `TraceTimeline` | Línea de tiempo vertical: ícono por tipo, fecha, título, descripción, sello | Vacío, cargando, con hitos |
| `TxLink` | "Ver transacción en el explorador ↗" | — |
| `Toast` | Mensajes de éxito/error, desaparece en 5 s | éxito, error |
| `Skeleton` | Esqueletos de tarjeta y tabla | — |
| `EmptyState` | Ilustración simple + texto + botón | — |
| `PortfolioTable` | Activo, fracciones, valor, retornos recibidos | Con datos, vacío |

Botón principal: fondo `siembra-700`, texto blanco, radio 12, alto 44 px (área táctil). Secundario: borde `siembra-700`, fondo transparente.

## 6. Pantallas (esquema)
### 6.1 Catálogo `/`
- Encabezado: título "El campo cruceño, abierto al mundo" + subtítulo corto + aviso "Prototipo en testnet con datos de ejemplo".
- Rejilla de `AssetCard` (1 columna móvil, 2 escritorio).
- Pie: "Construido sobre Stellar".

### 6.2 Ficha del activo `/activo/:id`
- Cabecera: nombre, tipo, ubicación, `SimulatedBadge`.
- Columna principal: descripción, datos clave (fracciones totales, vendidas, precio, retorno simulado), **Trazabilidad** (`TraceTimeline`).
- Columna lateral (en móvil, debajo de la cabecera): `BuyPanel`. Paso 1 "Verificar identidad" (botón), paso 2 "Comprar".
- Tras comprar: banner de éxito con `TxLink`.

### 6.3 Portafolio `/portafolio`
- Tarjetas resumen: USDC disponible, valor invertido, retornos recibidos.
- `PortfolioTable` y lista de retornos con `TxLink`.
- Estado vacío: "Aún no tienes fracciones. Explora los activos."

### 6.4 Admin `/admin`
- Campo "Clave de administrador".
- Tarjeta "Repartir retorno" (activo, monto en USDC, período) y tarjeta "Agregar hito" (activo, tipo, título, fecha, descripción).
- Resultado con los pagos y enlaces al explorador. Diseño funcional, sin pulido extra.

## 7. Estados obligatorios
Cargando (esqueletos), vacío, error con "Reintentar", éxito con enlace a la transacción. Ninguna pantalla en blanco.

## 8. Banco de textos (español)
| Situación | Texto |
|---|---|
| Aviso general | "Prototipo en testnet. Los datos y los retornos son de ejemplo." |
| Badge | "Datos de ejemplo" |
| Verificar | "Verificar identidad" / "Identidad verificada (simulada)" |
| Comprar | "Comprar fracciones" |
| Éxito | "¡Compra confirmada! Ya eres parte de este activo." |
| Sello | "Verificado en Stellar" |
| Explorador | "Ver transacción en el explorador" |
| Sin portafolio | "Aún no tienes fracciones. Explora los activos." |
| Error red | "No pudimos conectar con el servidor. Reintenta en unos segundos." |
| Cierre | "Santa Cruz alimenta al mundo. Ahora el mundo puede invertir en Santa Cruz." |

Regla: nunca "ganancia garantizada" ni porcentajes de rendimiento. Los retornos siempre dicen "simulado".

## 9. Imágenes y recursos
- Logo y favicon en SVG; íconos en `lucide-react` o SVG propio.
- Fotos del campo y del silo: **solo con licencia libre** (Unsplash, Pexels) o generadas. No sacar fotos con derechos de autor de internet.
- Entrega: `web/public/brand/` (logo, favicon, imágenes).

## 10. Para quien no programa (Rafa y Diego)
Se puede prototipar rápido pidiéndole a Claude en el chat el HTML + Tailwind de cada pantalla (ver prompt R2 en `docs/11`) y enviárselo a Luis. Lo importante es que Luis reciba **tokens, componentes y pantallas** de este documento, aunque el archivo de Figma sea mínimo.
