# 🎯 Happy Donut Finance Service - Arquitectura Completa

## 📐 Diagrama de Arquitectura Hexagonal

```
┌─────────────────────────────────────────────────────────────┐
│                        EXTERNAL WORLD                        │
│         (HTTP Clients, Databases, External APIs)             │
└─────────────────────────────────────────────────────────────┘
                               ↑
                               ↓
┌─────────────────────────────────────────────────────────────┐
│            INFRASTRUCTURE LAYER (Adaptadores)               │
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ CajaController │  │ CajaModel        │  │ Migration    │ │
│  │ (Puerto HTTP)  │  │ (ORM Eloquent)   │  │ (Schema)     │ │
│  └────────┬───────┘  └────────┬─────────┘  └──────┬───────┘ │
│           │                   │                    │         │
│           └───────────────────┼────────────────────┘         │
│                               ↓                              │
│      ┌───────────────────────────────────────────┐           │
│      │ EloquentCajaRepository                    │           │
│      │ (Implementa CajaRepository interface)     │           │
│      └────────────────┬────────────────────────┘            │
│                       │                                      │
│      ServiceProvider (DI Binding)                            │
└─────────────────────────────────────────────────────────────┘
                               ↑
                               ↓
┌─────────────────────────────────────────────────────────────┐
│            APPLICATION LAYER (Casos de Uso)                 │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ AbrirCaja    │  │ RegistrarI/E│  │ CerrarCaja          │ │
│  │ UseCase      │  │ UseCases    │  │ UseCase             │ │
│  └──────┬───────┘  └─────┬───────┘  └──────┬──────────────┘ │
│         │                │                  │                │
│         └────────────────┼──────────────────┘                │
│                          │                                   │
│      ┌───────────────────┼───────────────────┐              │
│      ↓                   ↓                   ↓              │
│  ┌────────────┐  ┌────────────┐      ┌────────────┐        │
│  │ DTOs       │  │ Exceptions │      │ Interfaces │        │
│  │ (Request)  │  │            │      │ (Puertos)  │        │
│  │ (Response) │  │            │      │            │        │
│  └────────────┘  └────────────┘      └────────────┘        │
└─────────────────────────────────────────────────────────────┘
                               ↑
                               ↓
┌─────────────────────────────────────────────────────────────┐
│            DOMAIN LAYER (Lógica Pura)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Caja         │  │ Money        │  │ TransactionType  │   │
│  │ (Aggregate)  │  │ (Value Obj)  │  │ (Value Obj)      │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │              │
│         └─────────────────┼───────────────────┘              │
│                           │                                  │
│      ┌────────────────────┼────────────────────┐             │
│      ↓                    ↓                    ↓             │
│  ┌─────────┐      ┌──────────────┐   ┌──────────────────┐   │
│  │ Eventos │      │ Repository   │   │ Value Objects    │   │
│  │ Dominio │      │ Interface    │   │ (Inmutables)     │   │
│  │         │      │              │   │                  │   │
│  │- Abierta│      │- save()      │   │ Validaciones:    │   │
│  │- Transac│      │- search()    │   │ - 2 decimales    │   │
│  │- Cerrada│      │- findXXX()   │   │ - No negativos*  │   │
│  │         │      │              │   │ - Moneda única   │   │
│  └─────────┘      └──────────────┘   └──────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Estructura de Carpetas

```
finance_service/
├── app/
│   ├── src/
│   │   ├── Finanzas/                           # Módulo de Finanzas
│   │   │   ├── Domain/                         # ✅ CAPA DE DOMINIO
│   │   │   │   ├── Aggregates/
│   │   │   │   │   └── Caja.php               # Raíz de Agregado
│   │   │   │   ├── Events/
│   │   │   │   │   ├── CajaAbierta.php
│   │   │   │   │   ├── TransaccionRegistrada.php
│   │   │   │   │   └── CajaCerrada.php
│   │   │   │   ├── Repositories/
│   │   │   │   │   └── CajaRepository.php    # Interfaz
│   │   │   │   └── ValueObjects/
│   │   │   │       └── TransactionType.php
│   │   │   │
│   │   │   ├── Application/                   # ✅ CAPA DE APLICACIÓN
│   │   │   │   ├── UseCases/
│   │   │   │   │   ├── AbrirCajaUseCase.php
│   │   │   │   │   ├── RegistrarIngresoUseCase.php
│   │   │   │   │   ├── RegistrarEgresoUseCase.php
│   │   │   │   │   └── CerrarCajaUseCase.php
│   │   │   │   ├── DTOs/
│   │   │   │   │   ├── CajaAperturaRequest.php
│   │   │   │   │   ├── TransaccionRequest.php
│   │   │   │   │   ├── CajaCierreRequest.php
│   │   │   │   │   ├── CajaResponse.php
│   │   │   │   │   ├── TransaccionResponse.php
│   │   │   │   │   └── CajaCierreResponse.php
│   │   │   │   └── Exceptions/
│   │   │   │       ├── CajaNotFoundException.php
│   │   │   │       ├── CajaCerradaException.php
│   │   │   │       └── TransaccionInvalidaException.php
│   │   │   │
│   │   │   └── Infrastructure/                # ✅ CAPA DE INFRAESTRUCTURA
│   │   │       ├── Persistence/
│   │   │       │   └── Eloquent/
│   │   │       │       ├── CajaModel.php
│   │   │       │       └── EloquentCajaRepository.php
│   │   │       └── Controllers/
│   │   │           └── CajaController.php
│   │   │
│   │   └── Shared/                            # Código Compartido
│   │       └── Domain/
│   │           └── ValueObjects/
│   │               └── Money.php
│   │
│   └── Providers/
│       └── AppServiceProvider.php             # DI Container
│
├── database/
│   └── migrations/
│       └── 2025_01_15_create_cajas_table.php
│
├── routes/
│   └── api.php                                # Definición de endpoints
│
└── Documentation/
    ├── DOMAIN_LAYER_GUIDE.md
    ├── APPLICATION_LAYER_GUIDE.md
    └── INFRASTRUCTURE_LAYER_GUIDE.md          # ← Nuevo
