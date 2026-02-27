sequenceDiagram

Crear work order + reservar inventario + auditoría

  participant S as Sales
  participant W as Web
  participant API as API
  participant INV as Inventory
  participant AUD as Audit

  S->>W: Fill form and submit work order
  W->>API: POST /work-orders (Bearer, correlationId)
  API->>API: Validate input + RB
  API->>AUD: Write WORK_ORDER_CREATED
  API-->>W: 201 WorkOrder (SUBMITTED)

  W->>API: PATCH /work-orders/{id}/status (INVENTORY_RESERVATION, baseVersion)
  API->>API: Validate transition (state machine)
  API->>INV: Reserve requested products (atomic)
  alt Not enough stock
    INV-->>API: Conflict
    API->>AUD: Write INVENTORY_RESERVE_FAILED
    API-->>W: 409 ProblemDetails
  else Success
    INV-->>API: Reserved
    API->>AUD: Write INVENTORY_RESERVED
    API-->>W: 200 WorkOrder updated
  end
----------------------------------------------------------------------------------------

Técnico offline + export/import + conflicto

  sequenceDiagram
  participant T as Technician
  participant Web as Web Offline
  participant LS as LocalStorage
  participant API as API
  participant AUD as Audit

  T->>Web: Update status to VERIFICATION (offline)
  Web->>LS: Push OfflineOperation (baseVersion=3)

  T->>Web: Export offline changes
  Web->>LS: Read app.offline.queue
  Web-->>T: Download JSON export

  T->>Web: Import JSON (connected)
  Web->>API: POST /sync/import (Bearer)
  API->>API: Validate schema, apply ops with baseVersion checks
  alt Version mismatch
    API->>AUD: Write SYNC_IMPORTED with conflicts
    API-->>Web: 200 {conflicts[]}
  else Applied
    API->>AUD: Write WORK_ORDER_STATUS_CHANGED
    API-->>Web: 200 {appliedCount}
  end