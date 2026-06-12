# 🎬 Capa de Aplicación - Ejemplos Prácticos

## 🎯 Escenario: Implementar con Los Use Cases

### Setup Inicial

```php
use Finanzas\Application\UseCases\*;
use Finanzas\Domain\Repositories\CajaRepository;

// En Laravel, la inyección se hace automáticamente
// Aquí mostramos el setup manual para educación

// 1. Obtener el repositorio (implementación)
$repository = app(CajaRepository::class);

// 2. Instanciar los use cases
$abrirUseCase = new AbrirCajaUseCase($repository);
$ingresoUseCase = new RegistrarIngresoUseCase($repository);
$egresoUseCase = new RegistrarEgresoUseCase($repository);
$cerrarUseCase = new CerrarCajaUseCase($repository);
```

---

## 📍 Caso 1: Abrir Caja

```php
// Juan abre su caja a las 8:00 AM con 500 PEN de fondo

try {
    $caja = $abrirUseCase->execute(
        vendedorId: 'vendedor_juan',
        montoAperturaPen: 500.00
    );

    echo "✅ Caja abierta";
    echo "ID: " . $caja->getId();
    echo "Monto: " . $caja->getMontoActual()->toString();
    echo "Estado: " . $caja->getEstado();  // "abierta"

    $cajaId = $caja->getId();  // Guardamos para luego

} catch (InvalidArgumentException $e) {
    echo "❌ Error: " . $e->getMessage();
}
```

### Validaciones de Entrada

```php
// ❌ Vendedor vacío
try {
    $abrirUseCase->execute('', 500.00);
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "El ID del vendedor no puede estar vacío"
}

// ❌ Monto negativo
try {
    $abrirUseCase->execute('juan', -100.00);
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "El monto de apertura no puede ser negativo"
}

// ❌ Monto muy alto
try {
    $abrirUseCase->execute('juan', 150000.00);
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "El monto de apertura no puede exceder 100000"
}
```

---

## 📍 Caso 2: Registrar Ingreso

```php
// Cliente compra 2 donas y 1 café

try {
    $ingresoUseCase->execute(
        cajaId: $cajaId,
        montoPen: 45.50,
        descripcion: 'Venta: 2 donas + 1 café'
    );

    echo "✅ Ingreso registrado";

    // Buscar caja para verificar
    $caja = $repository->search($cajaId);
    echo "Monto actual: " . $caja->getMontoActual()->toString();  // "545.50 PEN"
    echo "Transacciones: " . $caja->getTotalTransacciones();       // 1

} catch (InvalidArgumentException $e) {
    echo "❌ Error: " . $e->getMessage();
}
```

### Validaciones para Ingreso

```php
// ❌ Caja no existe
try {
    $ingresoUseCase->execute(
        cajaId: 'id-inexistente',
        montoPen: 50.00,
        descripcion: 'Venta'
    );
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "La caja con ID 'id-inexistente' no existe"
}

// ❌ Monto <= 0
try {
    $ingresoUseCase->execute($cajaId, 0.00, 'Venta');
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "El monto del ingreso debe ser mayor a 0"
}

// ❌ Descripción vacía
try {
    $ingresoUseCase->execute($cajaId, 50.00, '');
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "La descripción no puede estar vacía"
}
```

---

## 📍 Caso 3: Múltiples Ingresos

```php
// Varias ventas durante la mañana

$ventas = [
    ['monto' => 150.00, 'desc' => 'Venta: 5 donas variadas'],
    ['monto' => 120.00, 'desc' => 'Venta: Combo para 4 personas'],
    ['monto' => 75.50, 'desc' => 'Venta: 3 donas + 2 cafés'],
    ['monto' => 89.99, 'desc' => 'Venta: Lunch especial'],
];

foreach ($ventas as $venta) {
    try {
        $ingresoUseCase->execute(
            cajaId: $cajaId,
            montoPen: $venta['monto'],
            descripcion: $venta['desc']
        );
    } catch (InvalidArgumentException $e) {
        echo "Error en venta: " . $e->getMessage();
    }
}

// Verificar total
$caja = $repository->search($cajaId);
echo "Total acumulado: " . $caja->getMontoActual()->toString();
echo "Total transacciones: " . $caja->getTotalTransacciones();
```

