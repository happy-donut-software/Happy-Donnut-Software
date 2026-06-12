# 🏗️ Capa de Infraestructura - Guía Completa

## 📍 Introducción

La **Capa de Infraestructura** conecta el dominio y la aplicación con el mundo externo:
- Base de datos (PostgreSQL)
- Framework web (Laravel 12)
- Peticiones HTTP

Implementa el patrón **Hexagonal Architecture** en la práctica.

---

## 📊 Componentes Creados

### 1️⃣ Migración de Base de Datos
**Archivo**: `database/migrations/2025_01_15_create_cajas_table.php`

```sql
CREATE TABLE cajas (
    id UUID PRIMARY KEY,
    vendedor_id VARCHAR(100),
    monto_apertura DECIMAL(10,2),
    monto_actual DECIMAL(10,2),
    estado ENUM('abierta', 'cerrada'),
    monto_cierre_real DECIMAL(10,2) NULLABLE,
    diferencia DECIMAL(10,2) NULLABLE,
    fecha_apertura TIMESTAMP,
    fecha_cierre TIMESTAMP NULLABLE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX(vendedor_id),
    INDEX(estado),
    INDEX(fecha_apertura)
);
```

**Propósito**: Define la estructura de la tabla en PostgreSQL

---

### 2️⃣ Modelo Eloquent
**Archivo**: `app/src/Finanzas/Infrastructure/Persistence/Eloquent/CajaModel.php`

```php
class CajaModel extends Model {
    use HasUuids;
    
    protected $table = 'cajas';
    protected $fillable = ['id', 'vendedor_id', 'monto_apertura', ...];
    protected $casts = ['monto_apertura' => 'float', ...];
}
```

**Responsabilidad**: 
- Mapea tabla `cajas` a clase PHP
- Proporciona interfaz para consultas
- Casts automáticos de tipos

**Métodos útiles**:
- `scopeAbiertas()` - Busca cajas abiertas
- `scopeCerradas()` - Busca cajas cerradas
- `scopePorFecha()` - Busca en rango de fechas

---

### 3️⃣ Repositorio Eloquent
**Archivo**: `app/src/Finanzas/Infrastructure/Persistence/Eloquent/EloquentCajaRepository.php`

Implementa la interfaz `CajaRepository` del dominio.

**Responsabilidades**:
- Persistir agregados Caja
- Reconstruir agregados desde base de datos
- Convertir entre Money (dominio) y float (BD)

**Métodos implementados**:
- `save(Caja)` - Inserta/actualiza
- `search(id)` - Busca por ID
- `findOpenByVendedor(id)` - Caja abierta del vendedor
- `findByVendedor(id)` - Todas las cajas del vendedor
- `findAllAbiertas()` - Todas las abiertas
- `findCerradasPorFecha()` - Rango de fechas
- `countAbiertas()` - Contador
- `countCerradas()` - Contador
- `delete(id)` - Eliminar

---

### 4️⃣ Controlador HTTP
**Archivo**: `app/src/Finanzas/Infrastructure/Controllers/CajaController.php`

**Responsabilidades**:
- Recibir peticiones HTTP
- Validar entrada
- Llamar Use Cases
- Transformar respuestas a JSON
- Manejar excepciones

**Métodos**:
- `abrirCaja(Request)` - POST /abrirCaja
- `registrarIngreso(id, Request)` - POST /registrarIngreso/{id}
- `registrarEgreso(id, Request)` - POST /registrarEgreso/{id}
- `cerrarCaja(id, Request)` - POST /cerrarCaja/{id}
- `show(id)` - GET /cajas/{id}
- `index(Request)` - GET /cajas

---

### 5️⃣ Rutas (Endpoints)
**Archivo**: `routes/api.php`

```
POST   /api/finanzas/abrirCaja
POST   /api/finanzas/registrarIngreso/{cajaId}
POST   /api/finanzas/registrarEgreso/{cajaId}
POST   /api/finanzas/cerrarCaja/{cajaId}
GET    /api/finanzas/cajas/{cajaId}
GET    /api/finanzas/cajas
```

