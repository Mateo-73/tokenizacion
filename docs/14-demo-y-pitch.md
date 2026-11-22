# 14 — Demo y pitch

Responsable: **Diego** (con Rafa para el diseño del deck). Todo el contenido está listo para pegar; ajustar solo si cambia el nombre ("Siembra" es de trabajo) o si se **recortan funciones** (ver sección 1).

## 1. Antes de pegar: coherencia con lo construido
Los textos mencionan **reventa en el DEX** y **entrada con Pollar**. Si esas funciones se recortan (docs/11 §10), **quitar esas frases** de los textos antes de enviar. El jurado prueba lo que prometes.

## 2. Textos del formulario (por caracteres)

### Pitch corto (114 caracteres, máx. 120)
Siembra: el campo cruceño abierto al mundo. Inversión fraccionada en USDC con trazabilidad verificable en Stellar.

### Descripción corta (531 caracteres, máx. 600)
Siembra es una plataforma sobre Stellar que tokeniza activos del campo cruceño, como silos, almacenes y campañas de cosecha. Inversionistas de cualquier lugar compran fracciones en USDC con wallets autorizadas y las revenden en el DEX de Stellar. El productor accede a financiamiento sin depender solo de la banca, y los retornos se reparten en USDC. Cada campaña registra sus hitos (siembra, cosecha, venta) con hash en Stellar para que el inversionista verifique. Pollar permite entrar con Google o email, sin experiencia cripto.

### Problema (542 caracteres, máx. 600)
Santa Cruz es el motor agrícola de Bolivia, pero producir sigue dependiendo en gran parte de la banca tradicional. Los activos del campo, como silos, almacenes y campañas de cosecha, son difíciles de fraccionar y de vender, y casi nadie fuera de la región puede invertir en ellos. Además, quien aporta capital rara vez puede verificar qué pasa con su dinero durante la campaña. Resultado: productores con poco acceso a financiamiento, inversionistas sin acceso al campo cruceño y una falta de transparencia que frena la confianza entre ambos.

### Solución (567 caracteres, máx. 600)
Siembra tokeniza silos, almacenes y campañas de cosecha del campo cruceño como assets en Stellar. Los inversionistas compran fracciones en USDC con wallets autorizadas y las revenden en el DEX, sin exchange propio. El productor obtiene financiamiento sin depender solo de la banca y los retornos se reparten en USDC. Cada campaña publica sus hitos (siembra, cosecha, venta) con hash en Stellar, así el inversionista verifica en vez de confiar. Con Pollar se entra con Google o email, sin experiencia cripto. Así conectamos el capital global con el agro de Santa Cruz.

### Validación (374 caracteres, máx. 400)
Validación de mercado: RedSwan se asoció con Stellar para tokenizar USD 100M en inmuebles comerciales, lo que prueba la demanda. Bolivia recibió más de USD 1.200M en remesas en 2025 y Santa Cruz lidera su recepción. La CAO agrupa 70.000 productores. La trazabilidad agrícola es un problema priorizado por esta hackathon. Próximo paso: validar con productores de ANAPO y CAO.

Si Diego logra una conversación real (docs/11 D7), reemplazar la última frase por algo como: "Conversamos con X, quien confirmó Y."

### Clientes potenciales (266 caracteres)
Oferta: 70.000 productores asociados a la CAO (unos 21.000 medianos y grandes) y cientos de empresas y agentes inmobiliarios en Santa Cruz. Demanda: bolivianos en el exterior (remesas por más de USD 1.200M al año), empresarios cruceños e inversionistas de la región.

Fuentes y alcance: los 70.000 son productores asociados a la CAO (70% pequeños, 24% medianos, 6% grandes); los 21.000 son un cálculo propio (30%), no un dato oficial. Remesas: más de USD 1.200 millones en 2025 (BCB; otra fuente da 1.231 millones); en enero a mayo de 2026 Santa Cruz concentró más de la mitad. Preséntalos como mercado potencial, no como clientes esperados.

## 3. Textos del formulario (por palabras)

