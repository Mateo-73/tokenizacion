# 08 — Guía del frontend

Dueño: **Luis** (`web/`). Diseño: `docs/07`. Contrato de API: `docs/04`. Flujos: `docs/06`.

## 1. Estructura
```
web/src/
├─ main.jsx · App.jsx (rutas)
├─ index.css                ← tokens de docs/07
├─ lib/
│  ├─ api.js                ← una función por endpoint de docs/04
│  ├─ errors.js             ← códigos de error → mensajes en español
│  ├─ format.js             ← usdc(), fracciones, fechas
│  └─ auth/                 ← AuthContext + proveedores (demo, pollar)
├─ mocks/                   ← respuestas de docs/04
├─ pages/                   ← Catalog, AssetDetail, Portfolio, Admin
└─ components/              ← Navbar, AssetCard, BuyPanel, TraceTimeline, TxLink, Toast, ...
```
Rutas: `/`, `/activo/:id`, `/portafolio`, `/admin`.

## 2. Variables de entorno (`web/.env`)
```
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCKS=true        # false al integrar con la API real
VITE_USE_POLLAR=false      # true solo si el Plan A funciona
VITE_POLLAR_API_KEY=
```

## 3. Cliente de API (`lib/api.js`)
```js
import { mockApi } from '../mocks';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

async function request(path, { method = 'GET', body, adminKey } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const e = new Error('Sin conexión con el servidor'); e.code = 'NETWORK'; throw e;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(data?.error?.message ?? 'Error del servidor');
    e.code = data?.error?.code ?? 'UNKNOWN';
    throw e;
  }
  return data;
}

const real = {
  getAssets: () => request('/assets'),
  getAsset: (id) => request(`/assets/${id}`),
  createDemoInvestor: (body) => request('/investors/demo', { method: 'POST', body }),
  authorize: (body) => request('/authorize', { method: 'POST', body }),
  buy: (body) => request('/buy', { method: 'POST', body }),
  getPortfolio: (investorId) => request(`/portfolio/${investorId}`),
  distribute: (body, adminKey) => request('/distribute', { method: 'POST', body, adminKey }),
  getTrace: (assetId) => request(`/trace/${assetId}`),
  addTrace: (body, adminKey) => request('/trace', { method: 'POST', body, adminKey }),
};

export const api = USE_MOCKS ? mockApi : real;
```
`mocks/index.js` exporta `mockApi` con las mismas funciones, devolviendo las respuestas de ejemplo de docs/04 (con un `await` de 300–600 ms para simular red).

## 4. Errores → mensajes (`lib/errors.js`)
| Código | Mensaje |
|---|---|
| `NOT_AUTHORIZED` | "Primero verifica tu identidad para este activo." |
| `INSUFFICIENT_USDC` | "No tienes USDC suficiente para esta compra." |
| `INSUFFICIENT_FRACTIONS` | "No hay tantas fracciones disponibles." |
| `VALIDATION` | "Revisa los datos ingresados." |
| `FORBIDDEN` | "Clave de administrador incorrecta." |
| `STELLAR_ERROR` | "La red Stellar no respondió. Reintenta en unos segundos." |
| `NETWORK` | "No pudimos conectar con el servidor. Reintenta en unos segundos." |
| otros | "Algo salió mal. Reintenta." |

## 5. Sesión del inversionista (`lib/auth/`)
Interfaz única que usa toda la app, sin importar el proveedor:
```js
// AuthContext expone: { investor, loading, login(), logout() }
// investor = { investorId, name, publicKey } | null
```
- **Proveedor `demo` (Plan B, siempre disponible):** `login()` llama a `api.createDemoInvestor({ name, email })` y guarda `{ investorId, name, publicKey }` en `localStorage`.
```js
function save(investor) { try { localStorage.setItem('siembra.investor', JSON.stringify(investor)); } catch {} }
function load() { try { return JSON.parse(localStorage.getItem('siembra.investor')); } catch { return null; } }
```
Siempre con `try/catch`: el almacenamiento puede fallar.
- **Proveedor `pollar` (Plan A, detrás de `VITE_USE_POLLAR`):** implementar con `@pollar/react` según su **documentación oficial** (no hay que adivinar su API). Flujo esperado: el usuario entra con Google o email → se obtiene su identificador y wallet → `api.createDemoInvestor({ name, email })` con ese email para vincularlo a su cuenta demo del backend.
- **Regla de tiempo:** si en 45 minutos Pollar no está funcionando, dejar el proveedor `demo` y seguir. El Plan B ya cumple el flujo.

## 6. Páginas: qué consume cada una
| Página | Endpoints | Notas |
|---|---|---|
| Catálogo | `getAssets` | Esqueletos mientras carga; `SimulatedBadge` |
| Ficha | `getAsset`, `getTrace`, `authorize`, `buy` | Dos pasos: verificar → comprar; recargar activo y portafolio tras comprar |
| Portafolio | `getPortfolio` | Requiere sesión; si no hay, invitar a entrar |
| Admin | `distribute`, `addTrace` | Pedir la clave de administrador en un campo; no guardarla en `localStorage` |

## 7. Reglas de implementación
- Toda transacción mostrada incluye `TxLink` con `explorerUrl` (si es `null`, en modo mock, ocultar el enlace).
- Montos de USDC: mostrar con 2 decimales (`Intl.NumberFormat('es-BO')`); no hacer aritmética con strings sin convertir.
- Fracciones: enteros. Validar `>= 1` y `<= availableFractions` antes de llamar.
- Botones deshabilitados mientras hay una petición en curso (evita compras dobles).
- Todo dato con `simulated: true` muestra `SimulatedBadge`.
- Accesibilidad mínima: etiquetas en inputs, foco visible, `alt` en imágenes.

## 8. Integración con la API real (L8)
1. Poner `VITE_USE_MOCKS=false` y arrancar la API (`npm run dev` en `api/`).
2. Recorrer los flujos A–E de `docs/06`.
3. Si una respuesta no coincide con `docs/04`, **avisar a Mateo en el grupo** y anotar la diferencia; no parchear en silencio.
4. Dejar los mocks en el repo (sirven como respaldo de demo). Con `VITE_USE_MOCKS=true` la clave de administrador del mock es `siembra-demo` (cualquier otra responde `FORBIDDEN`).

## 9. Demo
Para la demo se corre en local (`npm run dev`) o con `npm run build && npm run preview`. Si se despliega, las variables de entorno van en la plataforma, nunca en el repo.

## 10. Lista de verificación de Luis
- [x] L1 scaffold y mocks · [x] L2 catálogo · [x] L3 ficha y trazabilidad · [x] L4 entrada demo
- [ ] L5 portafolio · [ ] L6 admin · [ ] L7 estados · [ ] L8 API real · [ ] L9 pulido con docs/07
