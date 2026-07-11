# language: es
Característica: Turno de caja
  Como cajero de Happy Donut
  Quiero abrir, registrar movimientos y cerrar la caja
  Para controlar el dinero del turno

  Escenario: Flujo completo de turno
    Dado que abro la caja con 100.00 soles
    Cuando registro una venta de 25.50 soles
    Y cierro la caja con 125.50 soles en efectivo
    Entonces el turno queda en estado "cerrado"

  Escenario: No se permiten dos turnos abiertos
    Dado que ya existe un turno abierto
    Cuando intento abrir otro turno
    Entonces recibo un error de negocio