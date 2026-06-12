# 💼 Capa de Dominio - Ejemplos Prácticos

## 🎯 Escenario: Día de trabajo en Happy Donut

### Paso 1: Abrir la caja

```php
use Finanzas\Domain\Aggregates\Caja;
use Shared\Domain\ValueObjects\Money;
use Ramsey\Uuid\Uuid;

// Juan, vendedor de Happy Donut, abre su caja a las 8 AM
$cajaId = Uuid::uuid4()->toString();

$caja = Caja::abrir(
    id: $cajaId,
    vendedor_id: 'vendedor_juan',
    monto_apertura: Money::create(500.00)  // Fondo de caja inicial
);

// Verificar que abrió correctamente
echo $caja->estaAbierta();           // true
echo $caja->getMontoActual()->toString(); // "500.00 PEN"

// Obtener evento
$eventos = $caja->getEventosDominio();
// [CajaAbierta]
```

### Paso 2: Primera venta (8:15 AM)

```php
// Cliente compra 2 donas y un café
$caja->registrarIngreso(
    monto: Money::create(45.00),
    descripcion: 'Venta: 2 donas + 1 café'
);

echo $caja->getMontoActual()->toString(); // "545.00 PEN"
echo $caja->getTotalTransacciones();      // 1

// Revisar eventos
$eventos = $caja->getEventosDominio();
// [CajaAbierta, TransaccionRegistrada]
```

### Paso 3: Más ventas (8:30 - 11:45 AM)

```php
// Varias transacciones durante la mañana
$caja->registrarIngreso(Money::create(75.50), 'Venta: 5 donas variadas');
$caja->registrarIngreso(Money::create(120.00), 'Venta: Combo para 4 personas');
$caja->registrarIngreso(Money::create(30.25), 'Venta: 2 cafés + 1 dona');

// Total acumulado
echo $caja->getMontoActual()->toString(); // "770.75 PEN"
echo $caja->getTotalTransacciones();      // 4
```

### Paso 4: Gasto operativo (11:50 AM)

```php
// Juan usa efectivo de caja para pagar un proveedor pequeño
$caja->registrarEgreso(
    monto: Money::create(100.00),
    descripcion: 'Pago a proveedor de bolsas de papel'
);

echo $caja->getMontoActual()->toString(); // "670.75 PEN"
```

### Paso 5: Más ventas tarde (12:00 - 5:00 PM)

```php
// Continúan las ventas
$caja->registrarIngreso(Money::create(89.99), 'Venta: Lunch time');
$caja->registrarIngreso(Money::create(45.50), 'Venta: Merienda');
$caja->registrarIngreso(Money::create(200.00), 'Venta: Evento corporativo');

// Nuevo total
echo $caja->getMontoActual()->toString(); // "1006.24 PEN"
echo $caja->getTotalTransacciones();      // 7
```

### Paso 6: Cierre de caja (5:00 PM)

```php
// Juan cuenta el dinero en caja
// - Billetes: 1000 PEN
// - Monedas: 6.50 PEN
// - Total contado: 1006.50 PEN

$montoReal = Money::create(1006.50);

$caja->arquearYCerrar($montoReal);

// Verificar resultado del cierre
echo $caja->estaCerrada();              // true
echo $caja->getMontoActual()->toString();    // "1006.24 PEN" (teórico)
echo $caja->getMontoFinalCierre()->toString(); // "1006.50 PEN" (real)
echo $caja->getDiferencia()->toString();      // "0.26 PEN" (sobrante)

if ($caja->haySobrante()) {
    echo "✅ Sobrante: " . $caja->getDiferencia()->toString();
}
```

### Paso 7: Procesar eventos

```php
// Obtener todos los eventos del día
$eventos = $caja->getEventosDominio();

foreach ($eventos as $evento) {
    $datos = $evento->toArray();
    
    // Podrían:
    // - Guardarse en BD para auditoría
    // - Enviarse a otros servicios
    // - Usarse para reportes
    
    print_r($datos);
}

/* Output:
[
    [evento] => CajaAbierta
    [caja_id] => ...
    [vendedor_id] => vendedor_juan
    [monto_apertura] => 500.00 PEN
    ...
]
*/

// Limpiar eventos (ya procesados)
$caja->limpiarEventos();
```

