# 🎬 Capa de Aplicación - Documentation

## 📋 Descripción General

La **Capa de Aplicación** contiene los **Casos de Uso (Use Cases)** que orquestan el dominio.

- Reciben solicitudes del exterior (Controllers, CLI, etc)
- Coordinan el uso del dominio
- Persisten cambios usando repositorios
- NO contienen lógica de negocio (está en Domain)

---

## 📁 Estructura

```
Finanzas/Application/
├── UseCases/
│   ├── AbrirCajaUseCase.php              ← Abrir nueva caja
│   ├── RegistrarIngresoUseCase.php       ← Registrar venta
│   ├── RegistrarEgresoUseCase.php        ← Registrar gasto
│   ├── CerrarCajaUseCase.php             ← Cerrar y arquear
│   └── .gitkeep
├── DTO/
│   └── .gitkeep                          ← Para Data Transfer Objects
└── Services/
    └── .gitkeep                          ← Para servicios de aplicación
```

---

## 🎯 Casos de Uso Implementados

### 1. AbrirCajaUseCase

**Archivo:** `AbrirCajaUseCase.php`

**Método principal:**
```php
public function execute(string $vendedorId, float $montoAperturaPen): Caja
```

**Flujo:**
1. Validar entrada (vendedor ID, monto)
2. Generar UUID único para la caja
3. Crear Money Value Object
4. Llamar factory `Caja::abrir()`
5. Guardar con `$repository->save()`
6. Retornar caja creada

**Ejemplo:**
```php
$useCase = new AbrirCajaUseCase($repository);

$caja = $useCase->execute(
    vendedorId: 'vendedor_juan',
    montoAperturaPen: 500.00
);

echo $caja->getId();                    // UUID
echo $caja->getMontoActual()->toString(); // "500.00 PEN"
```

---

### 2. RegistrarIngresoUseCase

**Archivo:** `RegistrarIngresoUseCase.php`

**Método principal:**
```php
public function execute(string $cajaId, float $montoPen, string $descripcion): void
```

**Flujo:**
1. Validar entrada (ID, monto, descripción)
2. Buscar caja con `$repository->search()`
3. Lanzar excepción si no existe
4. Crear Money Value Object
5. Llamar `$caja->registrarIngreso()`
6. Guardar con `$repository->save()`

**Ejemplo:**
```php
$useCase = new RegistrarIngresoUseCase($repository);

$useCase->execute(
    cajaId: '550e8400-e29b-41d4-a716-446655440000',
    montoPen: 150.50,
    descripcion: 'Venta de 2 donas + 1 café'
);

// Lanza excepción si:
// - Caja no existe
// - Monto <= 0
// - Descripción vacía
```

---

### 3. RegistrarEgresoUseCase

**Archivo:** `RegistrarEgresoUseCase.php`

**Método principal:**
```php
public function execute(string $cajaId, float $montoPen, string $descripcion): void
```

**Flujo:**
1. Validar entrada (ID, monto, descripción)
2. Buscar caja con `$repository->search()`
3. Lanzar excepción si no existe
4. Crear Money Value Object
5. Llamar `$caja->registrarEgreso()`
6. Guardar con `$repository->save()`

**Ejemplo:**
```php
$useCase = new RegistrarEgresoUseCase($repository);

$useCase->execute(
    cajaId: '550e8400-e29b-41d4-a716-446655440000',
    montoPen: 50.00,
    descripcion: 'Cambio al cliente'
);

// Similar al ingreso, pero para egresos
```

---

### 4. CerrarCajaUseCase

**Archivo:** `CerrarCajaUseCase.php`

**Método principal:**
```php
public function execute(string $cajaId, float $montoFinalRealPen): void
```

**Flujo:**
1. Validar entrada (ID, monto real)
2. Buscar caja con `$repository->search()`
3. Lanzar excepción si no existe
4. Verificar que está abierta
5. Crear Money Value Object
6. Llamar `$caja->arquearYCerrar()`
7. Guardar con `$repository->save()`

**Ejemplo:**
```php
$useCase = new CerrarCajaUseCase($repository);

$useCase->execute(
    cajaId: '550e8400-e29b-41d4-a716-446655440000',
    montoFinalRealPen: 680.50
);

// Lanza excepción si:
// - Caja no existe
// - Caja ya está cerrada
// - Monto negativo
```

---

## 🏗️ Arquitectura y Patrones

### Inyección de Dependencias

Todos los use cases reciben `CajaRepository` en el constructor:

```php
public function __construct(
    private readonly CajaRepository $repository
) {}
```

**Ventajas:**
- ✅ Fácil de testear (mockar repositorio)
- ✅ Flexible (cambiar implementación sin afectar use case)
- ✅ Responsabilidad única (orquestar, no crear)

### Validaciones en Capas

```
┌─────────────────────────────────────┐
│ Use Case (Application)              │
│ ├─ Validar entrada de usuario       │
│ └─ Validaciones de lógica simple    │
└─────────────────────┬───────────────┘
                      │
┌─────────────────────▼───────────────┐
│ Agregado (Domain)                   │
│ ├─ Validaciones de negocio          │
│ ├─ Lógica de dominio                │
│ └─ Generar eventos                  │
└─────────────────────────────────────┘
```

### Ejemplo: Validaciones

```php
// En Use Case (niveles de entrada)
$this->validarVendedorId($vendedorId);  // "No puede estar vacío"
$this->validarMonto($monto);            // "No puede exceder 100000"

// En Agregado (lógica de negocio)
$this->validarCajaAbierta();            // "No puede estar cerrada"
$this->validarMontoPositivo($monto);    // "Debe ser positivo"
```

---

## 🔄 Flujo Completo: Un Día en Happy Donut

