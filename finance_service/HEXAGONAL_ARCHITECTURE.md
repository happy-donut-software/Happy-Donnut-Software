# 🏗️ Arquitectura Hexagonal - Documentación

## ¿Qué es la Arquitectura Hexagonal?

La **Arquitectura Hexagonal** (también conocida como *Ports & Adapters*) es un patrón arquitectónico que busca:

1. **Aislar la lógica de negocio** del resto de la aplicación
2. **Permitir múltiples puntos de entrada** (API, CLI, eventos, etc)
3. **Independizar de frameworks** y tecnologías
4. **Facilitar testing** unitario
5. **Facilitar mantenimiento** a largo plazo

## Estructura en Happy Donut Finance

```
app/src/
├── Shared/                                 ← Código compartido entre módulos
│   └── Domain/
│       └── ValueObjects/                  ← Money, Date, etc.
│
└── Finanzas/                               ← Módulo de Finanzas
    ├── Domain/                             ← NÚCLEO (Lógica de negocio pura)
    │   ├── Aggregates/                    ← Agregados del dominio
    │   ├── Events/                        ← Eventos de dominio
    │   ├── Repositories/                  ← Interfaces (contrato, no implementación)
    │   └── Services/                      ← Servicios de dominio (opcional)
    │
    ├── Application/                       ← CASOS DE USO (Orquestación)
    │   ├── UseCases/                      ← Casos de uso de la aplicación
    │   ├── DTO/                           ← Data Transfer Objects
    │   └── Services/                      ← Servicios de aplicación
    │
    └── Infrastructure/                    ← ADAPTADORES (Implementaciones concretas)
        ├── Persistence/Eloquent/          ← Adaptador de BD (Eloquent)
        ├── Controllers/                   ← Adaptador HTTP (Laravel)
        ├── Events/                        ← Adaptadores de eventos
        └── Repositories/                  ← Implementaciones de repositorios
```

## Capas y Responsabilidades

### 1. DOMAIN (Dominio) - El Núcleo

**Responsabilidad:** Contiene la lógica de negocio pura, independiente de frameworks.

#### Aggregates (Agregados)
Son grupos de entidades que se tratan como una unidad.

```php
// app/src/Finanzas/Domain/Aggregates/Movimiento.php
<?php
namespace Finanzas\Domain\Aggregates;

use Shared\Domain\ValueObjects\Money;

class Movimiento {
    private int $id;
    private Money $monto;
    private string $tipo; // 'ingreso' o 'egreso'
    private string $descripcion;
    private \DateTime $fecha;

    public function __construct(
        int $id, 
        Money $monto, 
        string $tipo, 
        string $descripcion
    ) {
        $this->validarTipo($tipo);
        
        $this->id = $id;
        $this->monto = $monto;
        $this->tipo = $tipo;
        $this->descripcion = $descripcion;
        $this->fecha = new \DateTime();
    }

    private function validarTipo(string $tipo): void {
        if (!in_array($tipo, ['ingreso', 'egreso'])) {
            throw new \InvalidArgumentException("Tipo inválido: $tipo");
        }
    }

    public function getMonto(): Money {
        return $this->monto;
    }

    public function getTipo(): string {
        return $this->tipo;
    }
}
```

#### Events (Eventos de Dominio)
Representan cosas que ocurrieron en el negocio.

```php
// app/src/Finanzas/Domain/Events/MovimientoRegistrado.php
<?php
namespace Finanzas\Domain\Events;

use Shared\Domain\ValueObjects\Money;

class MovimientoRegistrado {
    public function __construct(
        private int $movimientoId,
        private Money $monto,
        private string $tipo,
        private \DateTime $ocurridoEn = new \DateTime()
    ) {}

    public function getMovimientoId(): int { return $this->movimientoId; }
    public function getMonto(): Money { return $this->monto; }
    public function getTipo(): string { return $this->tipo; }
    public function getOcurridoEn(): \DateTime { return $this->ocurridoEn; }
}
```

#### Repositories (Interfaces)
**IMPORTANTE:** Aquí van las INTERFACES, no las implementaciones.

