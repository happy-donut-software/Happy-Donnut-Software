# language: es
Característica: Actualización automática del inventario
  Como administradora quiero que cada venta descuente existencias.

  Escenario: Descontar stock disponible
    Dado un producto con 10 unidades disponibles
    Cuando se procesa una VentaFinalizada con 4 unidades
    Entonces quedan 6 unidades

  Escenario: Emitir alerta de reabastecimiento
    Dado un producto con nivel mínimo de 5 unidades
    Cuando una venta deja 4 unidades
    Entonces se emite AlertaReabastecimientoEmitida una sola vez

  Escenario: Evitar stock negativo
    Dado un producto con 2 unidades disponibles
    Cuando una venta solicita descontar 3 unidades
    Entonces se rechaza con StockInsuficiente
    Y se mantienen 2 unidades