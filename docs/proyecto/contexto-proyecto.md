# Tokenización de inmuebles sobre Stellar

Documento de contexto del equipo · Ubihackathon 2026 · Stellar para startups

> Nota: este documento fue escrito el 18 de noviembre y su plan de 4 días está reemplazado por el [workflow del equipo](workflow-equipo.md) (plan de 20 y 21 de noviembre).

## 1. Contexto

Participamos en la Ubihackathon 2026, enfocada en construir sobre la red Stellar para startups.

Nuestra idea es una plataforma web que permita tokenizar inmuebles: representar un inmueble como tokens en la red Stellar para que varias personas puedan comprar fracciones, recibir ingresos por renta y revender su participación.

## 1b. La hackathon: pilares, aliados y cronograma

National Startups Hackathon by Stellar. No es una hackathon de ideas: es el inicio de una startup. Los mejores equipos pasan a incubación y preparan su aplicación al Stellar Community Fund (montos de USD 15k a 150k).

### Pilares

| Pilar | Qué piden | Cómo lo cubrimos |
|---|---|---|
| 1. Usa Stellar | Blockchain como pieza central, no como adorno (pagos, stablecoins, tokenización, identidad) | Cada fracción es un asset de Stellar; compra y retornos en USDC; mercado secundario en el DEX |
| 2. Integra el ecosistema | Usar Vaquita, Pollar u otras herramientas existentes | Pollar para login, wallet y pagos; Vaquita como integración a validar (ver stack) |
| 3. Resuelve algo real | Trazabilidad agrícola, remesas, credenciales, transparencia pública | Vertical agro: financiamiento de campañas con trazabilidad verificable |
| 4. Llega a fondeo | Incubación y aplicación al Stellar Community Fund | Roadmap y modelo de negocio claros desde el pitch |

Aliados: BAF, Vaquita, Stellar, Pollar y Buidlers.

### Cronograma

| Fecha | Hito |
|---|---|
| 9 al 14 de noviembre | Arranca la etapa virtual (mentoría online y eventos presenciales en varias ciudades) |
| 22 de noviembre | Cierra la etapa virtual: último día para enviar el proyecto |
| 23 de noviembre | Anuncio de finalistas |
| 27 de noviembre | Final presencial en Santa Cruz: pitch ante jurado, premiación y networking (pasaje pagado para un representante por equipo) |

## 2. Idea en una frase

Una plataforma sobre Stellar para tokenizar activos inmobiliarios con dos verticales: Urbano (departamentos, locales, comercial) y Agro (infraestructura agroindustrial y campañas de cosecha), pensada desde Santa Cruz para abrir el capital internacional al campo cruceño. Los inversionistas con wallet verificada compran fracciones, cobran retornos en USDC y pueden revender en un mercado secundario.

Diferenciador frente a RedSwan (que ya tokeniza inmuebles comerciales de EE.UU. sobre Stellar): enfoque en Latinoamérica, montos pequeños y un vertical agro que ellos no cubren.

## 3. Alcance del MVP (lo que debe funcionar en la demo)

- **Emisión:** un inmueble = un asset de Stellar (ej. 1 inmueble = 1000 tokens/fracciones).
- **Acceso controlado:** solo wallets verificadas (KYC simulado) pueden tener el token, usando flags de asset como `AUTH_REQUIRED` y `AUTH_REVOCABLE`.
- **Compra de fracciones:** pago en USDC sobre Stellar; el token llega a la wallet del inversionista.
- **Mercado secundario:** uso del DEX nativo de Stellar (ofertas de compra/venta), sin construir un exchange propio.
- **Reparto de rentas:** pago periódico en USDC proporcional a los tokens que tiene cada wallet.
- **Portafolio:** vista del usuario con sus fracciones, valor e ingresos recibidos.
- **Trazabilidad (agro):** cada campaña o silo muestra una línea de tiempo de hitos (siembra, insumos, cosecha, almacenaje, venta) cuyo hash se registra en Stellar.

**Prioridad para la demo:** con 4 días, el flujo completo se construye sobre el vertical agro (una campaña y un silo de ejemplo). El vertical urbano queda como el mismo motor aplicado a otros activos (roadmap).

## 4. Flujo de usuario

| Paso | Actor | Qué pasa |
|---|---|---|
| 1 | Propietario | Registra el inmueble (datos, fotos, valor, número de fracciones). |
| 2 | Plataforma | Emite el asset en Stellar y lo pone a la venta. |
| 3 | Inversionista | Conecta su wallet (Freighter), pasa KYC simulado y es autorizado. |
| 4 | Inversionista | Compra fracciones pagando en USDC. |
| 5 | Plataforma | Distribuye la renta del período proporcionalmente a cada tenedor. |
| 6 | Inversionista | Puede vender sus fracciones a otro usuario en el DEX. |

## 4b. Vertical Agro (valor agregado)

| Producto | Qué se tokeniza | Retorno |
|---|---|---|
| Infraestructura agroindustrial | Silos, galpones, almacenes (son inmuebles; el respaldo legal es más claro que con la tierra) | Renta/servicio de almacenaje, pago periódico en USDC |
| Campaña de cosecha | Participación en una campaña (ej. soya, por hectárea) | Pago al vender la cosecha, en USDC |
| Tierra productiva (fase 2) | Fracciones de terreno | Solo en roadmap: alto riesgo legal en tenencia de tierra |