```

---

## 🔄 Flujo de una Petición: Inicio a Fin

### Ejemplo: Abrir Caja

```
1. CLIENTE HTTP
   ├─ POST /api/finanzas/abrirCaja
   └─ {"vendedor_id": "juan", "monto": 500.00}
   
2. LARAVEL ROUTING (routes/api.php)
   ├─ Ruta encontrada: abrirCaja
   └─ Controlador: CajaController@abrirCaja
   
3. CONTROLLER - CAPA INFRAESTRUCTURA
   ├─ Recibe: Request
   ├─ Valida: request()->validate(...)
   ├─ Crea DTO: CajaAperturaRequest
   └─ Llama: $this->abrirCaja->execute(...)
   
4. USE CASE - CAPA APLICACIÓN
   ├─ Recibe: vendedor_id, monto
   ├─ Inyectado: CajaRepository (resuelto del DI)
   ├─ Convierte: float → Money
   ├─ Genera: UUID
   └─ Llama: Caja::abrir($id, $vendedorId, $monto)
   
5. AGREGADO - CAPA DOMINIO
   ├─ Caja::abrir() - método de factory
   ├─ Valida: 
   │  ├─ Monto > 0
   │  └─ Vendedor válido
   ├─ Crea: new Caja(...)
   ├─ Emite: CajaAbierta (evento de dominio)
   └─ Retorna: Caja agregado
   
6. USE CASE - CAPA APLICACIÓN (continuación)
   ├─ Recibe: Caja agregado
   ├─ Llama: $this->repository->save($caja)
   └─ Retorna: Caja agregado
   
7. REPOSITORY - CAPA INFRAESTRUCTURA
   ├─ Recibe: Caja agregado
   ├─ Convierte: Money → float
   ├─ Llama: CajaModel::updateOrCreate(...)
   └─ BD guarda: INSERT INTO cajas
   