```php
// app/src/Finanzas/Domain/Repositories/MovimientoRepository.php
<?php
namespace Finanzas\Domain\Repositories;

use Finanzas\Domain\Aggregates\Movimiento;

interface MovimientoRepository {
    public function save(Movimiento $movimiento): void;
    public function findById(int $id): ?Movimiento;
    public function findAll(): array;
    public function delete(int $id): void;
}
```

### 2. APPLICATION (Aplicación) - Orquestación

**Responsabilidad:** Coordina el dominio para cumplir casos de uso de la aplicación.

#### Use Cases
Cada caso de uso es una clase que implementa un flujo de negocio.

```php
// app/src/Finanzas/Application/UseCases/RegistrarMovimientoUseCase.php
<?php
namespace Finanzas\Application\UseCases;

use Finanzas\Domain\Aggregates\Movimiento;
use Finanzas\Domain\Repositories\MovimientoRepository;
use Shared\Domain\ValueObjects\Money;

class RegistrarMovimientoUseCase {
    public function __construct(
        private MovimientoRepository $movimientoRepository
    ) {}

    public function ejecutar(
        Money $monto, 
        string $tipo, 
        string $descripcion
    ): int {
        // 1. Crear el agregado de dominio
        $movimiento = new Movimiento(
            id: $this->generarId(),
            monto: $monto,
            tipo: $tipo,
            descripcion: $descripcion
        );

        // 2. Guardar usando el repositorio
        $this->movimientoRepository->save($movimiento);

        // 3. Retornar resultado
        return $movimiento->getId();
    }

    private function generarId(): int {
        // Generar ID (puede ser auto-incremental en BD)
        return time();
    }
}
```

#### DTOs (Data Transfer Objects)
Para transferir datos entre capas.

```php
// app/src/Finanzas/Application/DTO/RegistrarMovimientoRequest.php
<?php
namespace Finanzas\Application\DTO;

class RegistrarMovimientoRequest {
    public function __construct(
        public readonly float $monto,
        public readonly string $tipo,
        public readonly string $descripcion
    ) {}
}
```

### 3. INFRASTRUCTURE (Infraestructura) - Adaptadores

**Responsabilidad:** Implementa los interfaces del dominio con tecnologías concretas.

#### Repositories (Implementaciones)
Adaptan el dominio a una base de datos específica.

```php
// app/src/Finanzas/Infrastructure/Repositories/EloquentMovimientoRepository.php
<?php
namespace Finanzas\Infrastructure\Repositories;

use Finanzas\Domain\Aggregates\Movimiento;
use Finanzas\Domain\Repositories\MovimientoRepository;
use App\Models\MovimientoModel; // Modelo Eloquent de Laravel

class EloquentMovimientoRepository implements MovimientoRepository {
    public function save(Movimiento $movimiento): void {
        MovimientoModel::create([
            'id' => $movimiento->getId(),
            'monto' => $movimiento->getMonto()->getAmount(),
            'tipo' => $movimiento->getTipo(),
            'descripcion' => $movimiento->getDescripcion(),
        ]);
    }

    public function findById(int $id): ?Movimiento {
        $model = MovimientoModel::find($id);
        
        if (!$model) {
            return null;
        }

        return new Movimiento(
            id: $model->id,
            monto: Money::create($model->monto),
            tipo: $model->tipo,
            descripcion: $model->descripcion
        );
    }

    public function findAll(): array {
        return MovimientoModel::all()->map(
            fn($model) => new Movimiento(/* ... */)
        )->toArray();
    }

    public function delete(int $id): void {
        MovimientoModel::destroy($id);
    }
}
```

#### Controllers (Adaptadores HTTP)
Reciben requests HTTP y orquestan casos de uso.

```php
// app/src/Finanzas/Infrastructure/Controllers/MovimientoController.php
<?php
namespace Finanzas\Infrastructure\Controllers;

use Illuminate\Http\JsonResponse;
use Finanzas\Application\UseCases\RegistrarMovimientoUseCase;
use Finanzas\Application\DTO\RegistrarMovimientoRequest;
use Shared\Domain\ValueObjects\Money;

class MovimientoController {
    public function __construct(
        private RegistrarMovimientoUseCase $registrarUseCase
    ) {}

    public function store(JsonResponse $request): JsonResponse {
        try {
            $input = $request->validated();

            $movimientoId = $this->registrarUseCase->ejecutar(
                Money::create($input['monto']),
                $input['tipo'],
                $input['descripcion']
            );

            return response()->json([
                'success' => true,
                'movimiento_id' => $movimientoId,
                'message' => 'Movimiento registrado correctamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
```

