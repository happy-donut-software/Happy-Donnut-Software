# language: es
Característica: Registro de ventas para cálculo automático de vuelto
  Como cajero
  Quiero registrar cada venta
  Para que el cálculo del vuelto sea automático y reducir los errores humanos

  Escenario: Registrar venta válida y calcular vuelto correctamente
    Dado que el cajero tiene un producto con precio 15.00
    Y que el cliente paga 20.00
    Cuando el cajero registra la venta
    Entonces el sistema calcula el total de la venta como 15.00
    Y el sistema calcula el vuelto como 5.00
    Y la venta queda registrada en el sistema

  Escenario: Registrar venta con pago exacto y no hay vuelto
    Dado que el cajero tiene un producto con precio 50.00
    Y que el cliente paga 50.00
    Cuando el cajero registra la venta
    Entonces el sistema calcula el total de la venta como 50.00
    Y el sistema calcula el vuelto como 0.00
    Y la venta queda registrada en el sistema

  Escenario: Registrar venta con múltiples productos y calcular vuelto
    Dado que el cajero tiene un producto con precio 12.30
    Y que el cajero añade otro producto con precio 7.20
    Y que el cliente paga 25.00
    Cuando el cajero registra la venta
    Entonces el sistema calcula el total de la venta como 19.50
    Y el sistema calcula el vuelto como 5.50
    Y la venta queda registrada en el sistema

  Escenario: Registrar venta con pago insuficiente y mostrar excepción
    Dado que el cajero tiene un producto con precio 28.50
    Y que el cliente paga 25.00
    Cuando el cajero intenta registrar la venta
    Entonces el sistema rechaza el registro de la venta
    Y el sistema muestra un mensaje de "Pago insuficiente"
    Y no se registra la venta en el sistema

  Escenario: Registrar venta con pago cero y mostrar excepción
    Dado que el cajero tiene un producto con precio 10.00
    Y que el cliente paga 0.00
    Cuando el cajero intenta registrar la venta
    Entonces el sistema rechaza el registro de la venta
    Y el sistema muestra un mensaje de "Pago insuficiente"
    Y no se registra la venta en el sistema

  Escenario: Registrar venta con monto de pago inválido y mostrar error
    Dado que el cajero tiene un producto con precio 20.00
    Y que el cliente ingresa un pago inválido
    Cuando el cajero intenta registrar la venta
    Entonces el sistema rechaza el registro de la venta
    Y el sistema muestra un mensaje de "Pago inválido"
    Y no se registra la venta en el sistema

  Escenario: Registrar venta con producto no disponible y mostrar excepción
    Dado que el cajero intenta vender un producto no disponible
    Y que el cliente paga 30.00
    Cuando el cajero intenta registrar la venta
    Entonces el sistema rechaza el registro de la venta
    Y el sistema muestra un mensaje de "Producto no disponible"
    Y no se registra la venta en el sistema