```php
use Finanzas\Application\UseCases\*;
use Finanzas\Domain\Repositories\CajaRepository;

// Inyectar repositorio (Laravel lo hace automáticamente)
$repository = app(CajaRepository::class);

// 1. ABRIR CAJA (8:00 AM)
$abrirUseCase = new AbrirCajaUseCase($repository);
$caja = $abrirUseCase->execute('vendedor_juan', 500.00);
echo "✅ Caja abierta: " . $caja->getId();

// 2. REGISTRAR INGRESO 1 (8:15 AM)
$ingresoUseCase = new RegistrarIngresoUseCase($repository);
$ingresoUseCase->execute(
    cajaId: $caja->getId(),
    montoPen: 45.50,
    descripcion: 'Venta: 2 donas + 1 café'
);

// 3. REGISTRAR INGRESO 2 (9:00 AM)
$ingresoUseCase->execute(
    cajaId: $caja->getId(),
    montoPen: 120.00,
    descripcion: 'Venta: Combo para 4 personas'
);

// 4. REGISTRAR EGRESO (9:30 AM)
$egresoUseCase = new RegistrarEgresoUseCase($repository);
$egresoUseCase->execute(
    cajaId: $caja->getId(),
    montoPen: 50.00,
    descripcion: 'Cambio al cliente'
);

// ... más transacciones durante el día ...

// 5. CERRAR CAJA (5:00 PM)
$cerrarUseCase = new CerrarCajaUseCase($repository);
$cerrarUseCase->execute(
    cajaId: $caja->getId(),
    montoFinalRealPen: 715.50  // Monto contado físicamente
);

echo "✅ Caja cerrada correctamente";
```

---

## 🧪 Testing

### Mock del Repositorio

```php
use PHPUnit\Framework\TestCase;
use Finanzas\Application\UseCases\AbrirCajaUseCase;
use Finanzas\Domain\Repositories\CajaRepository;

class AbrirCajaUseCaseTest extends TestCase
{
    public function test_abrir_caja_exitosamente()
    {
        // Crear mock del repositorio
        $repositoryMock = $this->createMock(CajaRepository::class);
        
        // Configurar el mock
        $repositoryMock->expects($this->once())
            ->method('save');

        // Crear use case con mock
        $useCase = new AbrirCajaUseCase($repositoryMock);

        // Ejecutar
        $caja = $useCase->execute('vendedor_juan', 500.00);

        // Verificar
        $this->assertTrue($caja->estaAbierta());
        $this->assertEquals('500.00', $caja->getMontoActual()->getAmount());
    }

    public function test_lanza_excepcion_sin_vendedor()
    {
        $repository = $this->createMock(CajaRepository::class);
        $useCase = new AbrirCajaUseCase($repository);

        $this->expectException(InvalidArgumentException::class);
        $useCase->execute('', 500.00);  // Vendedor vacío
    }
}
```

---

## 📊 Comparación: Caso de Uso vs Controlador

### ❌ Lógica en Controlador (MAL)

```php
class CajaController
{
    public function store(Request $request)
    {
        // TODO: Lógica de negocio aquí
        $caja = Caja::abrir(...);
        $caja->registrarIngreso(...);
        DB::save($caja);
    }
}
```

### ✅ Lógica en Use Case (BIEN)

```php
class CajaController
{
    public function __construct(
        private AbrirCajaUseCase $abrirCaja
    ) {}

    public function store(Request $request)
    {
        // Solo orquestal y datos
        $caja = $this->abrirCaja->execute(
            $request->vendedor_id,
            $request->monto
        );

        return response()->json($caja);
    }
}
```

**Ventajas:**
- ✅ Controlador delgado (thin)
- ✅ Use case reutilizable (API, CLI, eventos)
- ✅ Fácil de testear

---

## 🎓 Responsabilidades de Cada Capa

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Controller** | Recibir request, llamar use case, devolver response | `$this->abrirCaja->execute()` |
| **Use Case** | Orquestar flujo, validar entrada, persistir | Buscar, convertir, guardar |
| **Domain** | Lógica de negocio, validaciones | "Caja no puede estar cerrada" |
| **Repository** | Persistencia | Guardar en BD |

---

## 🚀 Cómo Crear un Nuevo Use Case

### Template

```php
<?php
namespace Finanzas\Application\UseCases;

use Finanzas\Domain\Repositories\CajaRepository;
use InvalidArgumentException;

final class TuNuevoUseCase
{
    public function __construct(
        private readonly CajaRepository $repository
    ) {}

    public function execute(/* parámetros */): /* tipo retorno */
    {
        // 1. Validar entrada
        $this->validar(...);

        // 2. Buscar agregado si es necesario
        $agregado = $this->repository->search(...);

        // 3. Llamar métodos de dominio
        $agregado->tuMetodo();

        // 4. Persistir
        $this->repository->save($agregado);

        // 5. Retornar resultado
        return $agregado;
    }

    private function validar(...): void
    {
        // Validaciones
    }
}
```

---

## 📚 Resumen

| Use Case | Método | Input | Output | Lógica |
|----------|--------|-------|--------|--------|
| **Abrir** | execute() | vendedorId, monto | Caja | Crear + guardar |
| **Ingreso** | execute() | cajaId, monto, desc | void | Buscar + registrar + guardar |
| **Egreso** | execute() | cajaId, monto, desc | void | Buscar + registrar + guardar |
| **Cerrar** | execute() | cajaId, montoReal | void | Buscar + arquear + guardar |

---

## 🔗 Próximos Pasos

1. **Crear Controllers** que usen estos Use Cases
2. **Implementar EloquentCajaRepository** en Infrastructure
3. **Crear rutas** que llamen a Controllers
4. **Escribir tests** de los Use Cases

---

**La Capa de Aplicación está lista! ✨**
