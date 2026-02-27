Objetivo del PR
- 

Tipo de cambio
- [ ] feat (nueva funcionalidad)
- [ ] fix (bug)
- [ ] docs
- [ ] test
- [ ] refactor
- [ ] chore (config/build)

Referencia a documentación
- RF relacionados: 
- RNF relacionados: 
- RB relacionadas: 
- Edge cases impactados: 
- ADR (si aplica): docs/13-adr/ADR-____.md

OpenAPI / API First
- [ ] Actualicé apps/api/src/openapi/openapi.yaml si este PR cambia endpoints, request/response o modelos
- [ ] El endpoint(s) implementado(s) están documentados con:
  - [ ] status codes correctos (200/201/400/401/403/404/409/429)
  - [ ] ejemplos mínimos (request y response) cuando aplica
- [ ] Mantengo el versionado /api/v1 (no endpoints sin versión)

Seguridad por código
- Input validation
  - [ ] Validé inputs con schema (validate middleware o equivalente)
  - [ ] Respondo 400 con ProblemDetails si falla validación
- Auth/RBAC
  - [ ] El endpoint está protegido con auth (Bearer) si aplica
  - [ ] Verifiqué permisos con RBAC (permiso por endpoint)
  - [ ] Si toca usuarios: bloqueo o invalidación de sesión funciona
- Anti-DoS (rate limit)
  - [ ] Apliqué rate limiting si es login o endpoint crítico (crear work order, sync import, etc.)
  - [ ] Devuelve 429 con ProblemDetails al exceder límite
- XSS / sanitización
  - [ ] Sanitizo campos textuales renderizables (notes, comments) o aseguro escape seguro en UI
- SQL/DB safety (Prisma/Postgres)
  - [ ] Uso Prisma client (o queries parametrizadas si hay raw SQL)
  - [ ] No concateno strings en queries
- File safety (si aplica)
  - [ ] Validé extensión + mimetype
  - [ ] Validé tamaño máximo
  - [ ] Rechazo doble extensión (ej: .jpg.exe)
- Dependencies
  - [ ] No agregué librerías innecesarias
  - [ ] Si agregué dependencias, justifico por qué en este PR

Errores, logs y auditoría
- Manejo de errores
  - [ ] Los errores siguen el contrato ProblemDetails
  - [ ] No expongo stack traces ni secretos al cliente
- Logs
  - [ ] Incluí correlationId en logs (propagado desde middleware)
  - [ ] No loggeo password/tokens/PII sensible
- Auditoría
  - [ ] Emití audit event para acciones críticas (create/update/status/reserve/release/block/sync)
  - [ ] Audit incluye actor, timestamp, entidad y before/after (cuando aplica)

Offline / cache (si aplica)
- [ ] Cambios offline se guardan en LocalStorage bajo las keys estándar
- [ ] Si toca sync: uso baseVersion y manejo conflictos (no pisa datos silenciosamente)
- [ ] Cache tiene TTL y reglas de invalidación (cuando aplica)
- [ ] Export/Import JSON cumple el formato definido en docs

Pruebas
- [ ] Agregué o actualicé tests
- [ ] Hay al menos 1 test por RF tocado por este PR
- [ ] Si toco reglas RB críticas, hay test que las valida (ej: no stock negativo, transición inválida, usuario bloqueado)
- [ ] Incluí al menos 1 prueba de integración cuando corresponde (Supertest recomendado)

Migraciones/DB (si aplica)
- [ ] Actualicé prisma/schema.prisma si aplica
- [ ] Generé migración (prisma migrate) y la incluí en el PR
- [ ] Seed/fixtures actualizados si es necesario

No assets externos
- [ ] No usé links a imágenes/recursos externos en la app
- [ ] Todo asset nuevo está dentro de apps/web/public/assets o equivalente

Cómo probar (pasos exactos)
1) 
2) 
3) 

Capturas / evidencia (opcional pero recomendado)
- [ ] Adjunté screenshot o gif si es cambio de UI
- [ ] Adjunté output de endpoints (Swagger/Postman) si aplica

Trade-offs y riesgos
- Trade-offs:
  - 
- Riesgos:
  - 
- Mitigación:
  - 