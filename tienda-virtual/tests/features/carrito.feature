# language: es
Característica: Carrito de compras online
  Como cliente de la tienda virtual
  Quiero agregar y quitar productos del carrito
  Para preparar mi pedido online

  Escenario: Agregar producto al carrito
    Dado que el cliente "cli_web_01" tiene un carrito vacío
    Cuando agrega 2 donas de chocolate a 3.50 soles
    Entonces el total estimado es 7.00 soles

  Escenario: Remover producto del carrito
    Dado que el carrito tiene productos
    Cuando remuevo un producto
    Entonces el total estimado se actualiza