### Pitch (114 palabras, máx. 120)
Santa Cruz alimenta al mundo, pero el capital para producir sigue dependiendo de pocas puertas. Siembra abre esa puerta. Es una plataforma sobre Stellar que tokeniza activos del campo cruceño: silos, almacenes y campañas de cosecha. Cualquier inversionista del mundo compra fracciones en USDC, y el productor recibe financiamiento sin depender solo de la banca. Cada campaña tiene trazabilidad: siembra, cosecha y venta quedan registradas en Stellar, verificables por todos. Los retornos se reparten en USDC. Usamos assets de Stellar con wallets autorizadas, el DEX para reventa y Pollar para que entrar sea tan fácil como iniciar sesión con Google. Santa Cruz produce para el mundo; ahora el mundo puede invertir en Santa Cruz.

### Descripción (512 palabras, máx. 600)
Siembra es una plataforma web construida sobre Stellar que permite tokenizar activos inmobiliarios y agroindustriales de Santa Cruz, Bolivia, para que inversionistas de cualquier lugar compren fracciones y reciban retornos en USDC.

El problema
Santa Cruz es el motor agrícola de Bolivia, pero el financiamiento para producir depende en gran parte de la banca tradicional. Al mismo tiempo, activos valiosos como silos, galpones y almacenes son difíciles de fraccionar y de vender, y casi nadie fuera de la región puede invertir en ellos. Además, quien aporta capital rara vez puede verificar qué ocurre con su inversión durante la campaña.

La solución
Siembra convierte esos activos en tokens sobre la red Stellar. Cada activo se emite como un asset con un número definido de fracciones. Solo las wallets verificadas pueden poseerlo, gracias a los flags de autorización de Stellar, lo que prepara el camino para cumplir requisitos de identificación de inversionistas. Los inversionistas compran fracciones pagando en USDC, reciben el token en su wallet y pueden revenderlo a otros usuarios en el DEX nativo de Stellar, sin que tengamos que construir un exchange propio.

Dos verticales, un mismo motor
El vertical agro incluye infraestructura agroindustrial, como silos y almacenes que generan renta por almacenaje, y campañas de cosecha donde el retorno se reparte al vender la producción. El vertical urbano aplica el mismo motor a departamentos y locales comerciales. Para la hackathon construimos el flujo completo del vertical agro; el urbano queda en el roadmap.

Trazabilidad verificable
Cada campaña o silo tiene una línea de tiempo de hitos: siembra, insumos, cosecha, almacenaje y venta. El hash de cada hito se registra en Stellar, de modo que el inversionista puede comprobar que la información no fue alterada. Esto responde a un problema real del sector: la falta de transparencia entre quien produce y quien financia.

Experiencia de usuario
Usamos Pollar para que ingresar sea tan simple como iniciar sesión con Google o email, con una wallet Stellar lista para usar. Esto es clave para productores y empresarios sin experiencia en criptomonedas. El frontend en React muestra el catálogo, la ficha de cada activo, el portafolio del inversionista y los retornos recibidos.

Qué demostramos
La demo corre en la testnet de Stellar con datos de ejemplo simulados (una campaña y un silo): conectar la wallet, ser autorizado, comprar fracciones en USDC, ver el token en el portafolio, consultar la trazabilidad y recibir el reparto de retornos.

Diferenciación
Plataformas como RedSwan ya tokenizan inmuebles comerciales en Estados Unidos sobre Stellar, orientadas a inversionistas calificados. Siembra se enfoca en Latinoamérica, en montos pequeños de entrada y en el agro boliviano, un sector que esas plataformas no atienden.

Camino a futuro
Validar el marco legal boliviano con un socio especializado, respaldar los derechos de cada token mediante un vehículo legal, integrar rampas locales de entrada y salida de dinero, explorar ahorro con Vaquita y aplicar al Stellar Community Fund para pasar de prototipo a producto.

Siembra busca que el campo cruceño sea el primero en demostrar cómo la tokenización puede traer financiamiento y transparencia al agro de Bolivia.

## 4. Guion de la demo en video (≈ 2 minutos)
Sigue el guion de `docs/06` (sección "Guion de demo"). Reglas del video:
- Decir en voz alta "datos de ejemplo" al mostrar el catálogo.
- Mostrar **una** transacción en el explorador (la compra) y el sello "Verificado en Stellar".
- StellarExpert muestra la hora en **UTC** y no tiene selector de zona horaria: Bolivia es **UTC-4**, así que hay que restarle 4 horas en la narración (ej. `17:05 UTC` → `13:05` hora de Bolivia). El hash no se puede renombrar, pero las transacciones nuevas llevan un **memo** legible (`SIEMBRA COMPRA SILO01 1x`, `SIEMBRA HITO ...`) que el explorador muestra como etiqueta.
- Mostrar el reparto de retornos reflejado en el portafolio.
- Grabar en pantalla completa, voz clara, sin música alta. Subtítulos si es posible.
- Hacer una versión de respaldo y subirla en un enlace que funcione sin iniciar sesión.