---

## 📍 Caso 4: Registrar Egreso

```php
// Cambio dado al cliente

try {
    $egresoUseCase->execute(
        cajaId: $cajaId,
        montoPen: 50.00,
        descripcion: 'Cambio por billete de 100'
    );

    echo "✅ Egreso registrado";

    // Verificar
    $caja = $repository->search($cajaId);
    echo "Monto actual: " . $caja->getMontoActual()->toString();

} catch (InvalidArgumentException $e) {
    echo "❌ Error: " . $e->getMessage();
}
```

### Validaciones para Egreso

```php
// Las validaciones son similares al ingreso
// Pero con la lógica diferente internamente

// ❌ Intentar egreso > monto disponible
// (No lanza error en Use Case, el Agregado lo maneja)
try {
    $egresoUseCase->execute($cajaId, 50000.00, 'Egreso grande');
    
    $caja = $repository->search($cajaId);
    // El monto puede ser negativo (representa una deuda)
    echo "Monto: " . $caja->getMontoActual()->toString();  // "-xxxxx.xx PEN"
    
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
}
```

---

## 📍 Caso 5: Intentar Operación en Caja Cerrada

```php
// Primero cerrar la caja
$caja = $repository->search($cajaId);
$cerrarUseCase->execute($cajaId, 680.50);

echo "Caja estado: " . ($caja->estaCerrada() ? 'cerrada' : 'abierta');

// Intentar agregar ingreso
try {
    $ingresoUseCase->execute(
        cajaId: $cajaId,
        montoPen: 100.00,
        descripcion: 'Venta tardía'
    );
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
    // "No se pueden registrar transacciones en una caja cerrada."
}
```

---

## 📍 Caso 6: Cerrar Caja

```php
// Fin del día a las 5:00 PM
// Juan cuenta el dinero físicamente

try {
    $cerrarUseCase->execute(
        cajaId: $cajaId,
        montoFinalRealPen: 680.50  // Lo que hay realmente
    );

    echo "✅ Caja cerrada";

    // Verificar resultado del cierre
    $caja = $repository->search($cajaId);
    
    echo "Estado: " . $caja->getEstado();  // "cerrada"
    echo "Monto teórico: " . $caja->getMontoActual()->toString();
    echo "Monto real: " . $caja->getMontoFinalCierre()->toString();
    echo "Diferencia: " . $caja->getDiferencia()->toString();
    
    if ($caja->cuadraPerfectamente()) {
        echo "✅ La caja cuadra perfectamente";
    } elseif ($caja->hayFaltante()) {
        echo "⚠️ Faltante: " . $caja->getDiferencia()->absolute()->toString();
    } elseif ($caja->haySobrante()) {
        echo "✅ Sobrante: " . $caja->getDiferencia()->toString();
    }

} catch (InvalidArgumentException $e) {
    echo "❌ Error: " . $e->getMessage();
}
```

### Validaciones para Cerrar

```php
// ❌ Caja ya cerrada
try {
    $cerrarUseCase->execute($cajaId, 700.00);  // Intentar cerrar de nuevo
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
    // "La caja con ID '...' ya está cerrada."
}

// ❌ Caja no existe
try {
    $cerrarUseCase->execute('id-fake', 700.00);
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "La caja con ID 'id-fake' no existe"
}

// ❌ Monto real negativo
try {
    $cerrarUseCase->execute($cajaId, -100.00);
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();  // "El monto real no puede ser negativo"
}
```

---

## 🔄 Flujo Completo: Un Día Entero

