# language: es
Característica: Gestión de inventario y disponibilidad de productos
  Como gerente de almacén
  Quiero controlar el inventario
  Para asegurar la disponibilidad de productos y evitar desabastecimiento

  Escenario: Registrar entrada de productos al inventario
    Dado que llega un pedido de reabastecimiento de 50 unidades de "Donut Glaseado"
    Y que el precio unitario es 8.00
    Y que la cantidad actual en inventario es 20
    Cuando el gerente registra la entrada al inventario
    Entonces la cantidad total de "Donut Glaseado" es ahora 70
    Y el sistema registra la entrada con fecha y hora
    Y se actualiza el historial de movimientos

  Escenario: Registrar salida de productos por venta
    Dado que existe un producto "Pastel de Chocolate" con cantidad 100
    Y que se realiza una venta de 5 unidades
    Cuando el sistema registra la salida del inventario
    Entonces la cantidad se reduce a 95
    Y el movimiento se vincula a la venta correspondiente
    Y se actualiza el estado del producto

  Escenario: Alerta cuando inventario alcanza nivel crítico
    Dado que existe un producto "Café Americano" con cantidad 5
    Y que el nivel crítico del producto es 10 unidades
    Cuando el sistema verifica el nivel de inventario
    Entonces el sistema genera una alerta
    Y el gerente recibe notificación de "Stock bajo: Café Americano"
    Y el producto aparece en la lista de reorden

  Escenario: Ajuste de inventario por pérdida o daño
    Dado que existe un producto "Croissant" con cantidad 80
    Y que se detectan 3 unidades dañadas
    Cuando el gerente registra un ajuste negativo de 3 unidades
    Entonces la cantidad del producto se reduce a 77
    Y se registra el motivo del ajuste como "Daño"
    Y la operación queda documentada en el historial
