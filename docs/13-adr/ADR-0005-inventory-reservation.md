ADR-0005 Reserva de inventario
Estado: Aprobado
Decisión:
Inventario maneja qtyAvailable y qtyReserved. Reservar es atómico. No se permite qtyAvailable negativo.
Motivo:
Evita sobreasignación de equipos.
Trade-offs:
Mayor complejidad que “descontar directo”, pero es más correcto.