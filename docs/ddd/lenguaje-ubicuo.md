# Glosario de lenguaje ubicuo

| Término del negocio | Significado | Representación exacta |
|---|---|---|
| Venta | Transacción física desde selección hasta entrega | `ventas/app/Dominio/Agregados/OrdenVenta.php` |
| Línea de orden | Producto, cantidad y precio congelado en la venta | `ventas/app/Dominio/Entidades/LineaOrden.php` |
| Vuelto | Diferencia no negativa entre efectivo recibido y total | `OrdenVenta::registrarPago()` / `obtenerVuelto()` |
| Boleta | Comprobante declarado que acumula RUS | `tipo_comprobante=BOLETA` |
| Nota de pedido | Documento interno excluido del acumulado RUS | `tipo_comprobante=NOTA_PEDIDO` |
| Turno de caja | Frontera transaccional de movimientos de un cajero | `finanzas/app/Dominio/Agregados/TurnoCaja.php` |
| Arqueo | Comparación saldo esperado contra efectivo real | `TurnoCaja::cerrarTurno()` |
| Movimiento de caja | Entrada o salida monetaria dentro del turno | `finanzas/app/Dominio/Entidades/MovimientoCaja.php` |
| Stock disponible | Cantidad física utilizable | `inventario/app/Dominio/ObjetosValor/CantidadStock.php` |
| Reabastecer stock | Registrar una entrada física | `ReabastecerStockUseCase::ejecutar()` |
| Descontar stock | Registrar salida por venta/merma | `DescontarStockUseCase::ejecutar()` |
| Alerta de reabastecimiento | Aviso al cruzar el nivel mínimo | evento `AlertaReabastecimientoEmitida.v1` |
| Cliente frecuente | Perfil reutilizable para pedidos y fidelidad | contexto `usuarios` |
| Carrito de compras | Selección temporal del canal web | `tienda-virtual/app/Dominio/Agregados/CarritoCompras.php` |

Los nombres de dominio permanecen en español. Inglés se limita a framework, protocolo e infraestructura.