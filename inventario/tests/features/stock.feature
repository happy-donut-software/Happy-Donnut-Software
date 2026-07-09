# language: es
Característica: Control de inventario
  Como administrador de Happy Donut
  Quiero reabastecer y descontar stock
  Para mantener el inventario actualizado

  Escenario: Reabastecer producto existente
    Dado que el producto "prod_donachoco" tiene stock inicial
    Cuando reabastezco 10 unidades
    Entonces el stock aumenta correctamente

  Escenario: Descontar stock por venta pagada
    Dado que el producto tiene stock suficiente
    Cuando llega el evento "ventas.orden.pagada"
    Entonces el stock se descuenta automáticamente