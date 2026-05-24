# Diagnóstico Inventario - Lógica FIFO

## Situación previa

El servicio de inventario estaba implementando la lógica de consumo de stock directamente en la capa de controlador y en consultas Eloquent.
Esto significa que la política de negocio FIFO (descontar los lotes más antiguos primero) quedaba "atrapada" en SQL y en el ORM, en lugar de estar expresada como regla de dominio puro.

### Problemas detectados

- `InventoryController` manipulaba `LoteInsumo` directamente para reservar y liberar inventario.
- La lógica de consumo de stock FIFO estaba dispersa en métodos de controlador que dependían de campos Eloquent como `cantidad_actual` y `fecha_vencimiento`.
- No existía una abstracción clara entre la regla de negocio (consumir lotes por orden de vencimiento) y la persistencia en PostgreSQL.
- Con esto, cualquier cambio en el esquema de datos o en el ORM podía afectar directamente la lógica de negocio.

## Qué se ha corregido

- Se creó un dominio independiente en `app/Core/Domain/Models/` con las clases `Insumo` y `Lote`.
- `Insumo::consumirStock(cantidadRequerida)` ahora ejecuta la lógica FIFO de forma pura:
  - ordena lotes por `fechaVencimiento` ascendente,
  - consume los lotes más antiguos primero,
  - reduce `cantidadRestante` y marca lotes agotados.
- El controlador ya no implementa la lógica de consumo; ahora delega al caso de uso `DescontarStockFIFOUseCase`.
- La persistencia quedó en `app/Core/Infrastructure/Adapters/EloquentInventarioRepository.php`, que convierte entre el dominio y los modelos Laravel.

## Beneficios

- El dominio ya no depende de Eloquent ni de PostgreSQL.
- La lógica FIFO es ahora testable en aislamiento.
- Se cumple la inversión de dependencias: el dominio define el puerto `InventarioRepositoryInterface` y la infraestructura implementa el adaptador.
- El código es más mantenible y claro: el proceso de consumo de stock es una responsabilidad del dominio, no del controlador.
