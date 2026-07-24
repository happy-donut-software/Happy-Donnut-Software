# Crónica de Event Storming

Fuente: entrevista a Kelly Flores y documento de microservicios. Se identificaron actores (Kelly, cajero, cliente online), comandos azules, eventos naranjas, agregados amarillos, políticas moradas y riesgos rojos.

```mermaid
sequenceDiagram
  actor Cajero
  participant Venta
  participant Inventario
  participant Finanzas
  Cajero->>Venta: IniciarVenta / AgregarProducto
  Venta-->>Cajero: TotalMostrado
  Cajero->>Venta: RegistrarPago(método, monto, comprobante)
  Venta-->>Cajero: VueltoCalculadoAutomáticamente
  Venta-->>Inventario: VentaFinalizada.v1
  Venta-->>Finanzas: VentaFinalizada.v1
  Inventario-->>Inventario: ActualizarStock
  Inventario-->>Inventario: VerificarNivelMínimo
  Inventario-->>Inventario: AlertaReabastecimientoEmitida
  Finanzas-->>Finanzas: RegistrarIngresoCajaDiaria
  Finanzas-->>Finanzas: AcumularRUS si BOLETA
  Finanzas-->>Finanzas: AlertaProximidadRUSEmitida
```

Hot spots resueltos: web y POS no comparten promociones implícitamente; Inventario decide disponibilidad; solo Boleta acumula RUS; Yape/Plin no generan vuelto. Pendientes operativos: proveedor real de delivery, reglas de un solo uso de cupón y homologación SUNAT.