8. CONTROLLER - CAPA INFRAESTRUCTURA (respuesta)
   ├─ Recibe: Caja agregado
   ├─ Transforma: CajaResponse::fromAggregate($caja)
   ├─ Serializa: toArray()
   └─ Retorna: JSON
   
9. HTTP RESPONSE
   ├─ Status: 201 Created
   ├─ Body: {"id": "...", "estado": "abierta", ...}
   └─ Cliente recibe respuesta
```

---

## 💡 Principios Implementados

### 1. Hexagonal Architecture (Puertos & Adaptadores)

```
CORE (Dominio + Aplicación)
│
├─ Puerto: CajaRepository (interfaz)
│  └─ Adaptador: EloquentCajaRepository (implementación)
│
├─ Puerto: CajaController (HTTP)
│  └─ Adaptador: Request/Response JSON
│
└─ Puerto: Database
   └─ Adaptador: Eloquent ORM + PostgreSQL
```

### 2. Dependency Inversion (SOLID)

- Use Cases dependen de **interfaz** `CajaRepository`
- No dependen de `EloquentCajaRepository` concreto
- Permite cambiar implementación sin afectar Use Cases

```php
// ✅ Correcto: Depende de interfaz
public function __construct(private CajaRepository $repo) {}

// ❌ Incorrecto: Depende de implementación
public function __construct(private EloquentCajaRepository $repo) {}
```

### 3. Separation of Concerns

| Capa | Responsabilidad | Ejemplo |
|------|---|---|
| **Domain** | Lógica de negocio pura | Validar monto > 0 |
| **Application** | Orquestar casos de uso | Convertir float→Money, llamar repository |
| **Infrastructure** | Conexiones externas | Persistir en BD, HTTP responses |

### 4. Value Objects (Inmutabilidad)

```php
// Money es inmutable
$dinero1 = Money::create(500);
$dinero2 = $dinero1->add(Money::create(100)); // nuevo objeto
// $dinero1 sigue siendo 500
```

### 5. Aggregate Root (Consistencia)

```php
// Todo acceso a Caja pasa por agregado
$caja->registrarIngreso($monto); // válido
$caja->transacciones[] = ...; // NO permitido (privado)
```

---

## 🧪 Testing por Capas

### Domain Layer Testing
```php
// No necesita BD, no necesita HTTP
public function testCajaNoPermiteMontoNegativo() {
    $this->expectException(InvalidArgumentException::class);
    Caja::abrir('id', 'vendedor', Money::create(-100));
}
```

### Application Layer Testing
```php
// Usa mocks del repository
public function testAbrirCajaLlamaRepository() {
    $repo = Mockery::mock(CajaRepository::class);
    $repo->shouldReceive('save')->once();
    $useCase = new AbrirCajaUseCase($repo);
    $useCase->execute('juan', 500);
}
```

### Infrastructure Layer Testing
```php
// Testing de verdad con BD de test
public function testEloquentRepositorySaveCaja() {
    $repo = new EloquentCajaRepository();
    $caja = Caja::abrir('id', 'juan', Money::create(500));
    $repo->save($caja);
    
    $this->assertDatabaseHas('cajas', ['id' => 'id']);
}
```

---

## 🚀 API Quick Reference

### Endpoints Disponibles

| Método | Endpoint | Acción |
|--------|----------|--------|
| **POST** | `/api/finanzas/abrirCaja` | Abre nueva caja |
| **POST** | `/api/finanzas/registrarIngreso/{id}` | Registra venta |
| **POST** | `/api/finanzas/registrarEgreso/{id}` | Registra gasto |
| **POST** | `/api/finanzas/cerrarCaja/{id}` | Cierra y reconcilia |
| **GET** | `/api/finanzas/cajas/{id}` | Obtiene caja |
| **GET** | `/api/finanzas/cajas` | Lista cajas |

---

## 📊 Data Flow Diagram: Money Conversion

```
DOMAIN LAYER
│
├─ Money::create(500.00)      [Value Object]
│  └─ Almacena: "500.00" (string para precisión)
│
APPLICATION LAYER
│
├─ $useCase->execute(..., 500.00)
│  └─ Recibe float, convierte a Money
│
INFRASTRUCTURE LAYER
│
├─ $caja->getMontoApertura()
│  └─ Money::getAmountAsFloat() = 500.0 (float)
│
DATABASE
│
└─ INSERT: monto_apertura = 500.00 (DECIMAL)
```

---

## 🔐 Security Considerations

1. **UUID como ID**: No expone números secuenciales
2. **Validación en capas**: Domain, Application, Infrastructure
3. **DTOs**: Validan entrada antes de llegar al dominio
4. **Excepciones tipadas**: Permiten manejo específico de errores
5. **Transacciones**: Base de datos garantiza ACID

---

## 🎓 Convenciones de Código

### Namespaces
```php
namespace Finanzas\Domain\Aggregates;      // Domain
namespace Finanzas\Application\UseCases;   // Application
namespace Finanzas\Infrastructure\Controllers; // Infrastructure
```

### Tipos
```php
public function execute(string $vendedorId, float $monto): Caja {}
// Siempre especificar tipos de entrada y salida
```

### Métodos
```php
// Factory methods en agregados
static function abrir(...): self {}