Para la demo: una campaña de ejemplo y un silo de ejemplo, con datos de producción y venta simulados (se debe decir explícitamente).

## 5. Stack propuesto (sobre Stellar y sus aliados)

| Capa | Tecnología | Nota |
|---|---|---|
| Onboarding y wallet | Pollar (`@pollar/core`, `@pollar/react`) | Login con Google, GitHub o email, wallets Stellar y pagos USDC/XLM. Baja la barrera para empresarios sin experiencia cripto; admite también Freighter y Albedo |
| Frontend | React + Stellar SDK (JS) | Catálogo, ficha de campaña/silo, compra, portafolio, línea de trazabilidad |
| Backend | Node.js | Emisión de assets, KYC simulado, distribución de retornos, registro de hashes de trazabilidad |
| Blockchain | Stellar testnet: assets clásicos con flags de autorización, USDC, DEX nativo | Suficiente para el MVP |
| Ahorro / DeFi | Vaquita (plataforma de ahorro DeFi sobre Stellar) | Integración a validar con los mentores (ej. ahorro de inversionistas o fondo de reserva de la campaña). No es obligatoria para el MVP |
| Opcional | Soroban (contratos) | Solo si alguien del equipo lo domina: escrow o reparto automático |

> Nota: Pollar es un SDK de JavaScript/TypeScript, así que encaja con el frontend en React. Hay que confirmar con los mentores qué funciones (por ejemplo KYC) están disponibles en testnet.

### 5a. Plan de trabajo hasta el envío (hoy es 18 de noviembre)

Plan original, reemplazado por el workflow del equipo.

| Día | Objetivo |
|---|---|
| 18 nov | Cerrar alcance y roles, crear cuentas emisora y distribuidora en testnet, integrar login/wallet con Pollar |
| 19 nov | Emisión de assets, autorización de wallets (KYC simulado) y compra de fracciones en USDC |
| 20 nov | Reparto de retornos, portafolio y registro de trazabilidad (hashes) en Stellar |
| 21 nov | Pulir interfaz con identidad cruceña, grabar video demo, README y presentación |
| 22 nov | Colchón y envío temprano (no dejarlo para el último minuto) |
| 23 al 27 nov | Si somos finalistas: ensayar el pitch; final presencial en Santa Cruz el 27 |

## 5b. Posicionamiento y pitch

**Mensaje central:** Santa Cruz alimenta al mundo; ahora el mundo puede invertir en Santa Cruz, con reglas claras y sin intermediarios.

- **Qué les damos a los grandes productores:** capital en dólares de inversionistas de cualquier país sin depender solo de la banca, liquidez sobre activos hoy inmóviles, y transparencia que les da credibilidad ante socios y compradores.
- **Orgullo cruceño (el envoltorio):** marca y narrativa propias (verde y blanco, nombre con identidad local), ficha pública de cada productor con su trayectoria, y el sello de "Productor Fundador" para los primeros que se sumen (escasez y prestigio).
- **Para el jurado:** el orgullo local es la historia, pero lo que convence es el flujo funcionando en testnet y que el uso de Stellar (USDC, pagos baratos, assets con flags de autorización) tenga sentido.
- **Preguntas que harán los empresarios:** cuánto cuesta este capital frente al banco, qué validez legal tiene, quiénes son los inversionistas y qué control conservo. Hay que llegar con respuesta a cada una.

## 6. Riesgos y puntos a defender ante el jurado

- **Vínculo legal:** el token solo vale si representa derechos reales. Planteamiento: el token representa participación en un vehículo legal (SPV/fideicomiso) propietario del inmueble. En Bolivia el marco es poco claro; hay que reconocerlo y proponer un socio legal.
- **Diferenciación:** ya existen plataformas de tokenización inmobiliaria. Necesitamos un ángulo propio (montos pequeños desde USD 10-50 para Latinoamérica, remesas hacia inversión inmobiliaria, o tokenizar solo alquileres).
- **Alcance vs. tiempo:** quedan 4 días para enviar. Un flujo completo y simple en testnet vale más que muchas funciones a medias; todo lo demás va al roadmap.
- **Riesgo agro:** clima, precios e incumplimiento del productor. Mitigación a plantear: verificación del productor, reserva o seguro. También validar el marco regulatorio boliviano para activos digitales y valores.
- **Tiempo:** Soroban es el mayor riesgo de cronograma. Primero el flujo completo con assets clásicos.
- **Demo:** debe ser un flujo real en testnet (conectar wallet, comprar fracción, ver token, cobrar renta), no solo diseño.

## 7. Pendientes por definir como equipo

- Roles: quién hace frontend, backend/Stellar, diseño y pitch. *(Resuelto en [workflow-equipo.md](workflow-equipo.md).)*
- Nombre y marca del proyecto con identidad cruceña. *(Pendiente; el workflow lo llama "Siembra (nombre de trabajo)".)*
- Qué rol cumple BAF dentro de la hackathon y qué apoyo ofrece.
- Validar con mentores la integración con Pollar y Vaquita (qué funciona en testnet).
- Datos de ejemplo para la demo: silo y campaña (valor, número de fracciones, hitos de trazabilidad). *(Definidos en [00-vision-y-alcance.md](00-vision-y-alcance.md).)*
- Criterios de evaluación del jurado, si los organizadores los publican.