---

### 6️⃣ Service Provider
**Archivo**: `app/Providers/AppServiceProvider.php`

**Responsabilidad**: Registrar vinculaciones en el contenedor DI

```php
// Vinculación: Interfaz → Implementación
$this->app->singleton(
    CajaRepository::class,
    EloquentCajaRepository::class
);
```

Cuando se solicita `CajaRepository`, Laravel proporciona `EloquentCajaRepository`.

---

## 🔄 Flujo Completo: Abrir Caja

```
1. HTTP Request
   POST /api/finanzas/abrirCaja
   {"vendedor_id": "juan", "monto": 500}
   ↓
2. Laravel Routing
   Llama: CajaController@abrirCaja
   ↓
3. Controller - Recibe petición
   Valida: request()->validate(...)
   ↓
4. DTO Request
   CajaAperturaRequest::new("juan", 500)
   ↓
5. Use Case - Orquesta
   AbrirCajaUseCase::execute()
   ├─ Convierte: float → Money
   ├─ Genera: UUID
   └─ Llama: Caja::abrir()
   ↓
6. Domain - Lógica pura
   Caja::abrir()
   ├─ Valida dinero
   ├─ Crea agregado
   └─ Emite: CajaAbierta
   ↓
7. Repository - Persiste
   EloquentCajaRepository::save(Caja)
   ├─ Convierte: Money → float
   └─ CajaModel::updateOrCreate(...)
   ↓
8. Database - Almacena
   INSERT INTO cajas (...)
   ↓
9. Controller - Transforma respuesta
   CajaResponse::fromAggregate($caja)
   ↓
10. HTTP Response
    200/201 JSON
    {"id": "...", "estado": "abierta"}
```

---

## 🏗️ Flujo de Datos: Persistencia

### Hacia la Base de Datos: Caja → CajaModel

```php
// Tenemos agregado de dominio
$caja = Caja::abrir($id, "juan", Money::create(500));

// Convertimos para persistencia
$modelo = [
    'id' => $caja->getId(),                           // string UUID
    'vendedor_id' => $caja->getVendedorId(),          // "juan"
    'monto_apertura' => $caja->getMontoApertura()     // Money
                             ->getAmountAsFloat(),    // → 500.0
    'monto_actual' => $caja->getMontoActual()         // Money
                          ->getAmountAsFloat(),       // → 500.0
    'estado' => $caja->getEstado(),                   // "abierta"
    'fecha_apertura' => $caja->getFechaApertura(),    // DateTime
];

// Persistimos
CajaModel::updateOrCreate(['id' => $id], $modelo);
```

### Desde la Base de Datos: CajaModel → Caja

```php
// Obtenemos modelo de BD
$modelo = CajaModel::find($id);

// Reconstruimos agregado
$caja = new Caja(
    id: $modelo->id,                                  // string
    vendedor_id: $modelo->vendedor_id,                // string
    monto_apertura: Money::create(
        $modelo->getMontoAperturaAsFloat()            // float → Money
    ),
    monto_actual: Money::create(
        $modelo->getMontoActualAsFloat()              // float → Money
    ),
    estado: $modelo->estado,                          // string
    fecha_apertura: $modelo->fecha_apertura,          // DateTime
    fecha_cierre: $modelo->fecha_cierre,              // DateTime|null
    diferencia: $modelo->getDiferenciaAsFloat() !== null
        ? Money::create($modelo->getDiferenciaAsFloat())  // float → Money
        : null,
);
```

---

## 📨 Ejemplos de Endpoints

### 1. Abrir Caja

```bash
curl -X POST http://localhost/api/finanzas/abrirCaja \
  -H "Content-Type: application/json" \
  -d '{
    "vendedor_id": "juan",
    "monto": 500.00
  }'
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "vendedor_id": "juan",
  "monto_apertura": 500.00,
  "monto_actual": 500.00,
  "estado": "abierta",
  "fecha_apertura": "2024-01-15T08:00:00+00:00",
  "fecha_cierre": null,
  "diferencia": null,
  "total_transacciones": 0
}
```

