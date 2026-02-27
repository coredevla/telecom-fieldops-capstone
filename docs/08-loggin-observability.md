Logs requeridos
- logs estructurados (json o key=value)
- correlationId por request (header X-Correlation-Id; si no viene, se genera)
- incluir userId cuando exista
- no loggear password/tokens

Ejemplo:
level=info correlationId=c_123 userId=usr_1 action=WORK_ORDER_CREATED workOrderId=wo_10