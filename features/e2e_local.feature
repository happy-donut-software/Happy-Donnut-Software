# language: es
Característica: Venta integrada entre contextos
  Como cajero quiero que una venta actualice Inventario y Finanzas sin intervención manual.

  Escenario: Venta con boleta propagada de extremo a extremo
    Dado que el ecosistema local de Happy Donut está disponible
    Y existe un producto de venta con stock
    Cuando realizo y pago una venta en efectivo con boleta
    Entonces el vuelto calculado es correcto
    Y el inventario descuenta la cantidad vendida
    Y Finanzas aumenta el acumulado RUS