// Private methods for internal logic
private function reconstructAggregate(...): Caja {}
```

---

## 🔗 Conexión: Todas las Capas Juntas

```php
// routes/api.php
Route::post('abrirCaja', [CajaController::class, 'abrirCaja']);

// app/src/Finanzas/Infrastructure/Controllers/CajaController.php
class CajaController {
    public function __construct(
        private AbrirCajaUseCase $abrirCaja,     // ← Use Case inyectado
        private CajaRepository $cajaRepository   // ← Interface inyectada
    ) {}
    
    public function abrirCaja(Request $request) {
        // Llama al Use Case (Aplicación)
        $caja = $this->abrirCaja->execute(...);
        // Transforma a respuesta (Infraestructura)
        return response()->json(CajaResponse::fromAggregate($caja));
    }
}

// app/src/Finanzas/Application/UseCases/AbrirCajaUseCase.php
class AbrirCajaUseCase {
    public function __construct(private CajaRepository $repository) {}
    
    public function execute(string $vendedorId, float $monto): Caja {
        // Crea agregado (Dominio)
        $caja = Caja::abrir(...);
        // Persiste (Infraestructura vía interfaz)
        $this->repository->save($caja);
        return $caja;
    }
}

// app/src/Finanzas/Domain/Aggregates/Caja.php
class Caja {
    static function abrir(string $id, string $vendedorId, Money $monto): self {
        // Lógica pura de dominio
        if ($monto->isNegative()) {
            throw new InvalidArgumentException("Monto debe ser positivo");
        }
        return new self(
            id: $id,
            vendedor_id: $vendedorId,
            monto_apertura: $monto,
            monto_actual: $monto,
            estado: 'abierta'
        );
    }
}

// app/Providers/AppServiceProvider.php
class AppServiceProvider extends ServiceProvider {
    public function register() {
        // Inyecta implementación cuando se solicita interfaz
        $this->app->singleton(
            CajaRepository::class,
            EloquentCajaRepository::class  // ← Binding
        );
    }
}

// app/src/Finanzas/Infrastructure/Persistence/Eloquent/EloquentCajaRepository.php
class EloquentCajaRepository implements CajaRepository {
    public function save(Caja $caja): void {
        // Convierte desde dominio a modelo
        CajaModel::updateOrCreate(
            ['id' => $caja->getId()],
            [
                'monto_apertura' => $caja->getMontoApertura()->getAmountAsFloat(),
                ...
            ]
        );
    }
}
```

---

## 📚 Documentación Relacionada

- [DOMAIN_LAYER_GUIDE.md](DOMAIN_LAYER_GUIDE.md) - Value Objects, Agregados
- [APPLICATION_LAYER_GUIDE.md](APPLICATION_LAYER_GUIDE.md) - Use Cases, DTOs
- [INFRASTRUCTURE_LAYER_GUIDE.md](INFRASTRUCTURE_LAYER_GUIDE.md) - Controllers, BD

---

**¡Tu microservicio sigue arquitectura hexagonal profesional! 🏗️**
