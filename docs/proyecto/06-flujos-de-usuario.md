# 06 — Flujos de usuario y guion de demo

Cada flujo indica lo que ve el usuario, el endpoint (docs/tecnico/04) y lo que ocurre en Stellar (docs/tecnico/03).

## Flujo A — Entrar y ser autorizado
1. El usuario abre la web y entra (Pollar, o botón "Entrar como inversionista demo" en Plan B).
2. Web → `POST /investors/demo` → backend crea cuenta, trustline a USDC y fondea 1.000 USDC de prueba.
3. El usuario abre un activo (`GET /assets/:id`) y pulsa **"Verificar identidad"**.
4. Web → `POST /authorize` → trustline al asset + autorización del emisor (KYC simulado, se etiqueta así en la interfaz).
5. La interfaz muestra "Wallet verificada" con enlace al explorador.

## Flujo B — Comprar fracciones
1. En la ficha del activo, el usuario elige la cantidad (entero ≥ 1); la interfaz muestra el total en USDC.
2. Web → `POST /buy`.
3. Stellar: una transacción atómica (pago USDC del inversionista al distribuidor + pago de fracciones al inversionista).
4. Confirmación con `txHash` y enlace al explorador. Errores en lenguaje claro: sin verificar, USDC insuficiente, fracciones agotadas.

## Flujo C — Portafolio
Web → `GET /portfolio/:investorId`. Muestra USDC disponible, fracciones por activo, valor y retornos recibidos. Los balances vienen de Stellar.

## Flujo D — Retornos (administrador)
1. Vista de administrador (puede ser una página oculta `/admin` con la `x-admin-key`).
2. Elige activo, monto de retorno **simulado** y período → `POST /distribute`.
3. Stellar: pagos de USDC desde `TREASURY` a cada tenedor, proporcional a sus fracciones sobre el total del activo.
4. El inversionista ve el retorno en su portafolio (`returns`).

## Flujo E — Trazabilidad
1. En la ficha del activo, sección **"Trazabilidad"** con línea de tiempo (`GET /trace/:assetId`).
2. Cada hito muestra tipo, fecha, descripción y un sello **"Verificado en Stellar"** si `verified: true` (con enlace al explorador).
3. El administrador agrega hitos en vivo (`POST /trace`) para la demo: el hito aparece con su hash.

## Flujo F — Reventa (opcional, solo si el núcleo está listo)
Oferta de venta en el DEX nativo (`manageSellOffer`). No bloquea nada.

## Estados vacíos y errores (UX mínima)
- Sin portafolio: "Aún no tienes fracciones. Explora los activos."
- Carga: esqueletos, no pantallas en blanco. Fallo de red: mensaje y botón "Reintentar".
- Toda transacción mostrada tiene enlace al explorador.

## Guion de demo (≈ 2 minutos)
1. **(0:00)** Problema en una frase: "Santa Cruz alimenta al mundo, pero el capital para producir depende de pocas puertas."
2. **(0:15)** Catálogo: dos activos (silo y campaña de soya). Decir que son datos de ejemplo.
3. **(0:25)** Entrar y verificar identidad (KYC simulado). Mostrar el sello.
4. **(0:40)** Comprar 10 fracciones. Mostrar la transacción en el explorador.
5. **(1:00)** Portafolio actualizado.
6. **(1:10)** Trazabilidad: agregar un hito en vivo y mostrar el sello "Verificado en Stellar".
7. **(1:30)** Reparto de retornos (simulado) y verlo reflejado en el portafolio.
8. **(1:50)** Cierre: "Capital global para el agro cruceño, con transparencia verificable." Mencionar roadmap: respaldo legal, rampas locales, Stellar Community Fund.

**Plan de contingencia de la demo:** tener un video grabado del flujo completo y una cuenta demo ya autorizada con compras hechas, por si falla la red.

## Definición de "flujo listo"
Un integrante que no escribió el código puede recorrer A → E en una máquina limpia, en testnet, sin tocar la consola.
