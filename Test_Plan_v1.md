# Test Plan v1

## 1. Contexto
Servicio: `order_service`
Objetivo: prueba del dominio de ventas y el caso de uso de procesamiento de pedidos.

## 2. Ubiquitous Language
- Venta
- VentaItem
- TotalAPagar
- DineroRecibido
- VueltoAEntregar
- CorrelativoComprobante
- EstadoPedido
- Repositorio de Venta
- Impresora
- Caso de uso: ProcesarVenta

## 3. Eventos de Dominio
- VentaCreada: cuando la venta se inicia con un correlativo.
- ItemAgregado: cuando se agrega una línea a la venta.
- PagoRegistrado: cuando el cliente entrega el pago.
- VueltoCalculado: cuando se determina el cambio a devolver.
- EstadoPedidoCambiado: cuando se actualiza el estado de la venta.

## 4. Bounded Contexts
- Contexto de dominio de ventas: implementa reglas del negocio de la venta.
- Contexto de infraestructura: persistencia de venta y adaptadores externos.
- Contexto de presentación/servicio: controladores y API expuestas.

## 5. Casos de prueba

### 5.1 Value Objects
- `TotalVenta` acepta valores numéricos y normaliza a dos decimales.
- `TotalVenta` no permite valores negativos.

### 5.2 Entidades y Agregados
- `Venta` agrega items y actualiza el total.
- `Venta` lanza excepción cuando el pago es insuficiente.
- `Venta` calcula correctamente el vuelto.
- `VentaItem` no acepta cantidad cero o negativa.
- `VentaItem` no acepta precio unitario negativo.

### 5.3 Reglas del dominio
- La orden debe incluir al menos un item.
- El total a pagar nunca debe ser negativo.
- El pago debe cubrir al menos el total.

### 5.4 Puertos y adaptadores
- `ProcesarVentaUseCase` debe usar `VentaRepositoryInterface` e `ImpresoraPortInterface`.
- La prueba debe usar mocks para ambos puertos.
- No se debe invocar `EloquentVentaRepository` en pruebas unitarias de dominio.

### 5.5 Integración mínima
- Validar que el flujo de venta completo se puede ejecutar con repositorio en memoria o en memoria SQLite.
- Verificar que el objeto `Venta` sale con `estado_pedido` y `fecha_venta` definidos.

## 6. Criterios de validación
- Las pruebas deben ser legibles y usar nombres descriptivos.
- Cada caso de prueba debe validar una sola regla de negocio.
- El dominio debe estar aislado de la infraestructura.
- El reporte de cobertura debe evidenciar la ejecución de pruebas del dominio.

## 7. Ejemplo de nomenclatura
- Test: `test_total_venta_no_acepta_valores_negativos`
- Test: `test_venta_actualiza_total_al_agregar_item`
- Test: `test_procesar_venta_guarda_y_imprime_venta`

## 8. Observaciones de implementación
- `order_service/app/Core/Application/UseCases/ProcesarVentaUseCase.php` es el punto de entrada del caso de uso.
- `order_service/app/Core/Domain/Ports/VentaRepositoryInterface.php` e `ImpresoraPortInterface.php` son puertos claros.
- `order_service/app/Core/Infrastructure/Adapters/EloquentVentaRepository.php` es el adaptador de persistencia.
- `order_service/app/Core/Domain/Models/Venta.php` es el agregado que protege invariantes.