---

## 🔍 Escenarios de Validación

### Intento de registrar en caja cerrada

```php
$caja->arquearYCerrar(Money::create(1006.50));

// Intentar registrar más
try {
    $caja->registrarIngreso(Money::create(50), 'Venta tardía');
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
    // Output: "No se pueden registrar transacciones en una caja cerrada."
}
```

### Montos inválidos

```php
// Intento con monto negativo
try {
    $caja->registrarIngreso(Money::create(-50), 'Venta negativa');
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
    // Output: "El monto debe ser positivo."
}
```

### Tipo de transacción inválido

```php
use Finanzas\Domain\ValueObjects\TransactionType;

try {
    $tipo = TransactionType::from('tipo_inexistente');
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
    // Output: "El tipo de transacción 'tipo_inexistente' no es válido..."
}
```

---

## 📊 Consultas en Repositorio

### Buscar caja específica

```php
use Finanzas\Domain\Repositories\CajaRepository;

// Inyectado en servicio/use case
public function __construct(private CajaRepository $repo) {}

// Buscar por ID
$caja = $this->repo->search('550e8400-e29b-41d4-a716-446655440000');

if ($caja === null) {
    echo "Caja no encontrada";
} else {
    echo $caja->getMontoActual()->toString();
}
```

### Obtener caja abierta del vendedor

```php
// Verificar si vendedor ya tiene caja abierta
$cajaAbierta = $this->repo->findOpenByVendedor('vendedor_juan');

if ($cajaAbierta !== null) {
    echo "Juan ya tiene caja abierta";
    echo $cajaAbierta->getMontoActual()->toString();
} else {
    echo "Juan puede abrir nueva caja";
}
```

### Obtener todas las cajas del vendedor

```php
// Ver historial del vendedor
$cajas = $this->repo->findByVendedor('vendedor_juan');

foreach ($cajas as $caja) {
    echo "Caja: " . $caja->getId();
    echo " | Estado: " . $caja->getEstado();
    echo " | Monto: " . $caja->getMontoActual()->toString();
    echo "\n";
}
```

### Analizar cajas de hoy

```php
$hoy = new DateTime();
$hoy_inicio = (clone $hoy)->setTime(0, 0, 0);
$hoy_fin = (clone $hoy)->setTime(23, 59, 59);

$cajasDehoy = $this->repo->findCerradasPorFecha($hoy_inicio, $hoy_fin);

$totalVentas = Money::zero();
$totalFaltantes = Money::zero();

foreach ($cajasDehoy as $caja) {
    $totalVentas = $totalVentas->add(
        $caja->getMontoActual()->subtract($caja->getMontoApertura())
    );
    
    if ($caja->hayFaltante()) {
        $totalFaltantes = $totalFaltantes->add(
            $caja->getDiferencia()->absolute()
        );
    }
}

echo "Total vendido hoy: " . $totalVentas->toString();
echo "Total faltantes: " . $totalFaltantes->toString();
```

---

## 🎓 TransactionType - Todos los usos

```php
use Finanzas\Domain\ValueObjects\TransactionType;

// Crear instancias
$venta = TransactionType::ingresoVenta();
$gasto = TransactionType::egresoOperativo();
$cierre = TransactionType::cierreCaja();

// Desde string
$tipo = TransactionType::from('ingreso_venta');

// Consultas
if ($tipo->esIngresoVenta()) {
    echo "Es una venta";
}

if ($tipo->esIngreso()) {
    echo "Suma dinero";
} elseif ($tipo->esEgreso()) {
    echo "Resta dinero";
}

// Información legible
echo $tipo->nombre();       // "Ingreso por Venta"
echo $tipo->descripcion();  // Descripción detallada
echo $tipo->value();        // "ingreso_venta"

// Comparación
if ($venta->equals($tipo)) {
    echo "Es el mismo tipo";
}

// Listar todos
$tipos = TransactionType::getTiposValidos();
// ['ingreso_venta', 'egreso_operativo', 'cierre_caja']
```

