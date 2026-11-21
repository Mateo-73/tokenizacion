# 11 — Plan de tareas y prompts (todo el equipo)

Fusiona "plan de tareas" y "prompts de Claude Code". Cubre **todas** las tareas de los cinco integrantes.
Fechas: **hoy 20 nov (noche), 21 nov, 22 nov (cierre de envío)**. Confirmar con los organizadores la hora límite exacta del 22.

## Cambios posteriores y estado (21 nov)
> Este bloque se añadió al incorporar el plan al repositorio. El resto del documento es el original del equipo.

- **Lenguaje: JavaScript** (ESM). Los prompts y nombres de archivo de este plan (`.js`) se mantienen tal cual.
- **Sebas salió del equipo.** Sus tareas **S0–S9 pasan a Mateo** (rama `feat/stellar`). Los prompts de la sección 4 los ejecuta Mateo.
- **S0 ya no hace falta:** `api/src/services/stellar-port.js` define las firmas de docs/03 §5 y `api/src/services/mock-stellar.js` las implementa. Falta `api/src/stellar/index.js` con la red real (S7).
- **Los documentos que cita este plan** son los del `siembra-docs.zip` (00, 01, 02, 03, 04, 06). Los dos que aún no existen y se producen en el plan son `docs/07-ux-ui-design-system.md` (Rafa, R3) y `docs/api-mock-curl.md` (M1).

| ID | Estado |
|---|---|
| S1 | **Hecho:** 4 cuentas en testnet, flags `AUTH_REQUIRED\|AUTH_REVOCABLE` y 100.000 USDC de prueba en `TREASURY` |
| S2 | **Hecho:** `SILO01` (1.000) y `SOYA01` (2.000) emitidos; el `DISTRIBUTOR` los muestra; `npm run seed` es idempotente |
| S3 | **Hecho (hito):** `npm run demo:buy` crea un inversionista con 1.000 USDC, lo autoriza y compra 10 fracciones de `SILO01` en una transacción atómica (2 pagos, 2 firmas); verifica saldos en Horizon y los errores `NOT_AUTHORIZED`, `INSUFFICIENT_FRACTIONS`, `INSUFFICIENT_USDC` |
| S4 | **Hecho:** `getPortfolio` y `getHolders` leen de Horizon; `npm run portfolio -- <clave>` muestra el portafolio y comprueba que vendidas = total − distribuidor |
| S5–S7 | Pendientes |
| M1 | **Hecho** en modo mock; falta `docs/api-mock-curl.md` |
| M3–M8 | **Hechos en modo mock** (12 pruebas en `api/test/`); falta probarlos con Stellar real |
| M2 | Pendiente: hoy el almacén es en memoria, falta `db.json` y `seed.json` |
| M9 | Parcial: `npm test` corre el flujo completo, pero solo en modo mock |
| L*, R*, D* | Sin cambios en este documento |

## 0. Cómo usar este documento
1. Cada quien busca su sección (Sebas, Mateo, Luis, Rafa, Diego).
2. Las tareas tienen ID (`S1`, `M3`, `L2`, `R1`, `D4`...). Se hacen **en orden**, salvo que diga "paralelo".
3. Los devs pegan el prompt de la tarea en Claude Code, que empieza leyendo `CLAUDE.md` y el doc indicado.
4. Una tarea está **terminada** cuando cumple su criterio de "Hecho" y está en `main`. Avisar en el grupo con el ID: "S3 listo".

## 1. Reglas de coordinación
- **Ramas:** `feat/stellar` (Sebas), `feat/api` (Mateo), `feat/ui` (Luis), `docs/*` (Diego). Antes de abrir PR: `git pull --rebase origin main`.
- **Merge:** PR pequeño, revisado por otro dev en menos de 30 minutos. Orden de merge ante conflicto: stellar → api → ui.
- **Carpetas:** cada quien edita solo la suya (ver `CLAUDE.md`). Para tocar la de otro, avisar en el grupo.
- **Diseño sin git:** Rafa y Diego pueden dejar sus entregables en la carpeta `design/` del repo o enviarlos al grupo; Luis los sube si no usan git.
- **Syncs de 10 minutos:** 09:00, 14:00 y 21:00 (21 y 22 nov). Formato: qué terminé, qué sigo, qué me bloquea.
- **Bloqueos:** más de 20 minutos atascado = avisar en el grupo y pasar a mock. Nadie espera a otro sin decirlo.
- **Congelamiento de código:** 21 nov a las 21:00. Después, solo bugs críticos.