---

### 2. Registrar Ingreso

```bash
curl -X POST http://localhost/api/finanzas/registrarIngreso/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 150.00,
    "descripcion": "Venta: 2 donas + 1 café"
  }'
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "vendedor_id": "juan",
  "monto_actual": 650.00,
  "estado": "abierta",
  "total_transacciones": 1
}
```

---

### 3. Cerrar Caja

```bash
curl -X POST http://localhost/api/finanzas/cerrarCaja/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "monto_real": 650.00
  }'
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "estado": "cerrada",
  "monto_actual": 650.00,
  "diferencia": 0.00,
  "fecha_cierre": "2024-01-15T17:00:00+00:00"
}
```

---

### 4. Listar Cajas Abiertas

```bash
curl http://localhost/api/finanzas/cajas?estado=abierta
```

**Response (200 OK)**:
```json
{
  "total": 2,
  "cajas": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "vendedor_id": "juan",
      "estado": "abierta",
      "monto_actual": 500.00
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "vendedor_id": "maria",
      "estado": "abierta",
      "monto_actual": 750.00
    }
  ]
}
```

---

## 🔐 Manejo de Errores

### Error: Caja no encontrada (404)

```json
{
  "error": "La caja con ID '...' no existe.",
  "code": "caja_not_found"
}
```

### Error: Caja cerrada (422)

```json
{
  "error": "No se puede realizar 'operación' en la caja '...' porque está cerrada.",
  "code": "caja_cerrada"
}
```

### Error: Validación fallida (422)

```json
{
  "error": "Datos inválidos",
  "errors": {
    "monto": [
      "El campo monto debe ser un número."
    ],
    "descripcion": [
      "El campo descripcion debe tener al menos 3 caracteres."
    ]
  }
}
```

### Error: Monto inválido (400)

```json
{
  "error": "El monto de apertura no puede ser negativo",
  "code": "invalid_argument"
}
```

---

## 🔗 Inyección de Dependencias

### Cómo funciona en Laravel

1. **Service Provider registra binding**:
   ```php
   $this->app->singleton(
       CajaRepository::class,
       EloquentCajaRepository::class
   );
   ```

2. **Controller solicita dependencia**:
   ```php
   public function __construct(
       private readonly CajaRepository $repo
   ) {}
   ```

3. **Laravel resuelve automáticamente**:
   ```
   CajaRepository → EloquentCajaRepository
   ```

4. **Use Case recibe repository**:
   ```php
   $useCase = new AbrirCajaUseCase($repo);
   ```

---

## 📋 Checklist: De Testing

Para verificar que todo funciona:

```bash
# 1. Ejecutar migraciones
docker-compose exec app php artisan migrate

# 2. Probar endpoint de apertura
curl -X POST http://localhost/api/finanzas/abrirCaja \
  -H "Content-Type: application/json" \
  -d '{"vendedor_id":"juan","monto":500}'

# 3. Verificar en base de datos
docker-compose exec postgres psql -U finance_user -d happy_donut_finance -c "SELECT * FROM cajas;"

# 4. Probar ingresos
curl -X POST http://localhost/api/finanzas/registrarIngreso/{cajaId} \
  -H "Content-Type: application/json" \
  -d '{"monto":150,"descripcion":"Venta"}'

# 5. Probar cierre
curl -X POST http://localhost/api/finanzas/cerrarCaja/{cajaId} \
  -H "Content-Type: application/json" \
  -d '{"monto_real":650}'
```

---

## 🚀 Siguientes Pasos

1. **Event Listeners**: Escuchar eventos de dominio
2. **Request Validation**: FormRequest para validaciones reutilizables
3. **Transformers/Presenters**: DTOs más robustos
4. **Testing**: Tests unitarios e integración
5. **Logging**: Auditoría de operaciones

---

**¡La Capa de Infraestructura conecta tu dominio con el mundo! 🌉**
