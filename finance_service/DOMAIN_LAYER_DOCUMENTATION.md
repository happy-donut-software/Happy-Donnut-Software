# 🏗️ Capa de Dominio - Documentación

## 📋 Descripción General

La **Capa de Dominio** contiene toda la lógica de negocio pura, independiente de frameworks y tecnologías.
Implementa los principios de **Domain-Driven Design (DDD)** y **Arquitectura Hexagonal**.

---

## 📁 Estructura Creada

```
Finanzas/Domain/
├── ValueObjects/
│   └── TransactionType.php          ← Enum de tipos de transacciones
├── Aggregates/
│   ├── Caja.php                     ← Aggregate Root (Modelo Rico)
│   └── .gitkeep
├── Events/
│   ├── CajaAbierta.php              ← Evento de dominio
│   ├── TransaccionRegistrada.php    ← Evento de dominio
│   ├── CajaCerrada.php              ← Evento de dominio
│   └── .gitkeep
├── Repositories/
│   ├── CajaRepository.php           ← Interfaz del repositorio
│   └── .gitkeep
└── Services/
    └── .gitkeep                     ← Para futuros servicios de dominio
```

---

## 🎯 Componentes Principales

### 1. TransactionType (Value Object)

**Ubicación:** `app/src/Finanzas/Domain/ValueObjects/TransactionType.php`

Representa los tipos posibles de transacciones en una caja.

**Tipos disponibles:**
- `INGRESO_VENTA` - Dinero ingresado por ventas
- `EGRESO_OPERATIVO` - Dinero egresado por gastos operativos
- `CIERRE_CAJA` - Cierre y reconciliación

**Ejemplo de uso:**
```php
use Finanzas\Domain\ValueObjects\TransactionType;

// Factory methods
$tipo = TransactionType::ingresoVenta();
$tipo = TransactionType::egresoOperativo();
$tipo = TransactionType::cierreCaja();

// Desde string
$tipo = TransactionType::from('ingreso_venta');

// Métodos de consulta
$tipo->esIngresoVenta();      // true/false
$tipo->esEgresoOperativo();   // true/false
$tipo->esCierreCaja();        // true/false
$tipo->esIngreso();           // true si suma dinero
$tipo->esEgreso();            // true si resta dinero

// Información
echo $tipo->nombre();         // "Ingreso por Venta"
echo $tipo->descripcion();    // Descripción legible
echo $tipo->value();          // "ingreso_venta"
```

---

### 2. Caja (Aggregate Root)

**Ubicación:** `app/src/Finanzas/Domain/Aggregates/Caja.php`

Es el **Modelo Rico** que contiene toda la lógica de negocio de una caja registradora.

**Propiedades principales:**
- `id` - UUID único de la caja
- `vendedor_id` - Quién administra la caja
- `monto_apertura` - Monto inicial (Money)
- `monto_actual` - Saldo actual (Money)
- `estado` - 'abierta' o 'cerrada'
- `fecha_apertura` - Cuándo se abrió
- `fecha_cierre` - Cuándo se cerró (si aplica)
- `diferencia` - Faltante/sobrante al cierre (Money)

**Flujo de vida:**

```
1. APERTURA
   ↓
   Caja::abrir()
   → Evento: CajaAbierta

2. TRANSACCIONES
   ↓
   registrarIngreso() | registrarEgreso()
   → Evento: TransaccionRegistrada (para cada una)

3. CIERRE
   ↓
   arquearYCerrar()
   → Evento: CajaCerrada
```

**Ejemplo de uso:**