## 2. Puntos de integración (lo que desbloquea a quién)
| ID | Qué | Quién entrega | Quién lo necesita | Cuándo |
|---|---|---|---|---|
| INT-1 | API en `MOCK_MODE` respondiendo como docs/04 | Mateo (M1) | Luis | Primera hora de hoy |
| INT-2 | `stellar/index.js` con las firmas de docs/03 §5 (puede ser stub) | Sebas (S0) | Mateo | Primera hora de hoy |
| INT-3 | Marca + pantallas + tokens de diseño | Rafa (R1–R3) | Luis | Esta noche / mañana temprano |
| INT-4 | Funciones Stellar reales (compra, portafolio) | Sebas (S3–S4) | Mateo | Noche de hoy |
| INT-5 | API real completa | Mateo (M4–M7) | Luis (L8) | Mañana 21, tarde |
| INT-6 | Flujo A→E de punta a punta | Todos | Diego (QA, video) | Mañana 21, tarde-noche |

## 3. Línea de tiempo resumida
| Momento | Sebas | Mateo | Luis | Rafa | Diego |
|---|---|---|---|---|---|
| **Noche 20** | S0, S1, S2, S3 | M1, M2, M3 | L1, L2 | R1, R2 | D0, D1 |
| **21 mañana** | S4, S5 | M4, M5 | L3, L4 | R2, R3, R4 | D2, D4 |
| **21 tarde** | S6, S7 | M6, M7, M8 | L5, L6, L8 | R5 | D4, D5 |
| **21 noche** | Bugs, congelar | Bugs, congelar | L7, L9, congelar | R5 | D5 (video borrador), D3 |
| **22** | Soporte y bugs | Soporte y bugs | Soporte y bugs | Soporte visual | D5 final, D6 envío |

---

## 4. Sebas — núcleo Stellar (carpeta `api/src/stellar/`, `scripts/`)

**S0 — Stub de `stellar/index.js` (primera hora).** Exporta todas las funciones de docs/03 §5 con la firma correcta, devolviendo valores falsos coherentes. *Hecho:* Mateo puede importarlas y compilar. (INT-2)
```
Lee CLAUDE.md y docs/03-stellar-modelo-de-activos.md §5.
Crea api/src/stellar/index.js exportando TODAS las funciones de §5 con la firma exacta, como stubs que devuelvan datos falsos coherentes (txHash falso, balances inventados). No implementes lógica real todavía. Deja un comentario TODO por función.
```

**S1 — Repo y setup de cuentas.** Estructura del repo (docs/02), `.gitignore`, `client.js`, `scripts/setup-stellar.js` (docs/03 §4.1). *Hecho:* 4 cuentas creadas y fondeadas en testnet; claves en `api/.stellar-keys.json`; flags `AUTH_REQUIRED|AUTH_REVOCABLE` visibles en el explorador.
```
Lee CLAUDE.md, docs/02-stack-tecnologico.md y docs/03-stellar-modelo-de-activos.md §1, §3, §4, §4.1.
Tarea: crea la estructura del repo (api/, web/ vacío, scripts/), el .gitignore y package.json de api (ESM). Implementa api/src/stellar/client.js y scripts/setup-stellar.js. Ejecútalo contra testnet y muéstrame las claves públicas y el resultado de los flags. No guardes secretos fuera de api/.stellar-keys.json.
```

**S2 — Emitir activos.** `issueAsset` (docs/03 §4.2) y `scripts/seed.js` que emite `SILO01` (1000) y `SOYA01` (2000). *Hecho:* el `DISTRIBUTOR` muestra el total de fracciones de cada asset.
```
Lee docs/03 §2, §4.2. Implementa issueAsset en api/src/stellar/assets.js y scripts/seed.js para emitir SILO01 (1000 fracciones) y SOYA01 (2000). Ejecuta el seed y verifica los balances del distribuidor con Horizon. Haz el seed idempotente: si el asset ya fue emitido, no repetir.
```