## Flujo de una Solicitud

```
HTTP Request
    ↓
Controller (Infrastructure)
    ├─ Recibe datos
    ├─ Valida formato
    ↓
Use Case (Application)
    ├─ Coordina el flujo
    ├─ Inyecta repositorio
    ↓
Domain (Agregado + Repositorio)
    ├─ Lógica de negocio pura
    ├─ Validaciones de negocio
    ↓
Repository Implementation (Infrastructure)
    ├─ Persiste en BD
    ├─ Transforma a Eloquent Models
    ↓
Database
    ├─ Almacena datos
    ↓
Response
    ← JSON al cliente
```

## Ventajas de Esta Estructura

| Aspecto | Ventaja |
|--------|---------|
| **Testing** | Fácil mockar dependencias, tests unitarios aislados |
| **Cambio de Framework** | Cambiar Laravel a Symfony solo requiere nuevo Controller/Repository |
| **Cambio de BD** | Cambiar de PostgreSQL a MongoDB solo requiere nueva implementación de Repository |
| **Mantenibilidad** | Código organizado y responsabilidades claras |
| **Escalabilidad** | Agregar módulos sin afectar otros |
| **Reutilización** | Use Cases pueden usarse desde API, CLI, eventos |

## Cómo Crear un Nuevo Módulo

### Paso 1: Definir el Agregado (Domain)
```bash
# Crear archivo
touch app/src/Finanzas/Domain/Aggregates/MiAgregado.php
```

### Paso 2: Definir Eventos (Domain)
```bash
touch app/src/Finanzas/Domain/Events/MiEventoOcurrió.php
```

### Paso 3: Definir Repositorio (Domain - Interface)
```bash
touch app/src/Finanzas/Domain/Repositories/MiRepositorio.php
```

### Paso 4: Crear Use Case (Application)
```bash
touch app/src/Finanzas/Application/UseCases/MiCasoDeUsoUseCase.php
```

### Paso 5: Implementar Repositorio (Infrastructure)
```bash
touch app/src/Finanzas/Infrastructure/Repositories/EloquentMiRepositorio.php
```

### Paso 6: Crear Controlador (Infrastructure)
```bash
touch app/src/Finanzas/Infrastructure/Controllers/MiController.php
```

## Testing con Hexagonal

### Test Unitario del Dominio
```php
<?php
namespace Tests\Unit\Finanzas\Domain\Aggregates;

use Finanzas\Domain\Aggregates\Movimiento;
use Shared\Domain\ValueObjects\Money;
use PHPUnit\Framework\TestCase;

class MovimientoTest extends TestCase {
    public function test_crear_movimiento_valido() {
        $movimiento = new Movimiento(
            id: 1,
            monto: Money::create(100),
            tipo: 'ingreso',
            descripcion: 'Venta de donas'
        );

        $this->assertEquals(100, $movimiento->getMonto()->getAmountAsFloat());
        $this->assertEquals('ingreso', $movimiento->getTipo());
    }
}
```

### Test del Use Case (con Mock)
```php
<?php
namespace Tests\Feature\Finanzas\Application\UseCases;

use Finanzas\Application\UseCases\RegistrarMovimientoUseCase;
use Finanzas\Domain\Repositories\MovimientoRepository;
use Shared\Domain\ValueObjects\Money;
use PHPUnit\Framework\TestCase;

class RegistrarMovimientoUseCaseTest extends TestCase {
    public function test_registrar_movimiento() {
        // Crear mock del repositorio
        $repositorio = $this->createMock(MovimientoRepository::class);
        $repositorio->expects($this->once())
            ->method('save');

        $useCase = new RegistrarMovimientoUseCase($repositorio);
        
        $resultado = $useCase->ejecutar(
            Money::create(100),
            'ingreso',
            'Venta'
        );

        $this->assertIsInt($resultado);
    }
}
```

## Recursos Recomendados

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Arquitectura Limpia - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Siguiente paso:** Revisa los ejemplos en `QUICK_START.md` para implementar tu primer módulo.
