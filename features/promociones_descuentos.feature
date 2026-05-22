# language: es
Característica: Gestión de promociones y descuentos
  Como administrador
  Quiero crear promociones y descuentos
  Para atraer y fidelizar a más clientes

  Escenario: Crear promoción válida con descuento porcentual
    Dado que el administrador tiene acceso al módulo de promociones
    Y ingresa una promoción con nombre "Descuento Primavera"
    Y establece un descuento del 20% para productos seleccionados
    Y define la fecha de inicio y fin válidas
    Cuando guarda la promoción
    Entonces el sistema crea la promoción
    Y la promoción queda activa en el periodo definido

  Escenario: Crear promoción válida con descuento fijo
    Dado que el administrador quiere crear un descuento fijo
    Y establece un descuento de 5.00 en compras mayores a 30.00
    Y configura la promoción como válida para todos los clientes
    Cuando guarda la promoción
    Entonces el sistema registra la promoción con descuento fijo
    Y se puede aplicar en el punto de venta

  Escenario: Crear promoción con condiciones de fidelización
    Dado que el administrador configura una promoción para clientes frecuentes
    Y define "10% de descuento" para clientes con 3 compras previas
    Cuando guarda la promoción
    Entonces el sistema crea la promoción de fidelización
    Y solo los clientes elegibles pueden usarla

  Escenario: Rechazar creación de promoción con fechas inválidas
    Dado que el administrador ingresa una promoción con fecha de fin anterior a la fecha de inicio
    Cuando intenta guardar la promoción
    Entonces el sistema rechaza la creación
    Y muestra un mensaje de "Fechas de promoción inválidas"

  Escenario: Rechazar promoción con descuento inválido
    Dado que el administrador ingresa una promoción con descuento de -10%
    Cuando intenta guardar la promoción
    Entonces el sistema rechaza la creación
    Y muestra un mensaje de "Descuento inválido"

  Escenario: Evitar promociones duplicadas
    Dado que ya existe una promoción con nombre "Oferta Verano"
    Cuando el administrador intenta crear otra promoción con el mismo nombre
    Entonces el sistema rechaza la creación
    Y muestra un mensaje de "Nombre de promoción ya en uso"

  Escenario: Aplicar promoción vigente en venta
    Dado que existe una promoción activa "Descuento Primavera" del 20%
    Y el cliente compra un producto elegible por 50.00
    Cuando el cajero aplica la promoción al registro de venta
    Entonces el sistema calcula el total con descuento aplicado
    Y muestra el nuevo total y el ahorro del cliente
