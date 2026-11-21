# 13 — Testing y QA

Responsable: **Diego** (con apoyo de todos). Se recorre cada vez que se integra algo.

## 1. Preparación (máquina limpia)
```bash
git clone <repo> && cd siembra
cd api && npm i && cp .env.example .env     # completar ADMIN_KEY
npm run setup:stellar && npm run seed
npm run dev                                  # terminal 1
cd ../web && npm i && cp .env.example .env   # VITE_USE_MOCKS=false
npm run dev                                  # terminal 2
```
Prueba automática de la API: `cd api && npm run test:flow` → debe terminar con `FLUJO OK`.

## 2. Flujo principal A → E (marcar cada paso)
**A. Entrar y verificar**
- [ ] Botón de entrar crea un inversionista demo y muestra su nombre.
- [ ] En un activo, "Verificar identidad" funciona y muestra el sello con enlace al explorador.
- [ ] Verificar dos veces no rompe nada.

**B. Comprar**
- [ ] El total en USDC se actualiza al cambiar la cantidad.
- [ ] Comprar 10 fracciones de `SILO01` confirma con enlace; en el explorador se ven los dos pagos en una sola transacción.
- [ ] `availableFractions` baja en el catálogo.

**C. Portafolio**
- [ ] Muestra las fracciones compradas, el valor y el USDC restante (1000 − 500 = 500 en el ejemplo).

**D. Retornos (admin)**
- [ ] Con la clave correcta, repartir 2.000 USDC de `SILO01` paga a cada tenedor en proporción a sus fracciones sobre el total (10 de 1.000 → 20 USDC).
- [ ] El retorno aparece en el portafolio con enlace.
- [ ] Sin la clave o con una incorrecta: mensaje claro.

**E. Trazabilidad**
- [ ] La ficha muestra la línea de tiempo con sello "Verificado en Stellar".
- [ ] Agregar un hito desde admin lo hace aparecer con hash.
- [ ] El hash existe en la cuenta emisora (explorador → datos de la cuenta).

## 3. Casos de error (deben dar un mensaje en español, sin pantalla en blanco)
- [ ] Comprar sin verificar → "Primero verifica tu identidad…".
- [ ] Comprar más fracciones de las disponibles.
- [ ] Comprar sin USDC suficiente.
- [ ] Cantidad 0, negativa o decimal.
- [ ] API apagada → mensaje de conexión con "Reintentar".
- [ ] Doble clic rápido en "Comprar" → una sola compra.

## 4. Calidad visual
- [ ] Móvil (≈ 390 px) y escritorio sin desbordes.
- [ ] Todos los datos simulados llevan "Datos de ejemplo".
- [ ] Ningún texto promete rendimiento garantizado.
- [ ] Estados de carga, vacío y error presentes.

## 5. Reporte de bugs (al grupo)
```
[GRAVEDAD] Título corto
Pasos: 1) … 2) … 3) …
Esperado: …
Real: …
Captura / mensaje de consola: …
```
Gravedad: **BLOQUEA** (rompe la demo) · **MOLESTA** · **COSMÉTICO**. Los BLOQUEA se cierran antes del congelamiento (21 nov, 21:00).

## 6. Antes de enviar (22 nov)
- [ ] Prueba completa en una máquina limpia siguiendo solo el README.
- [ ] `npm run test:flow` en verde.
- [ ] Revisión de secretos (docs/10 §3) sin hallazgos.
- [ ] Video final probado en otro dispositivo.
- [ ] Textos del formulario con el conteo de caracteres correcto.

## 7. Ensayo de la demo
- [ ] Cronometrar el guion de docs/06 (≈ 2 minutos) tres veces.
- [ ] Cuenta demo ya autorizada y con compras hechas como respaldo.
- [ ] Video grabado del flujo completo como plan B si falla la red.
- [ ] Internet de respaldo (datos del celular) probado.