---

## 💡 Patrones Comunes

### Pattern: Modelo Rico

La lógica está EN la entidad, no fuera:

```php
// ✅ CORRECTO
class Caja {
    public function registrarIngreso(Money $monto, string $desc): void
    {
        $this->validarCajaAbierta();           // Lógica de validación
        $this->validarMontoPositivo($monto);   // Lógica de validación
        $this->monto_actual = $this->monto_actual->add($monto); // Lógica
        $this->registrarEvento(...);           // Lógica de eventos
    }
}

// ❌ INCORRECTO
class CajaService {
    public function registrarIngreso(Caja $caja, Money $monto): void
    {
        // Validaciones afuera → Modelo anémico
        if (!$this->validar($caja)) throw ...;
        
        // Lógica de negocio afuera
        $caja->monto_actual += $monto->value();
    }
}
```

### Pattern: Eventos de Dominio

Cada operación registra qué sucedió:

```php
// Los eventos permiten:
// 1. Auditoría: "¿Qué pasó?"
// 2. Integración: Notificar otros servicios
// 3. Reportes: Analizar históricos
// 4. Replicación: Reconstruir estado

$eventos = $caja->getEventosDominio();

// Guardar para auditoría
foreach ($eventos as $evento) {
    $auditLog->registrar($evento->toArray());
}

// Enviar a otros servicios
foreach ($eventos as $evento) {
    $this->eventBus->publish($evento);
}
```

### Pattern: Repository

Abstracción del almacenamiento:

```php
// Domain define la interfaz
interface CajaRepository {
    public function save(Caja $caja): void;
    public function search(string $id): ?Caja;
}

// Infrastructure la implementa (con Eloquent, MongoDB, etc)
class EloquentCajaRepository implements CajaRepository {
    public function save(Caja $caja): void {
        // Convertir agregado a modelo Eloquent y guardar
    }
}

// Application la inyecta
class AbrirCajaUseCase {
    public function __construct(private CajaRepository $repo) {}
}
```

---

## 🧪 Testing

```php
use PHPUnit\Framework\TestCase;
use Finanzas\Domain\Aggregates\Caja;
use Shared\Domain\ValueObjects\Money;

class CajaTest extends TestCase
{
    public function test_abrir_caja()
    {
        $caja = Caja::abrir(
            id: 'test-123',
            vendedor_id: 'vendedor_1',
            monto_apertura: Money::create(500)
        );

        $this->assertTrue($caja->estaAbierta());
        $this->assertEquals('500.00', $caja->getMontoActual()->getAmount());
        $this->assertCount(1, $caja->getEventosDominio());
    }

    public function test_registrar_ingreso()
    {
        $caja = Caja::abrir('test-123', 'vendedor_1', Money::create(500));
        $caja->registrarIngreso(Money::create(100), 'Venta');

        $this->assertEquals('600.00', $caja->getMontoActual()->getAmount());
        $this->assertEquals(2, count($caja->getEventosDominio()));
    }

    public function test_no_permite_transaccion_en_caja_cerrada()
    {
        $caja = Caja::abrir('test-123', 'vendedor_1', Money::create(500));
        $caja->arquearYCerrar(Money::create(500));

        $this->expectException(InvalidArgumentException::class);
        $caja->registrarIngreso(Money::create(100), 'Venta tardía');
    }
}
```

---

## 📚 Resumen Rápido

| Componente | Propósito | Ubicación |
|-----------|-----------|-----------|
| **TransactionType** | Enum de tipos de transacciones | `Domain/ValueObjects/` |
| **Caja** | Modelo Rico con lógica de negocio | `Domain/Aggregates/` |
| **CajaAbierta** | Evento: caja abierta | `Domain/Events/` |
| **TransaccionRegistrada** | Evento: transacción realizada | `Domain/Events/` |
| **CajaCerrada** | Evento: caja cerrada | `Domain/Events/` |
| **CajaRepository** | Interfaz de persistencia | `Domain/Repositories/` |

---

**¡La capa de Dominio es sólida y lista! 🏗️**

Próximo paso: Crear los Use Cases en la capa Application.
