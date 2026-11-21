# Workflow del equipo

**Siembra** (nombre de trabajo) · Ubihackathon 2026 · 5 integrantes · cierre de envío: **22 de noviembre**

> Tiempo: hoy es 20 de noviembre. Quedan 2 días de trabajo (20 y 21) y el 22 como colchón y envío.
> Este plan reemplaza el plan de 4 días del documento de contexto ([contexto-proyecto.md](contexto-proyecto.md)).

## 1. Roles

| Quién | Rol | Responsabilidad |
|---|---|---|
| Sebas | Núcleo Stellar | Cuentas emisora y distribuidora, asset con flags de autorización, USDC de prueba propio en testnet, compra de fracciones |
| **Mateo** | Backend / API | Endpoints, reparto de retornos, trazabilidad (hash en Stellar), datos de ejemplo (1 silo, 1 campaña) |
| Luis | Frontend funcional | Login con Pollar, conexión a la API, pantallas diseñadas por Rafa y Diego |
| Rafa | Diseño UI/UX | Marca (nombre, verde y blanco) y 4 pantallas: catálogo, ficha con trazabilidad, compra, portafolio |
| Diego | Producto y entrega | Textos del formulario, guion y deck del pitch, README, video demo y QA del flujo completo. Opcional: maquetar componentes en React para Luis |

## 2. Reglas de trabajo

- Un repositorio, una rama por tarea (`feat/stellar`, `feat/api`, `feat/ui`). PRs pequeños y merge a `main` apenas algo funcione.
- Cada dev revisa el PR de otro; nadie espera más de 30 minutos por una revisión.
- Un archivo `CLAUDE.md` en la raíz con el contexto del proyecto, para que el Claude Code de los tres trabaje igual.
- Contrato de API primero (primeros 30 minutos, Mateo y Luis). Luis trabaja con datos mock desde el inicio y no espera al backend.
- Sync de 10 minutos tres veces al día (mañana, tarde y noche). Los bloqueos se avisan al instante en el grupo.

## 3. Contrato de API (mínimo)

| Endpoint | Función |
|---|---|
| `GET /assets`, `GET /assets/:id` | Lista y detalle de activos (silo, campaña) |
| `POST /authorize` | Autoriza una wallet verificada (KYC simulado) |
| `POST /buy` | Compra de fracciones pagando en USDC de prueba |
| `GET /portfolio/:address` | Fracciones y retornos de un inversionista |
| `POST /distribute` | Reparte retornos proporcionalmente a los tenedores |
| `GET /trace/:id`, `POST /trace` | Lee y agrega hitos de trazabilidad (hash en Stellar) |

> El contrato completo y vinculante está en [04-api-contrato.md](../tecnico/04-api-contrato.md).

## 4. Plan por día

| Cuándo | Quién | Tareas |
|---|---|---|
| Hoy (20) | Todos | Alcance, nombre, contrato de API, repo y `CLAUDE.md` |
| Hoy (20) | Sebas | Cuentas, asset, flags, USDC de prueba; compra funcionando por script |
| Hoy (20) | Mateo / Luis | API con datos mock / login con Pollar y esqueleto de pantallas |
| Hoy (20) | Rafa / Diego | Marca y pantallas en Figma listas esta noche / textos del formulario, guion del pitch, estructura del README |
| Mañana (21) | Sebas | Autorización de wallets; reventa en DEX si alcanza |
| Mañana (21) | Mateo | Reparto de retornos y trazabilidad con hash |
| Mañana (21) | Luis | Conectar pantallas a la API real (compra hasta portafolio) |
| Mañana (21) | Rafa / Diego | Ajustes de UI con Luis / QA del flujo, video borrador y deck |
| Mañana (21) | Todos | Congelar código a las 21:00; después solo bugs |
| 22 | Diego + todos | Video final, README, formulario y envío. Confirmar con los organizadores la hora límite exacta; idealmente enviar la noche del 21 |

## 5. Qué se corta si no alcanza (en este orden)

1. Reventa en el DEX.
2. Hash de trazabilidad en Stellar (dejar la línea de tiempo sin hash).
3. Integración con Vaquita.
4. Vertical urbano (queda en el roadmap).

**Núcleo que no se negocia:** login, emisión, autorización, compra en USDC, portafolio y reparto de retornos, todo funcionando en testnet.

**Riesgo principal:** no es técnico sino de integración. Si el frontend espera al backend, se pierde un día. Por eso el contrato de API primero y los datos mock desde el inicio.