**S3 — Inversionista, autorización y compra (hito de hoy).** `createDemoInvestor`, `authorizeInvestor`, `buyFractions` (docs/03 §4.3, §4.4, §4.7). *Hecho:* por script, un inversionista demo con 1000 USDC compra 10 fracciones de `SILO01`; el `txHash` se ve en el explorador. (INT-4)
```
Lee docs/03 §4.3, §4.4, §4.7 y §7 (errores típicos).
Implementa createDemoInvestor, authorizeInvestor y buyFractions en api/src/stellar/. La compra debe ser UNA transacción atómica con dos pagos y dos firmas (distribuidor e inversionista). Valida antes: trustline autorizada, saldo USDC, fracciones disponibles; lanza Error con .code (NOT_AUTHORIZED, INSUFFICIENT_USDC, INSUFFICIENT_FRACTIONS). Crea scripts/demo-buy.js que haga el flujo completo y muestre el link del explorador.
```

**S4 — Portafolio y tenedores.** `getPortfolio`, `getHolders` (docs/03 §4.5, §4.6). *Hecho:* tras S3, `getPortfolio` muestra 10 fracciones y 500 USDC menos.

**S5 — Reparto de retornos.** `distributeReturns` (docs/03 §4.6). *Hecho:* pagos USDC proporcionales a las fracciones sobre el total; las fracciones sin vender no cobran; lotes de máximo 50 pagos.
```
Lee docs/03 §4.6. Implementa getHolders y distributeReturns. Regla: cada tenedor cobra totalUsdc * (sus fracciones / fracciones totales del activo); excluye al DISTRIBUTOR; redondea hacia abajo a 7 decimales; lotes de 50 pagos por transacción. Prueba por script con dos inversionistas con distinta cantidad de fracciones y muestra los pagos.
```

**S6 — Trazabilidad.** `recordTrace`, `verifyTrace` (docs/03 §4.8). *Hecho:* un hito se guarda con su hash en `ISSUER` y `verifyTrace` devuelve `true`; si cambia el texto del hito, devuelve `false`.

**S7 — Cierre de la capa Stellar.** Reemplazar los stubs de `index.js` por las implementaciones reales; documentar en un `README` corto dentro de `api/src/stellar/` cómo correr los scripts. *Hecho:* ningún stub queda en `index.js`.

**S8 — Opcional: reventa en DEX.** Solo si S1–S7 están listos y estables (docs/03 §4.9).

**S9 — Soporte.** Ayudar a Luis si Pollar necesita firmar trustlines o pagos (Plan A); medir si vale la pena. Corregir bugs de red (Horizon lento, `tx_bad_auth`).

---

## 5. Mateo — API y servicios (carpetas `api/src/routes/`, `services/`, `data/`)

**M1 — Esqueleto de API en MOCK_MODE (primera hora, INT-1).** Express + CORS (`http://localhost:5173`) + manejador de errores `{error:{code,message}}` + `/health` + todos los endpoints de docs/04 devolviendo las respuestas de ejemplo. *Hecho:* `curl` a cada endpoint con `MOCK_MODE=true` devuelve la forma exacta del contrato; Luis puede trabajar.
```
Lee CLAUDE.md y docs/04-api-contrato.md completo.
Crea api/src/server.js (Express, ESM, CORS para http://localhost:5173, JSON, manejador de errores uniforme) y las rutas de TODOS los endpoints. Con MOCK_MODE=true cada endpoint devuelve exactamente los JSON de ejemplo del doc (txHash falso, explorerUrl null). No uses Stellar todavía. Entrega un script npm run dev y un archivo docs/api-mock-curl.md con los curl de prueba.
```

**M2 — Datos (`db.json`) y servicios.** Estructura y servicio de lectura/escritura de `api/data/db.json`: catálogo (`SILO01`, `SOYA01` con textos y precios de docs/00), inversionistas demo (con clave, **solo testnet**), hitos, historial de retornos. Semilla `api/data/seed.json` versionada (sin claves). *Hecho:* `npm run dev` crea `db.json` desde la semilla si no existe.
```
Lee docs/00 (datos de ejemplo), docs/04 y docs/01.
Crea api/src/services/db.js que lea/escriba api/data/db.json de forma segura (escritura atómica) con colecciones: assets, investors, trace, returns. Crea api/data/seed.json con los dos activos de docs/00 y los hitos iniciales (SOYA01: siembra, insumos; SILO01: almacenaje) etiquetados como ejemplo. db.json va en .gitignore, seed.json se versiona.
```

**M3 — Lectura de activos.** `GET /assets`, `GET /assets/:id` con `soldFractions` calculado desde Stellar (en mock: valor fijo). *Hecho:* coincide con docs/04.