```php
echo "=== DÍA EN HAPPY DONUT ===\n";

// 1. APERTURA (8:00 AM)
echo "\n🔓 APERTURA\n";
$caja = $abrirUseCase->execute('vendedor_juan', 500.00);
$cajaId = $caja->getId();
echo "Caja abierta con: " . $caja->getMontoActual()->toString() . "\n";

// 2. MAÑANA DE VENTAS
echo "\n🌅 MAÑANA\n";
$ingresoUseCase->execute($cajaId, 150.00, 'Venta 1');
$ingresoUseCase->execute($cajaId, 75.50, 'Venta 2');
$ingresoUseCase->execute($cajaId, 120.00, 'Venta 3');
$caja = $repository->search($cajaId);
echo "Monto después de mañana: " . $caja->getMontoActual()->toString() . "\n";

// 3. GASTO OPERATIVO
echo "\n💸 GASTO\n";
$egresoUseCase->execute($cajaId, 50.00, 'Cambio a cliente');
$caja = $repository->search($cajaId);
echo "Monto después de gasto: " . $caja->getMontoActual()->toString() . "\n";

// 4. TARDE DE VENTAS
echo "\n☀️ TARDE\n";
$ingresoUseCase->execute($cajaId, 200.00, 'Venta 4');
$ingresoUseCase->execute($cajaId, 89.99, 'Venta 5');
$caja = $repository->search($cajaId);
echo "Monto después de tarde: " . $caja->getMontoActual()->toString() . "\n";

// 5. CIERRE
echo "\n🔒 CIERRE\n";
$caja = $repository->search($cajaId);
$montoTeórico = $caja->getMontoActual()->getAmountAsFloat();
echo "Monto teórico: " . $montoTeórico . " PEN\n";

// Juan cuenta el dinero
$montoReal = 1084.50;
echo "Monto real contado: " . $montoReal . " PEN\n";

$cerrarUseCase->execute($cajaId, $montoReal);
$caja = $repository->search($cajaId);

if ($caja->cuadraPerfectamente()) {
    echo "✅ CUADRA PERFECTAMENTE\n";
} else {
    echo "Diferencia: " . $caja->getDiferencia()->toString() . "\n";
}

echo "Total transacciones: " . $caja->getTotalTransacciones() . "\n";
```

**Salida esperada:**
```
=== DÍA EN HAPPY DONUT ===

🔓 APERTURA
Caja abierta con: 500.00 PEN

🌅 MAÑANA
Monto después de mañana: 745.50 PEN

💸 GASTO
Monto después de gasto: 695.50 PEN

☀️ TARDE
Monto después de tarde: 985.49 PEN

🔒 CIERRE
Monto teórico: 985.49 PEN
Monto real contado: 1084.50 PEN
Sobrante: 99.01 PEN
Total transacciones: 5
```

---

## 🧪 Testing Los Use Cases

```php
use PHPUnit\Framework\TestCase;
use Finanzas\Application\UseCases\AbrirCajaUseCase;
use Finanzas\Domain\Repositories\CajaRepository;

class AbrirCajaUseCaseTest extends TestCase
{
    private $mockRepository;
    private $useCase;

    protected function setUp(): void
    {
        // Crear mock del repositorio
        $this->mockRepository = $this->createMock(CajaRepository::class);
        
        // Inyectar en use case
        $this->useCase = new AbrirCajaUseCase($this->mockRepository);
    }

    public function test_abrir_caja_exitosamente()
    {
        // El mock debe llamar save() una vez
        $this->mockRepository->expects($this->once())->method('save');

        // Ejecutar
        $caja = $this->useCase->execute('juan', 500.00);

        // Verificar
        $this->assertTrue($caja->estaAbierta());
        $this->assertEquals('500.00', $caja->getMontoActual()->getAmount());
    }

    public function test_lanza_excepcion_sin_vendedor()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->useCase->execute('', 500.00);
    }

    public function test_lanza_excepcion_monto_negativo()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->useCase->execute('juan', -100.00);
    }
}
```

---

## 🎓 Patrón: Inyección en Laravel

En un Controller de Laravel:

```php
<?php
namespace Finanzas\Infrastructure\Controllers;

use Finanzas\Application\UseCases\AbrirCajaUseCase;
use Illuminate\Http\Request;

class CajaController
{
    // Laravel inyecta automáticamente
    public function __construct(
        private AbrirCajaUseCase $abrirCaja
    ) {}

    public function store(Request $request)
    {
        // Usar el use case
        $caja = $this->abrirCaja->execute(
            $request->vendedor_id,
            $request->monto
        );

        return response()->json($caja->getResumen(), 201);
    }
}
```

---

**¡Los Use Cases están listos para usar! 🚀**
