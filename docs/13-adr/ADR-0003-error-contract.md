ADR-0003 Contrato de errores
Estado: Aprobado
Decisión:
Usar ProblemDetails para errores con correlationId obligatorio.
Motivo:
Depuración consistente, UX más clara, trazabilidad en logs y auditoría.

MODEL ERROR RESPONSE:

type: string
title: string
status: number
detail: string
instance: string
correlactionId: string
error?: object(campo, mensaje) 