**M4 — Inversionistas, autorización y compra.** `POST /investors/demo`, `POST /authorize`, `POST /buy` con validaciones y mapeo de errores (`NOT_AUTHORIZED`, `INSUFFICIENT_USDC`, `INSUFFICIENT_FRACTIONS`, `VALIDATION`). Llama solo a `stellar/index.js`. *Hecho:* el flujo curl de docs/04 funciona en testnet de punta a punta.
```
Lee docs/04 (investors/demo, authorize, buy) y docs/03 §5.
Implementa esos tres endpoints en api/src/routes y api/src/services usando SOLO las funciones de api/src/stellar/index.js. Valida: fractions entero >= 1, assetId existente, investorId existente. Mapea los errores .code de stellar al formato de docs/04 con el status HTTP adecuado. Respeta MOCK_MODE. Prueba con los curl del doc.
```

**M5 — Portafolio.** `GET /portfolio/:investorId` combinando `stellar.getPortfolio` con precios del catálogo y el historial de retornos. *Hecho:* tras comprar, aparece la tenencia con `valueUsdc`.

**M6 — Distribución.** `POST /distribute` (admin) → `stellar.distributeReturns`; guarda cada retorno en `returns`. *Hecho:* respuesta de docs/04 y el retorno aparece en el portafolio.

**M7 — Trazabilidad.** `GET /trace/:assetId` (con `verified` vía `verifyTrace`) y `POST /trace` (admin; asigna `order`, llama `recordTrace`, guarda en `db.json`). *Hecho:* un hito creado aparece con hash y `verified: true`.

**M8 — Seguridad básica y errores.** Middleware `x-admin-key`; no registrar secretos en logs; respuestas de error claras. *Hecho:* sin la clave, `POST /distribute` y `POST /trace` devuelven `FORBIDDEN`.

**M9 — Prueba de flujo.** `npm run test:flow`: script que corre el flujo completo contra la API local y falla si algo se rompe. *Hecho:* sale en verde en una máquina limpia (tras `setup:stellar` y `seed`).

---

## 6. Luis — Frontend (carpeta `web/`)

**L1 — Scaffold y mocks.** Vite + React + Tailwind + router; `src/lib/api.js` con las funciones del contrato; `src/mocks/` con las respuestas de docs/04; flag `VITE_USE_MOCKS=true`. *Hecho:* `npm run dev` abre una app con rutas vacías y los mocks funcionando.
```
Lee CLAUDE.md, docs/02 y docs/04.
Crea web/ con Vite + React + Tailwind + react-router. Rutas: / (catálogo), /activo/:id, /portafolio, /admin. Crea src/lib/api.js con una función por endpoint de docs/04 (usa VITE_API_URL) y src/mocks/ con las respuestas de ejemplo del doc; si VITE_USE_MOCKS=true, api.js usa los mocks. Aún sin diseño final: layout simple, estilos neutros.
```

**L2 — Catálogo.** Página `/` con tarjetas de activos (nombre, tipo, precio por fracción, fracciones disponibles, etiqueta "datos de ejemplo"). *Hecho:* se ve con mocks y con la API real.

**L3 — Ficha del activo.** `/activo/:id`: detalle, botón "Verificar identidad" (`/authorize`), selector de fracciones con total en USDC, botón "Comprar" (`/buy`), confirmación con enlace al explorador, **sección de trazabilidad** (línea de tiempo con sello "Verificado en Stellar"). *Hecho:* el flujo B de docs/06 completo con mocks.
```
Lee docs/06 (flujos A, B y E) y docs/04.
Implementa /activo/:id: detalle, "Verificar identidad", compra con total en USDC, estados de carga/error/éxito con enlace al explorador, y la línea de tiempo de trazabilidad con sello "Verificado en Stellar" cuando verified es true. Todo dato simulado se muestra con la etiqueta "ejemplo/simulado". Errores en español claro (sin verificar, USDC insuficiente, fracciones agotadas).
```

**L4 — Entrada del usuario.** Plan B: botón "Entrar como inversionista demo" → `POST /investors/demo`, guardando `investorId` en estado/`localStorage`. Plan A: integrar Pollar (login con Google o email) detrás de `VITE_USE_POLLAR`, según su documentación oficial; si no está claro en 45 minutos, dejarlo y seguir con Plan B. *Hecho:* Plan B funciona sí o sí.