```php
use Finanzas\Domain\Aggregates\Caja;
use Shared\Domain\ValueObjects\Money;

// 1. Abrir caja
$cajaId = '550e8400-e29b-41d4-a716-446655440000'; // UUID
$caja = Caja::abrir(
    id: $cajaId,
    vendedor_id: 'vendedor_001',
    monto_apertura: Money::create(500.00)  // Fondo de caja inicial
);

// 2. Registrar ventas (ingresos)
$caja->registrarIngreso(
    monto: Money::create(150.50),
    descripcion: 'Venta de 2 donas + 1 café'
);

$caja->registrarIngreso(
    monto: Money::create(75.00),
    descripcion: 'Venta de 3 donas'
);

// 3. Registrar gastos (egresos)
$caja->registrarEgreso(
    monto: Money::create(50.00),
    descripcion: 'Cambio por moneda de 100'
);

// 4. Consultar estado
echo $caja->getMontoActual()->toString();       // "680.50 PEN"
echo $caja->getTotalTransacciones();            // 3

// 5. Arquear y cerrar
$cajaReal = Money::create(680.50);  // Monto contado físicamente
$caja->arquearYCerrar($cajaReal);

// 6. Verificar cierre
if ($caja->cuadraPerfectamente()) {
    echo "✅ La caja cuadra perfectamente";
} elseif ($caja->hayFaltante()) {
    echo "⚠️ Faltante: " . $caja->getDiferencia()->absolute()->toString();
} elseif ($caja->haySobrante()) {
    echo "✅ Sobrante: " . $caja->getDiferencia()->toString();
}

// 7. Obtener eventos generados
$eventos = $caja->getEventosDominio();
// [CajaAbierta, TransaccionRegistrada, TransaccionRegistrada, TransaccionRegistrada, CajaCerrada]
```

**Validaciones automáticas (Lógica de Negocio):**

✅ No permite registrar transacciones en caja cerrada
✅ Solo acepta montos positivos (el signo se maneja internamente)
✅ Calcula automáticamente diferencias
✅ Emite eventos de dominio para cada operación

---

### 3. Domain Events

#### CajaAbierta

```php
use Finanzas\Domain\Events\CajaAbierta;

// Acceso a datos del evento
$evento = $caja->getEventosDominio()[0]; // Primera operación

$evento->getCajaId();         // "550e8400-e29b-41d4-a716-446655440000"
$evento->getVendedorId();     // "vendedor_001"
$evento->getMontoApertura();  // Money object
$evento->getFechaApertura();  // DateTime

// Convertir a array (para almacenar/enviar)
$datos = $evento->toArray();
```

#### TransaccionRegistrada

```php
use Finanzas\Domain\Events\TransaccionRegistrada;

$evento = $caja->getEventosDominio()[1]; // Segunda operación

$evento->getCajaId();         // ID de caja
$evento->getTipo();           // TransactionType
$evento->getMonto();          // Money
$evento->getDescripcion();    // String
$evento->getMontoActual();    // Money (saldo actual después de la transacción)
$evento->getFechaTransaccion();// DateTime

// Métodos de consulta
$evento->esIngreso();         // true/false
$evento->esEgreso();          // true/false
```

#### CajaCerrada

```php
use Finanzas\Domain\Events\CajaCerrada;

$evento = $caja->getEventosDominio()[count($eventos) - 1]; // Último evento

$evento->getCajaId();
$evento->getVendedorId();
$evento->getMontoTeoricoFinal();  // Lo que debería haber
$evento->getMontoRealFinal();     // Lo que hay realmente
$evento->getDiferencia();         // Real - Teórico
$evento->getFechaCierre();
$evento->getTotalTransacciones();

// Métodos de consulta
$evento->hayFaltante();           // true si diferencia < 0
$evento->haySobrante();           // true si diferencia > 0
$evento->cuadraPerfectamente();   // true si diferencia == 0
```

---

### 4. CajaRepository (Interfaz)

**Ubicación:** `app/src/Finanzas/Domain/Repositories/CajaRepository.php`

Define el contrato para persistir Cajas. La implementación estará en Infrastructure (Eloquent).

**Métodos principales:**

```php
use Finanzas\Domain\Repositories\CajaRepository;

// Guardar caja (crear o actualizar)
$this->cajaRepository->save($caja);

// Buscar por ID
$caja = $this->cajaRepository->search('550e8400-e29b-41d4-a716-446655440000');

// Obtener caja abierta de un vendedor
$cajaAbierta = $this->cajaRepository->findOpenByVendedor('vendedor_001');

// Obtener todas las cajas de un vendedor
$cajas = $this->cajaRepository->findByVendedor('vendedor_001');

// Obtener todas las cajas abiertas
$abiertas = $this->cajaRepository->findAllAbiertas();

// Buscar cajas cerradas por rango de fechas
$cerradas = $this->cajaRepository->findCerradasPorFecha(
    new DateTime('2026-05-01'),
    new DateTime('2026-05-10')
);

// Contar
$total = $this->cajaRepository->countAbiertas();
$total = $this->cajaRepository->countCerradas();

// Eliminar
$borrado = $this->cajaRepository->delete($cajaId);
```

