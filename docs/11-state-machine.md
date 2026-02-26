Tipos de solicitudes.


NEW_SERVICE_INSTALL: nuevo servicio hogar/empresa

CLAIM_TROUBLESHOOT: reclamación/falla

PLAN_AND_EQUIPMENT_SALE: venta con plan + equipo (puede terminar en instalación o entrega)

EQUIPMENT_ONLY_SALE: venta solo de equipo

MONTHLY_PAYMENT: pago mensual de servicio

SERVICE_UPGRADE: upgrade de plan (puede requerir cambio de equipo)

EQUIPMENT_REPLACEMENT: cambio de modem/ONT por avería/reclamación

SERVICE_DOWN_OUTAGE: incidencia masiva por zona (ticket de zona)

SIM_REPLACEMENT: reemplazo de SIM / cambio de línea


ESTADOS COMUNES


DRAFT (creada internamente, editable)

SUBMITTED (enviada para procesar)

IN_REVIEW (validación general y datos)

ON_HOLD (pendiente por cliente o por falta de stock)

REJECTED (rechazada por elegibilidad/pago/etc.)

CANCELLED (cancelada por cliente/empresa)

CONFLICT (estado técnico usado cuando import offline choca con server)
--------------------------------------------------------------------

ESTADOS BASES


DRAFT: borrador

SUBMITTED: enviada

IN_REVIEW: revisión general (datos y consistencia)

ELIGIBILITY_CHECK: depuración persona/cobertura/validación

INVENTORY_RESERVATION: reserva de equipos

SCHEDULED: agenda instalada o entrega

IN_PROGRESS: trabajo en proceso

VERIFICATION: pruebas/confirmación

COMPLETED: cerrado exitoso

ON_HOLD: esperando cliente/stock

REJECTED: rechazado

CANCELLED: cancelado

CONFLICT: conflicto por sync/offline



Regla común

No se permite ir a COMPLETED sin pasar por VERIFICATION, excepto MONTHLY_PAYMENT (que puede cerrar tras validación de pago).


ESTADOS POR PROCESO

1. NEW_SERVICE_INSTALL (nuevo servicio)

    DRAFT

    SUBMITTED

    ELIGIBILITY_CHECK (depuración de persona, cobertura, crédito)

    INVENTORY_RESERVATION (router/modem/ONT/cables)

    SCHEDULED (fecha asignada)

    IN_PROGRESS (técnico en campo)

    VERIFICATION (pruebas de señal/velocidad)

    COMPLETED


Transaciones principales

    DRAFT -> SUBMITTED

    SUBMITTED -> ELIGIBILITY_CHECK

    ELIGIBILITY_CHECK -> INVENTORY_RESERVATION (si aprueba)

    INVENTORY_RESERVATION -> SCHEDULED (si hay stock)

    SCHEDULED -> IN_PROGRESS

    IN_PROGRESS -> VERIFICATION

    VERIFICATION -> COMPLETED

    Cualquier estado antes de COMPLETED -> CANCELLED (con reglas)

    INVENTORY_RESERVATION -> ON_HOLD (si no hay stock)

    ON_HOLD -> INVENTORY_RESERVATION (cuando se repone stock)


    OTRAS 

    ELIGIBILITY_CHECK -> REJECTED

    INVENTORY_RESERVATION -> ON_HOLD (sin stock)

    ON_HOLD -> INVENTORY_RESERVATION (cuando hay stock)

    cualquier estado antes de COMPLETED -> CANCELLED (con motivo)

    sync offline conflict -> CONFLICT (si baseVersion mismatch)


2. CLAIM_TROUBLESHOOT (reclamación)

    DRAFT

    SUBMITTED

    TRIAGE (levantamiento: síntoma, zona, prioridad)

    TECH_ASSIGNMENT (asignación técnica)

    IN_PROGRESS

    VERIFICATION

    COMPLETED (reclamación cerrada)




Transiciones

DRAFT -> SUBMITTED

SUBMITTED -> IN_REVIEW

IN_REVIEW -> TECH_ASSIGNMENT

TECH_ASSIGNMENT -> IN_PROGRESS

IN_PROGRESS -> VERIFICATION

VERIFICATION -> COMPLETED

IN_REVIEW -> ON_HOLD (si requiere información del cliente)

IN_PROGRESS -> INVENTORY_RESERVATION (si requiere reemplazo de equipo)

INVENTORY_RESERVATION -> IN_PROGRESS (cuando equipo está listo)



OTRAS:

    IN_REVIEW -> ON_HOLD (requiere info del cliente)

    IN_PROGRESS -> INVENTORY_RESERVATION (si requiere reemplazo de equipo)

    INVENTORY_RESERVATION -> IN_PROGRESS

    sync conflict -> CONFLICT


3. PLAN_AND_EQUIPMENT_SALE (venta con plan)
Este caso puede bifurcar:

si es plan móvil + SIM: no requiere instalación

si es hogar: cae en instalación



Estados:

DRAFT

SUBMITTED

ELIGIBILITY_CHECK

PRODUCT_SELECTION (plan + equipo)

PAYMENT_CONFIRMATION (si aplica)

FULFILLMENT (entrega o instalación)

VERIFICATION

COMPLETED

------
Fulfillment puede ir a:

DELIVERY (entrega de equipo en sucursal) o

SCHEDULED/IN_PROGRESS (instalación)

Donde SCHEDULED representa:

DELIVERY (entrega en sucursal) o

instalación (si el plan es hogar/empresa y requiere visita)
Ramas:

ELIGIBILITY_CHECK -> REJECTED

INVENTORY_RESERVATION -> ON_HOLD


4. EQUIPMENT_ONLY_SALE (venta solo equipo)

DRAFT

SUBMITTED

INVENTORY_RESERVATION

PAYMENT_CONFIRMATION

DELIVERY

COMPLETED


5. MONTHLY_PAYMENT (pago)

DRAFT

SUBMITTED

PAYMENT_VALIDATION

RECEIPT_ISSUED

COMPLETED
Errores:

PAYMENT_VALIDATION -> REJECTED (pago inválido)


6. SERVICE_UPGRADE (upgrade)

DRAFT

SUBMITTED

ELIGIBILITY_CHECK

PLAN_CHANGE

INVENTORY_RESERVATION (si requiere equipo nuevo)

SCHEDULED (si requiere visita)

IN_PROGRESS

VERIFICATION

COMPLETED


7. SERVICE_DOWN_OUTAGE (avería por zona)

DRAFT

SUBMITTED

TRIAGE

FIELD_DISPATCH (cuadrilla)

IN_PROGRESS

VERIFICATION

COMPLETED
Notas:

aquí el “cliente” puede ser una zona/sector, no individuo. Se reporta impacto.


reglas RB asociadas (ej: no pasar a COMPLETED sin VERIFICATION)