**L5 — Portafolio.** `/portafolio`: USDC disponible, tenencias, valor, retornos recibidos. *Hecho:* refleja una compra y un reparto.

**L6 — Admin.** `/admin` (pide `x-admin-key` en un campo): reparto de retornos (`/distribute`) y agregar hito (`/trace`). *Hecho:* se puede hacer la demo en vivo desde la interfaz.

**L7 — Estados y calidad.** Cargando (esqueletos), vacío, error con "Reintentar"; enlace al explorador en toda transacción; responsive móvil. *Hecho:* no hay pantallas en blanco.

**L8 — Integración real (INT-5).** Apagar mocks (`VITE_USE_MOCKS=false`), probar contra la API real, reportar diferencias del contrato en el grupo. *Hecho:* flujo A→E funcionando contra testnet.

**L9 — Pulido visual.** Aplicar marca y tokens de Rafa (verde y blanco), tipografías y espaciados. *Hecho:* Rafa aprueba la revisión visual (R5).

---

## 7. Rafa — Diseño y marca (entregables en `design/` o por el grupo)

**R1 — Nombre y marca (esta noche).** Confirmar nombre final del proyecto (por ahora "Siembra"), logo simple (SVG), paleta verde y blanco con identidad cruceña, tipografía (Google Fonts). *Hecho:* tokens definidos: 3 verdes, 1 blanco, 1 gris, 1 color de acento, radios, sombras.

**R2 — Pantallas.** Cuatro pantallas en Figma (o, si es más rápido, prototipo HTML hecho con Claude): **catálogo, ficha del activo (compra + trazabilidad), portafolio, admin simple**. Móvil y escritorio. Incluir estados: carga, vacío, error. *Hecho:* Luis puede implementar sin preguntar nada básico.
```
(Prompt para Claude, no Claude Code)
Actúa como diseñador UI. Proyecto: Siembra, plataforma sobre Stellar para invertir en fracciones de activos del agro cruceño (silos y campañas de cosecha). Identidad: Santa Cruz, verde y blanco, sobria y moderna, transmite confianza y transparencia. Diseña en HTML + Tailwind la pantalla: [catálogo | ficha con compra y línea de tiempo de trazabilidad | portafolio | admin]. Usa español. Incluye etiqueta "datos de ejemplo" en datos simulados, sello "Verificado en Stellar" en la trazabilidad, y enlace "Ver transacción en el explorador". Datos: SILO01 (1000 fracciones, 50 USDC) y SOYA01 (2000 fracciones, 25 USDC). Entrega código limpio y responsive.
```

**R3 — Handoff a Luis.** Documento corto en `docs/07-ux-ui-design-system.md` (colores en hex, tipografías, tamaños, componentes: tarjeta, botón, badge, línea de tiempo, toast) y snippet de `tailwind.config`. *Hecho:* Luis copia los tokens sin interpretarlos.

**R4 — Imágenes y recursos.** Logo SVG, favicon, íconos y 2–3 imágenes del campo/silo **con licencia libre o generadas** (no sacar fotos con derechos de autor de internet). *Hecho:* cargadas en `web/public/brand/`.

**R5 — Revisión visual.** Comparar la implementación con el diseño y entregar una lista corta de ajustes priorizados (máximo 10). *Hecho:* Luis cierra la lista antes del congelamiento.

**R6 — Apoyo al deck.** Diseño visual de las diapositivas del pitch junto con Diego (D2).

---

## 8. Diego — Producto, entrega y coordinación

**D0 — Coordinación.** Tablero simple (lista con IDs de este doc y estado), dirigir los syncs de 09:00, 14:00 y 21:00, desbloquear dependencias, decidir recortes (sección 10). *Hecho:* en cada sync se sabe qué está listo, en curso y bloqueado.

**D1 — Textos del formulario.** Copiar al formulario los textos ya redactados (pitch ≤120 caracteres, descripción ≤600, problema ≤600, solución ≤600, validación ≤400, clientes potenciales) y reemplazar "Siembra" si Rafa cambia el nombre. Revisar que ninguna afirmación prometa algo que la demo no hace. *Hecho:* borrador completo del formulario listo antes de mañana.

