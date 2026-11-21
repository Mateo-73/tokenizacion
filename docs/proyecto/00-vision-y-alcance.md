# 00 — Visión y alcance

## Problema
Santa Cruz es el motor agrícola de Bolivia, pero producir sigue dependiendo en gran parte de la banca tradicional. Los activos del campo (silos, almacenes, campañas de cosecha) son difíciles de fraccionar y vender, y casi nadie fuera de la región puede invertir en ellos. Quien aporta capital rara vez puede verificar qué pasa con su dinero durante la campaña.

## Solución
**Siembra** (nombre de trabajo) tokeniza esos activos como assets en Stellar. Inversionistas con wallet autorizada compran fracciones en USDC, reciben retornos en USDC y verifican la trazabilidad (hitos con hash en Stellar). Mensaje central: *"Santa Cruz alimenta al mundo; ahora el mundo puede invertir en Santa Cruz."*

## Usuarios
- **Productor / dueño del activo** (oferta): publica un activo y recibe financiamiento. En la demo lo opera un administrador.
- **Inversionista** (demanda): bolivianos en el exterior, empresarios, inversionistas de la región.
- **Administrador** (rol interno de la demo): emite activos, autoriza wallets, registra hitos y reparte retornos.

## Verticales
- **Agro (MVP):** infraestructura agroindustrial (silo) y campaña de cosecha.
- **Urbano (fase 2, NO se construye ahora):** mismo motor aplicado a departamentos y locales.

## Alcance del MVP (lo que debe funcionar en testnet)
| # | Funcionalidad | Prioridad |
|---|---|---|
| 1 | Login / creación de wallet (Pollar, con Plan B custodial) | Núcleo |
| 2 | Emisión de 2 activos como assets Stellar con AUTH_REQUIRED | Núcleo |
| 3 | Autorización de wallets (KYC simulado) | Núcleo |
| 4 | Compra de fracciones pagando en USDC de prueba (transacción atómica) | Núcleo |
| 5 | Portafolio del inversionista | Núcleo |
| 6 | Reparto de retornos proporcional en USDC | Núcleo |
| 7 | Trazabilidad: línea de tiempo de hitos con hash en Stellar | Alta |
| 8 | Reventa en el DEX nativo | Opcional |
| 9 | Integración con Vaquita | Opcional |
| 10 | Vertical urbano | Fuera del MVP |

**Orden de recorte si falta tiempo:** 8 → hash en Stellar de la trazabilidad (dejar la línea de tiempo sin hash) → 9 → 10.

## Datos de ejemplo (todo simulado y etiquetado así)
| Asset | Nombre | Fracciones | Precio por fracción | Retorno simulado |
|---|---|---|---|---|
| `SILO01` | Silo de acopio, Santa Cruz (ejemplo) | 1.000 | 50 USDC | Renta de almacenaje simulada, pago periódico |
| `SOYA01` | Campaña de soya verano 2026/27, 200 ha (ejemplo) | 2.000 | 25 USDC | Pago único simulado al vender la cosecha |

## Criterios de éxito (lo que mira el jurado)
1. Flujo completo en testnet: entrar, ser autorizado, comprar, ver portafolio, ver trazabilidad, recibir retorno.
2. Uso real de Stellar: assets con flags de autorización, USDC, pagos atómicos, hash on-chain, enlaces al explorador.
3. Problema real de Bolivia (trazabilidad agrícola, acceso a financiamiento) y una historia clara.
4. Interfaz cuidada con identidad cruceña (verde y blanco).

## Fuera de alcance (no hacer)
- Mainnet, dinero real, KYC real, tierra como activo, cumplimiento regulatorio completo, app móvil, notificaciones, múltiples cultivos, panel de productor completo.

## Límites honestos (decirlos en la demo)
Datos de producción, ventas y retornos son simulados. El respaldo legal del token (vehículo legal/SPV) y el marco regulatorio boliviano están en el roadmap, no resueltos.
