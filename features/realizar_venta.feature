# language: es
Característica: Realizar una venta física
  Como cajero quiero cobrar con exactitud para evitar pérdidas.

  Escenario: Cobro en efectivo con vuelto
    Dada una orden pendiente con total de 10 soles
    Cuando registro 20 soles en efectivo y selecciono BOLETA
    Entonces la venta queda pagada
    Y el vuelto es 10 soles
    Y la boleta queda marcada para el acumulado RUS

  Escenario: Rechazar efectivo insuficiente
    Dada una orden pendiente con total de 10 soles
    Cuando registro 5 soles en efectivo
    Entonces la operación se rechaza por monto insuficiente
    Y la orden permanece pendiente

  Esquema del escenario: Pago digital sin vuelto
    Dada una orden pendiente con total de 10 soles
    Cuando registro el método <metodo>
    Entonces la venta queda pagada y el vuelto es 0
    Ejemplos:
      | metodo |
      | YAPE   |
      | PLIN   |