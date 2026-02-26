# telecom-fieldops-capstone
This project is for student use

Proyecto: Telecom FieldOps Suite

URL Web: (pendiente)
URL API: https://telecom-fieldops-capstone-production.up.railway.app
- Health en producción: https://telecom-fieldops-capstone-production.up.railway.app/api/v1/health

Swagger/OpenAPI: `apps/api/src/openapi/openapi.yaml`

## Variables de entorno

El archivo `.env` **no está en el repo** (está en `.gitignore` para no subir secretos ni config local). Para desarrollo local hay que **crearlo**:

1. En `apps/api`, copiar la plantilla: `cp .env.example .env`
2. Editar `.env` si quieres cambiar valores (por defecto vale para local).
3. **No subir `.env` a Git.** En producción (Railway) las variables se configuran en el panel del servicio.

## Cómo ejecutar local

**Backend API**
```bash
cd apps/api
cp .env.example .env   
npm install
npm run build
npm start
```
- Servidor en `http://localhost:3000` (o el valor de `PORT` si está definido).
- Health check: `GET http://localhost:3000/api/v1/health` → 200, cuerpo `ok`.
- **CORS**: En local funcionan `http://localhost:5173` y `http://localhost:3000`. En producción (Railway) definir `FRONTEND_URL` y `API_PUBLIC_URL` (sin barra final) para el front y la URL del API (Swagger).

**Si CORS da problemas** (ej. error de módulo `cors` o tipos): asegúrate de instalar dependencias dentro de `apps/api`:
```bash
cd apps/api
npm install
```
Eso instala `cors`, `dotenv`, `@types/cors` y el resto. Si algo falla, reinstalar (en Git Bash o WSL: `rm -rf node_modules package-lock.json`; en PowerShell: `Remove-Item -Recurse -Force node_modules; Remove-Item package-lock.json`; luego `npm install`).

**Desarrollo con recarga**
```bash
cd apps/api
npm run dev
```

## Cómo correr tests
(pendiente)

## Arquitectura

**Backend (apps/api)**
- **main.ts**: punto de entrada; solo importa la app desde infra y ejecuta `listen`.
- **infra/app.ts**: configura Express (CORS, `express.json()`), monta las rutas bajo el prefijo `/api/v1`.
- **infra/routes/**: definición de endpoints por recurso.
  - **index.ts**: agrupa los routers (p. ej. health).
  - **health.ts**: `GET /health` (sin autenticación, según OpenAPI).
- Contrato API: `apps/api/src/openapi/openapi.yaml` (OpenAPI 3.1).

Decisiones (ADRs): `docs/13-adr/`
Seguridad implementada: (pendiente auth, rate limit, sanitización)
Auditoría: (pendiente)
Offline (LocalStorage + export/import): (pendiente)
KPIs: (pendiente)
Mapa Endpoint -> RF: (pendiente)
Cómo hacer un PR: usar la plantilla en `.github/PULL_REQUEST_TMP.md` y rellenar objetivo, RF/RB, cambios, cómo probar.