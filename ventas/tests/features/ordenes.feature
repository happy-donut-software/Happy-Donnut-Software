# language: es
Característica: Gestión de órdenes de venta
  Como cajero de Happy Donut
  Quiero registrar y pagar pedidos
  Para entregar donas a los clientes

  Escenario: Crear una orden pendiente
    Dado que el cliente "cli_001" solicita una orden
    Cuando agrega 2 donas de chocolate a 3.50 soles
    Entonces la orden queda en estado "pendiente"
    Y el total es 7.00 soles

  Escenario: Pagar una orden pendiente
    Dado que existe una orden pendiente
    Cuando el cliente paga la orden
    Entonces la orden queda en estado "pagada"
    Y se publica el evento "ventas.orden.pagada"

  Escenario: No se puede pagar dos veces la misma orden
    Dado que existe una orden ya pagada
    Cuando intento pagar la orden nuevamente
    Entonces recibo un error de negocio