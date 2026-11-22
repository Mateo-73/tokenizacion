# 10 — Seguridad y claves

Es una demo en **testnet**, pero un repo con claves o un admin abierto queda mal ante el jurado. Una página, léela antes de cada push.

## 1. Qué es sensible
| Qué | Dónde vive | Regla |
|---|---|---|
| Claves secretas Stellar (`S...`) de emisor, distribuidor, tesorería, USDC y cuentas demo | `api/.stellar-keys.json`, `api/data/db.json` | **Nunca** al repo, a prompts, a capturas ni a logs |
| `ADMIN_KEY` | `api/.env` | Larga y aleatoria; nunca el valor de ejemplo |
| Clave de Pollar u otros servicios | `web/.env` | No se commitea; si es pública por diseño, aun así va por variable de entorno |
| `.env` | Cada máquina | Solo se versiona `.env.example` (sin valores) |

## 2. `.gitignore` (verificar que exista **antes** del primer commit)
```
node_modules
.env
api/.env
web/.env
api/.stellar-keys.json
api/data/db.json
api/data/*.tmp
dist
.DS_Store
```

## 3. Revisión antes de subir o enviar
```bash
# ¿Algún archivo versionado contiene una clave secreta de Stellar? (empiezan con S y tienen 56 caracteres)
git grep -nE 'S[A-Z2-7]{55}' -- . ':!docs'
# ¿Alguna en el historial?
git log -p --all | grep -nE 'S[A-Z2-7]{55}'
# ¿Se versionó algún .env?
git ls-files | grep -E '(^|/)\.env$'
```
Si aparece algo: **no basta con borrarlo en un commit nuevo** (queda en el historial). Como es testnet, lo más rápido es regenerar todo (`rm api/.stellar-keys.json api/data/db.json`, `npm run setup:stellar`, `npm run seed`) y reescribir el historial o crear el repo limpio.

## 3b. Lo que se puede mostrar
Las claves **públicas** (`G...`) y los hashes de transacción son públicos por diseño. Son lo que se muestra en el explorador.

## 4. Backend
- CORS solo para `http://localhost:5173` (y el dominio de la demo si se despliega).
- `POST /distribute` y `POST /trace` exigen `x-admin-key`.
- No registrar cuerpos de petición ni secretos (ver `errorHandler` en docs/09).
- Validar todos los datos de entrada (docs/09 §12).
- `secret` del inversionista nunca sale en una respuesta de la API.

## 5. Frontend
- La clave de administrador se escribe en un campo y **no** se guarda en `localStorage`.
- No incluir secretos en el código del navegador: todo lo firmado con claves privadas ocurre en el backend.
- Almacenamiento del navegador siempre con `try/catch`.

## 6. Si se despliega públicamente
- Variables de entorno en la plataforma, nunca en el repo.
- Cambiar `ADMIN_KEY` por una nueva y larga.
- Considerar que `/admin` es accesible: proteger con la clave y no enlazarlo desde la navegación pública.
- Recordar que cualquiera puede crear inversionistas demo: limitar la cantidad si el despliegue es público (por ejemplo, un tope de cuentas en el servicio).

## 7. Con Claude Code
- No pegar claves secretas en los prompts. Si Claude necesita una, usar `process.env` o el archivo ignorado.
- Antes de aceptar un cambio grande, revisar que no haya agregado archivos con secretos al commit (`git status`).

## 8. Qué decir al jurado
"El prototipo corre en testnet. Los inversionistas demo son custodiales para la demostración; en producción cada usuario firmaría con su propia wallet (por ejemplo con Pollar) y habría KYC real y un vehículo legal que respalde los tokens."