---

## 🎓 Principios Aplicados

### 1. **Rich Domain Model (Modelo Rico)**
La lógica de negocio está en el Agregado `Caja`, no en la base de datos.

```php
// ✅ CORRECTO: Lógica en el dominio
$caja->registrarIngreso(Money::create(100), 'Venta');

// ❌ INCORRECTO: Lógica en la base de datos
$caja->monto_actual = $caja->monto_actual + 100;
```

### 2. **Value Objects**
Usamos `Money` para asegurar cálculos precisos.

```php
// ✅ CORRECTO: Usar Money
$monto = Money::create(100.50);
$total = $monto->add(Money::create(50));

// ❌ INCORRECTO: Usar float/int
$monto = 100.50;
$total = $monto + 50;  // Problemas de precisión
```

### 3. **Domain Events**
Cada operación importante genera un evento.

```php
$caja = Caja::abrir(...);              // Emite: CajaAbierta
$caja->registrarIngreso(...);          // Emite: TransaccionRegistrada
$caja->arquearYCerrar(...);            // Emite: CajaCerrada

$eventos = $caja->getEventosDominio(); // Recuperar todos
```

### 4. **Repository Pattern**
Abstracción del almacenamiento.

```php
// Interfaz en Domain
interface CajaRepository { ... }

// Implementación en Infrastructure (Eloquent)
class EloquentCajaRepository implements CajaRepository { ... }

// Inyectada en Application
class AbriCajaUseCase {
    public function __construct(CajaRepository $repo) { ... }
}
```

---

## 🧪 Ejemplo: Crear un Use Case

Los Use Cases orquestan el dominio:

```php
<?php
namespace Finanzas\Application\UseCases;

use Finanzas\Domain\Aggregates\Caja;
use Finanzas\Domain\Repositories\CajaRepository;
use Shared\Domain\ValueObjects\Money;
use Ramsey\Uuid\Uuid;

class AbrirCajaUseCase
{
    public function __construct(
        private CajaRepository $cajaRepository
    ) {}

    public function ejecutar(string $vendedorId, float $montoApertura): string
    {
        // 1. Crear agregado de dominio
        $cajaId = Uuid::uuid4()->toString();
        $caja = Caja::abrir(
            id: $cajaId,
            vendedor_id: $vendedorId,
            monto_apertura: Money::create($montoApertura)
        );

        // 2. Persistir usando repositorio
        $this->cajaRepository->save($caja);

        // 3. Retornar resultado
        return $cajaId;
    }
}
```

---

## 📝 Resumen de Validaciones

| Validación | Dónde | Error |
|-----------|-------|-------|
| No registrar en caja cerrada | `Caja::validarCajaAbierta()` | InvalidArgumentException |
| Montos positivos | `Caja::validarMontoPositivo()` | InvalidArgumentException |
| Tipo de transacción válido | `TransactionType::validarTipo()` | InvalidArgumentException |

---

## 🚀 Próximos Pasos

1. **Crear Use Cases en `Application/UseCases/`**
   - `AbrirCajaUseCase.php`
   - `RegistrarIngresoUseCase.php`
   - `RegistrarEgresoUseCase.php`
   - `CerrarCajaUseCase.php`

2. **Implementar Repositorio en `Infrastructure/`**
   - `EloquentCajaRepository.php`

3. **Crear Controladores en `Infrastructure/Controllers/`**
   - `CajaController.php`

4. **Escribir Tests**
   - `tests/Unit/Finanzas/Domain/Aggregates/CajaTest.php`
   - `tests/Unit/Finanzas/Domain/ValueObjects/TransactionTypeTest.php`

---

## 📚 Referencias

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design - Vaughn Vernon](https://vaughnvernon.com/)
- [Aggregate Pattern](https://martinfowler.com/bliki/DDD_Aggregate.html)
- [Value Object Pattern](https://martinfowler.com/bliki/ValueObject.html)

---

**La capa de Dominio está lista. ¡Ahora podemos crear los Use Cases! 🚀**