**D2 — Deck del pitch (5–7 diapositivas).** Problema, solución, demo (capturas), por qué Stellar, mercado (remesas, productores), diferenciación frente a RedSwan, roadmap. Con Claude en el chat y el diseño de Rafa. *Hecho:* PDF o PowerPoint listo para la final del 27.
```
(Prompt para Claude, no Claude Code)
Crea el contenido de un deck de 6 diapositivas para el pitch de Siembra en la Ubihackathon (Stellar). Diapositivas: 1 problema, 2 solución, 3 demo y por qué Stellar, 4 mercado (remesas > USD 1.200 M/año en Bolivia; 70.000 productores en la CAO), 5 diferenciación frente a RedSwan y validación, 6 roadmap (respaldo legal, rampas locales, Stellar Community Fund). Máximo 25 palabras por diapositiva, tono sobrio y orgulloso de Santa Cruz, sin prometer rendimientos.
```

**D3 — README.** Qué es, cómo correrlo (`setup:stellar`, `seed`, `dev`), arquitectura en 5 líneas, capturas, aviso de que los datos son simulados y es testnet. Se escribe con el repo casi cerrado. *Hecho:* una persona nueva corre el proyecto siguiendo solo el README.

**D4 — QA continuo.** Recorrer el flujo A→E de docs/06 cada vez que se integra algo; reportar bugs al grupo con: pasos, resultado esperado, resultado real, captura y gravedad (bloquea la demo / molesta / cosmético). *Hecho:* lista de bugs priorizada y todos los "bloquea la demo" cerrados antes de las 21:00 del 21.

**D5 — Video demo.** Borrador el 21 en la noche, final el 22. Seguir el guion de docs/06 (2 minutos). Grabar también una versión de respaldo por si falla la red. *Hecho:* video subido (enlace) y probado en otro dispositivo.

**D6 — Envío (22 nov).** Checklist final:
- [ ] Repo con `README`, sin secretos (revisar `git log` y archivos), enlace accesible para los jueces.
- [ ] Video demo con enlace funcional.
- [ ] Textos del formulario pegados y contados (caracteres).
- [ ] Capturas y deck adjuntos si se piden.
- [ ] Demo funcionando en una máquina limpia.
- [ ] Enviado **antes** de la hora límite, de preferencia la noche del 21 o primera hora del 22.

**D7 — Validación (opcional, alto valor).** Una llamada de 15 minutos con un productor, un agente inmobiliario o un boliviano en el exterior. Anotar 2–3 frases literales y agregarlas al texto de validación. *Hecho:* una conversación hecha y registrada.

---

## 9. Reglas de oro para trabajar con Claude Code (para Sebas, Mateo, Luis)
- Una tarea por sesión, un commit por tarea.
- Pegar siempre "Lee CLAUDE.md y el doc indicado" al inicio.
- Ejecutar y verificar uno mismo (testnet y explorador). No confiar en "debería funcionar".
- Si el modelo propone cambiar el contrato de API o un nombre de función, **no** lo hace en silencio: se avisa en el grupo y se edita primero el doc.
- Pedir cambios pequeños y específicos. Si un error se repite dos veces, pegar el error completo y el archivo relevante.
- No pegar claves secretas en los prompts.

## 10. Orden de recorte (decide Diego en cada sync)
1. Reventa en DEX (S8).
2. Hash on-chain de la trazabilidad (dejar la línea de tiempo con `verified: false` oculto) — el resto de M7/L3 sigue.
3. Plan A con Pollar (queda el Plan B, que ya funciona).
4. Vaquita.
5. Vertical urbano (ya está fuera del MVP).

**Núcleo que nunca se recorta:** entrada, emisión, autorización, compra en USDC, portafolio y reparto de retornos, todo en testnet.

## 11. Si algo sale mal
| Problema | Acción |
|---|---|
| Friendbot o Horizon caídos | Esperar 10 minutos; si persiste, `MOCK_MODE=true` para avanzar con UI y video, y reintentar después |
| Pollar no permite firmar | Plan B (cuentas demo custodiales); no dedicar más de 45 minutos |
| Un dev bloqueado | Avisar en el grupo; otro dev toma la tarea o se recorta |
| Conflicto de merge | Quien abre el PR hace `git pull --rebase`; orden de merge stellar → api → ui |
| No alcanza el tiempo | Recortar según la sección 10 y avisar a Diego |
| Falla la demo en vivo (27 nov) | Video de respaldo y cuenta demo ya autorizada con compras hechas |
