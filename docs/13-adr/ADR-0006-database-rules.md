

1. Exits command
npm run db:migrate
npm run db:seed

db:studio: prisma studio (local)

test: jest

start: node dist/main.js

2. Rules 

InventoryItem:

    qtyAvailable >= 0

    qtyReserved >= 0

Unique

    userName [unique]
    role.name [unique]
    permissionkey [unique]

Audit log: solo insert, update por code

3. Reserva de inventario atómica:

A) Transacción + update condicional

En una transacción:

lee el inventory row con lock o usa update con condición

si qtyAvailable >= qty, entonces qtyAvailable -= qty, qtyReserved += qty

si no, falla 409


B) Raw SQL dentro de Prisma para atomic update (válido y real)


Usar $executeRaw con prisma por código evitamos race conditions

4. Control de versiones para offline sync (baseVersion)


Cada WorkOrder debe tener version integer que incrementa en cada update.

Cuando importan offline:

si baseVersion != version actual, devuelven conflicto.


5. Seed data consistente y repetible

Seeding idempotente o limpio (pueden truncar en dev, pero debe ser claro).



tablas iniciales (base)


User(id, username, passwordHash, displayName, isActive, roles)

Role(id, name, permissions)

Permission(id, key)

Branch(id, name, isMain)

Plan(id, name, type, price, currency, isActive)

Product(id, name, category, isSerialized)

InventoryItem(id, branchId, productId, qtyAvailable, qtyReserved, updatedAt)

WorkOrder(id, type, status, customerId, branchId, planId?, assignedTechUserId?, version, createdAt, updatedAt)

WorkOrderItem(id, workOrderId, productId, qty)

WorkOrderNote(id, workOrderId, note, createdBy, createdAt) (sanitizar)

AuditEvent(id, at, actorUserId, action, entityType, entityId, beforeJson, afterJson, correlationId)

Customer(id, fullName, contactPhone?, hasActiveService?, createdAt)
y aplica regla RB-01: solo se considera cliente si tiene historial de compra/servicio.