# Diagnóstico Fase 1 - Order Service

## Auditoría de dependencias y acoplamientos a Eloquent

### 1. Clases acopladas a `Illuminate\Database\Eloquent`

- `app/Models/Venta.php` extiende `Illuminate\Database\Eloquent\Model`.
- `app/Models/Pago.php`, `app/Models/DetalleVenta.php`, `app/Models/MetodoPago.php`, `app/Models/Cliente.php` extienden `Model`.
- `app/Domain/Aggregates/VentaAggregate.php` construye y persiste un objeto `App\Models\Venta` directamente desde la capa de dominio.
- `app/Http/Controllers/VentaController.php` usa los modelos Eloquent `Venta`, `DetalleVenta`, `Pago` y `MetodoPago` para crear, consultar y actualizar ventas.

### 2. Violaciones de independencia del dominio

- El dominio no era autónomo: la lógica de negocio dependía directamente de los modelos Eloquent y de la capa de persistencia.
- `VentaAggregate` mezclaba reglas de negocio con acceso a la base de datos al crear y guardar instancias de Eloquent.
- `VentaController` actuaba como un controlador tradicional pero también como un servicio de aplicación, construyendo consultas y manipulando objetos de persistencia.
- Esto rompe la inversión de dependencias: el dominio debería definir interfaces y no depender de implementaciones concretas como Eloquent o PostgreSQL.

### 3. Impacto en el mantenimiento y pruebas

- Las reglas de negocio no podían probarse fácilmente sin tener un entorno de base de datos y los modelos Eloquent cargados.
- Cualquier cambio en el esquema de la base de datos o en el ORM podía filtrar hacia el dominio, generando fragilidad en el servicio.

### 4. Resultado de la refactorización

- Se creó una capa de dominio independiente en `app/Core/Domain` sin imports de Laravel/Eloquent.
- Se añadieron puertos (`VentaRepositoryInterface`, `ImpresoraPortInterface`) para invertir las dependencias.
- La lógica de aplicación se trasladó a `app/Core/Application/UseCases/ProcesarVentaUseCase.php`.
- Los adaptadores de infraestructura (`EloquentVentaRepository`, `ImpresoraAdapter`) quedan en `app/Core/Infrastructure/Adapters`.
- El controlador `VentaController` ahora inyecta el caso de uso y opera como adaptador primario.
