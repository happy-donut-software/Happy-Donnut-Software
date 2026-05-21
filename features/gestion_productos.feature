# language: es
Característica: Gestión de productos en el catálogo
  Como administrador
  Quiero gestionar los productos del catálogo
  Para mantener actualizado el inventario y disponibilidad de artículos

  Escenario: Crear un producto nuevo exitosamente
    Dado que el administrador desea crear un nuevo producto
    Y que proporciona el nombre "Pastel de Chocolate"
    Y que proporciona el precio 25.50
    Y que proporciona la cantidad inicial 100
    Cuando el administrador crea el producto
    Entonces el producto se registra en el sistema
    Y el producto aparece en el catálogo
    Y el estado del producto es "Activo"

  Escenario: Crear producto sin precio inicial muestra error
    Dado que el administrador desea crear un nuevo producto
    Y que proporciona el nombre "Donut Glaseado"
    Y que proporciona el precio 8.00
    Y que no proporciona el precio inicial
    Cuando el administrador intenta crear el producto
    Entonces el sistema rechaza la creación del producto
    Y el sistema muestra un mensaje de "Cantidad inicial requerida"
    Y el producto no se registra en el sistema

  Escenario: Actualizar precio de un producto existente
    Dado que existe un producto "Café Americano" con precio 12.00
    Y que el administrador desea actualizar el precio
    Cuando el administrador actualiza el precio a 13.50
    Entonces el sistema registra el cambio de precio
    Y el nuevo precio es 13.50
    Y el producto mantiene su disponibilidad

  Escenario: Desactivar producto no disponible
    Dado que existe un producto "Donut Relleno" con estado "Activo"
    Y que la cantidad en inventario es 0
    Cuando el administrador desactiva el producto
    Entonces el producto cambia su estado a "Inactivo"
    Y el producto no aparece en las ventas
    Y el sistema registra la fecha de desactivación
