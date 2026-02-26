# telecom-fieldops-capstone
This project is for student use

Proyecto: Telecom FieldOps Suite

URL Web: (pendiente)
URL API: (pendiente)
Swagger/OpenAPI: `apps/api/src/openapi/openapi.yaml`

## Cómo ejecutar local

**Backend API**
```bash
cd apps/api
npm install
npm run build
npm start
```
- Servidor en `http://localhost:3000` (o el valor de `PORT` si está definido).
- Health check: `GET http://localhost:3000/api/v1/health` → 200, cuerpo `ok`.

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
- **infra/app.ts**: configura Express (`express.json()`), monta las rutas bajo el prefijo `/api/v1`.
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