## 5. Pitch de la final (≈ 3 minutos, 27 nov en Santa Cruz)
| Tiempo | Qué decir |
|---|---|
| 0:00 – 0:20 | **Gancho:** "Santa Cruz alimenta al mundo. Pero el capital para producir sigue dependiendo de pocas puertas." |
| 0:20 – 0:45 | **Problema:** financiamiento concentrado en la banca; activos del campo ilíquidos; el que invierte no puede verificar. |
| 0:45 – 2:00 | **Solución + demo en vivo:** entrar, verificar identidad, comprar fracciones, ver la transacción, ver la trazabilidad, repartir un retorno. Decir qué es simulado. |
| 2:00 – 2:25 | **Por qué Stellar:** pagos baratos y rápidos, USDC, assets con autorización (control de quién invierte) y un mercado nativo para reventa. |
| 2:25 – 2:45 | **Mercado y diferenciación:** remesas, productores de la CAO; RedSwan valida el modelo en EE.UU., nosotros vamos a Latinoamérica, montos pequeños y agro. |
| 2:45 – 3:00 | **Cierre y pedido:** "Santa Cruz produce para el mundo; ahora el mundo puede invertir en Santa Cruz." Próximo paso: piloto con un productor y respaldo legal. |

Plan B si falla la red: video de respaldo y cuenta demo ya autorizada con compras hechas.

## 6. Preguntas probables del jurado (respuestas honestas)
| Pregunta | Respuesta |
|---|---|
| ¿Qué respalda legalmente al token? | Hoy es un prototipo y no hay respaldo legal. El plan es que el token represente participación en un vehículo legal (fideicomiso o SPV) con un socio legal; el marco boliviano para activos digitales está por validar. |
| ¿En qué se diferencian de RedSwan? | RedSwan tokeniza inmuebles comerciales en EE.UU. para inversionistas calificados. Nosotros: Latinoamérica, montos pequeños y agro, que no cubren; con trazabilidad verificable. |
| ¿Por qué Stellar? | Pagos baratos y rápidos, USDC, flags de autorización por asset (control de quién puede tener el token), DEX nativo y ecosistema en Bolivia. |
| ¿Los retornos son reales? | No: son simulados en la demo. Los datos de producción también. Está etiquetado así en la interfaz. |
| ¿Y el riesgo de clima, precios o impago? | Es el riesgo real del negocio agro. Mitigación a desarrollar: verificación del productor, reserva o seguro y trazabilidad para el inversionista. No prometemos rendimientos. |
| ¿Cómo manejan el KYC? | Simulado en el prototipo. La autorización por asset de Stellar permite exigirlo; en producción se integraría un proveedor de KYC. |
| ¿Quién custodia las claves? | En la demo, cuentas custodiales de prueba en testnet. En producción, cada usuario firma con su wallet (por ejemplo vía Pollar). |
| ¿Por qué un productor grande lo usaría? | Capital en dólares de inversionistas de cualquier lugar sin depender solo de la banca, liquidez sobre activos y credibilidad por la trazabilidad. Pendiente validarlo con productores. |
| ¿Cómo ganan dinero? | Comisión por emisión y por transacción, y servicio de trazabilidad (docs/15). Son hipótesis. |
| ¿Qué sigue? | Piloto con un productor, respaldo legal, KYC real, rampas de entrada y salida locales y aplicación al Stellar Community Fund. |

## 7. Deck (5–7 diapositivas)
1 Problema · 2 Solución · 3 Demo y por qué Stellar · 4 Mercado · 5 Diferenciación y validación · 6 Roadmap y pedido. Máximo 25 palabras por diapositiva, capturas reales de la app, tono sobrio y orgulloso de Santa Cruz.

## 8. Reglas del discurso
- No decir "primero en Bolivia" ni "rentabilidad garantizada".
- Decir "prototipo en testnet" y "datos de ejemplo" sin que lo pregunten.
- Una sola idea por frase; sin jerga cripto con empresarios.
