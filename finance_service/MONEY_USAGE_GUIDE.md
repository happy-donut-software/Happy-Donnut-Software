# 💰 Guía de Uso del Value Object Money

## 📖 Ejemplos Prácticos

### Importar Money
```php
use Shared\Domain\ValueObjects\Money;
```

---

## 🎯 Casos de Uso - Cafetería Happy Donut

### 1️⃣ Registrar Venta Simple
```php
// Cliente compra 2 donas a 15 soles cada una
$precio_por_dona = Money::create(15.00);
$cantidad = 2;

$total_venta = $precio_por_dona->multiply($cantidad);
echo $total_venta->toString();  // Output: "30.00 PEN"
```

### 2️⃣ Aplicar Descuento
```php
$subtotal = Money::create(100.00);
$descuento = Money::create(10.00);

$total = $subtotal->subtract($descuento);
echo $total->toString();  // Output: "90.00 PEN"
```

### 3️⃣ Sumar Múltiples Ventas (Caja del día)
```php
$venta1 = Money::create(150.50);
$venta2 = Money::create(230.00);
$venta3 = Money::create(87.75);

$caja_diaria = $venta1
    ->add($venta2)
    ->add($venta3);

echo "Total del día: " . $caja_diaria->toString();
// Output: "Total del día: 468.25 PEN"
```

### 4️⃣ Calcular Promedio de Ventas
```php
$total_ingresos = Money::create(1000.00);
$numero_de_horas = 8;

$promedio_por_hora = $total_ingresos->divide($numero_de_horas);
echo "Promedio/hora: " . $promedio_por_hora->toString();
// Output: "Promedio/hora: 125.00 PEN"
```

### 5️⃣ Registrar Egresos (Montos Negativos)
```php
// Pago a proveedores
$pago_proveedor = Money::create(-500.00);

// Pago de servicios
$pago_servicios = Money::create(-150.00);

// Total de egresos
$total_egresos = $pago_proveedor->add($pago_servicios);
echo $total_egresos->toString();  // Output: "-650.00 PEN"
```

### 6️⃣ Reconciliación de Caja (Ingresos - Egresos)
```php
$ingresos = Money::create(1200.00);
$egresos = Money::create(-500.00);

$neto = $ingresos->add($egresos);
echo "Neto del día: " . $neto->toString();
// Output: "Neto del día: 700.00 PEN"
```

### 7️⃣ Verificar si hay Pérdida o Ganancia
```php
$ingresos = Money::create(500.00);
$gastos = Money::create(-600.00);

$balance = $ingresos->add($gastos);

if ($balance->isNegative()) {
    echo "⚠️ Pérdida del día: " . $balance->absolute()->toString();
} elseif ($balance->isPositive()) {
    echo "✅ Ganancia del día: " . $balance->toString();
} else {
    echo "⚪ Sin cambios";
}
// Output: "⚠️ Pérdida del día: 100.00 PEN"
```

---

## 🔧 Métodos Disponibles

### Creación
```php
// Crear con monto específico
$dinero = Money::create(150.50);

// Crear con cero
$vacio = Money::zero();

// Crear monto negativo
$deuda = Money::create(-100);
```

### Operaciones Aritméticas
```php
$a = Money::create(100);
$b = Money::create(50);

// Suma
$suma = $a->add($b);              // 150.00

// Resta
$resta = $a->subtract($b);        // 50.00

// Multiplicación
$mult = $a->multiply(2);          // 200.00

// División
$div = $a->divide(2);             // 50.00

// Valor absoluto
$abs = Money::create(-100)->absolute();  // 100.00

// Negación (cambiar signo)
$neg = Money::create(100)->negate();     // -100.00
```

### Comparaciones
```php
$a = Money::create(100);
$b = Money::create(50);

// Mayor que
$a->isGreaterThan($b);            // true

// Mayor o igual
$a->isGreaterThanOrEqual($b);     // true

// Menor que
$a->isLessThan($b);               // false

// Menor o igual
$a->isLessThanOrEqual($b);        // false

// Igual
$a->equals(Money::create(100));   // true
```

### Información
```php
$dinero = Money::create(123.45);

// Obtener como string
$dinero->getAmount();             // "123.45"

// Obtener como float
$dinero->getAmountAsFloat();      // 123.45

// Obtener como entero (en centavos)
$dinero->getAmountAsInt();        // 12345

// Obtener moneda
$dinero->getCurrency();           // "PEN"

// Verificar si es positivo
$dinero->isPositive();            // true

// Verificar si es negativo
$dinero->isNegative();            // false

// Verificar si es cero
$dinero->isZero();                // false

// Representación en string
$dinero->toString();              // "123.45 PEN"

// O usar el magic method
(string)$dinero;                  // "123.45 PEN"
```

---

## ⛓️ Encadenamiento de Métodos

Money permite encadenar operaciones (method chaining):

```php
$dinero = Money::create(100)
    ->add(Money::create(50))       // 150
    ->multiply(2)                  // 300
    ->subtract(Money::create(100)) // 200
    ->divide(2);                   // 100

echo $dinero->toString();  // "100.00 PEN"
```

---

## 🛡️ Validaciones y Errores

### Monedas Diferentes
```php
try {
    $pen = Money::create(100);
    $usd = Money::create(50, 'USD');  // ❌ Error: moneda no soportada
} catch (InvalidArgumentException $e) {
    echo "Error: " . $e->getMessage();
}
```

### Monto Inválido
```php
try {
    $dinero = Money::create('abc');  // ❌ Error: no es número
} catch (InvalidArgumentException $e) {
    echo "Error: " . $e->getMessage();
}
```

### División por Cero
```php
try {
    $dinero = Money::create(100);
    $resultado = $dinero->divide(0);  // ❌ Error
} catch (InvalidArgumentException $e) {
    echo "Error: " . $e->getMessage();
}
```

---

## 📊 Escenario Completo: Sistema de Caja

```php
use Shared\Domain\ValueObjects\Money;

class CajaDiaria {
    private Money $ventas;
    private Money $gastos;
    
    public function __construct() {
        $this->ventas = Money::zero();
        $this->gastos = Money::zero();
    }
    
    public function agregarVenta(Money $monto): void {
        $this->ventas = $this->ventas->add($monto);
    }
    
    public function agregarGasto(Money $monto): void {
        $this->gastos = $this->gastos->add($monto);
    }
    
    public function getBalance(): Money {
        return $this->ventas->add($this->gastos);
    }
    
    public function getResumen(): array {
        $balance = $this->getBalance();
        
        return [
            'ventas' => $this->ventas->toString(),
            'gastos' => $this->gastos->toString(),
            'balance' => $balance->toString(),
            'estado' => $balance->isPositive() ? 'Ganancia' : 'Pérdida'
        ];
    }
}

// Uso
$caja = new CajaDiaria();

// Registrar ventas
$caja->agregarVenta(Money::create(150.00));
$caja->agregarVenta(Money::create(230.50));
$caja->agregarVenta(Money::create(87.75));

// Registrar gastos
$caja->agregarGasto(Money::create(-100.00));  // Gasto
$caja->agregarGasto(Money::create(-50.00));   // Otro gasto

// Ver resumen
$resumen = $caja->getResumen();
print_r($resumen);

/* Output:
Array
(
    [ventas] => 468.25 PEN
    [gastos] => -150.00 PEN
    [balance] => 318.25 PEN
    [estado] => Ganancia
)
*/
```

---

## 🧪 Testing Money en Tinker

```bash
# Acceder a Tinker
docker-compose exec app php artisan tinker
```

### Pruebas Interactivas
```php
>>> use Shared\Domain\ValueObjects\Money;

// Crear dinero
>>> $din = Money::create(100.50);
>>> $din->toString();
=> "100.50 PEN"

// Operaciones
>>> $din->add(Money::create(50))->toString();
=> "150.50 PEN"

// Verificar
>>> $din->isPositive();
=> true

>>> $din->isGreaterThan(Money::create(100));
=> true

// Montos negativos
>>> $gasto = Money::create(-50);
>>> $gasto->toString();
=> "-50.00 PEN"

// Operación con negativo
>>> $din->add($gasto)->toString();
=> "50.50 PEN"

// Encadenamiento
>>> Money::create(100)
... ->multiply(2)
... ->subtract(Money::create(50))
... ->divide(2)
... ->toString()
=> "75.00 PEN"
```

---

## 📝 Notas Importantes

1. **Inmutabilidad**: Cada operación retorna una NUEVA instancia
   ```php
   $original = Money::create(100);
   $modificado = $original->add(Money::create(50));
   
   // $original sigue siendo 100.00
   echo $original->toString();      // "100.00 PEN"
   echo $modificado->toString();    // "150.00 PEN"
   ```

2. **Precisión**: Siempre mantiene 2 decimales
   ```php
   $dinero = Money::create(100.999);
   echo $dinero->toString();  // "101.00 PEN" (redondeado)
   ```

3. **Negativo Permitido**: Para egresos/deudas
   ```php
   $deuda = Money::create(-1000);
   echo $deuda->isNegative();  // true
   ```

4. **Una Moneda**: Solo PEN
   ```php
   // Solo esta línea funciona:
   $pen = Money::create(100);
   
   // Esta lanza error:
   // $usd = Money::create(100, 'USD');
   ```

---

## 🎓 Próximo Paso

Ahora que entiendes Money, crea tu primer agregado:

1. Abre: `app/src/Finanzas/Domain/Aggregates/`
2. Crea: `Transaccion.php`
3. Usa: Money en tus agregados

¡Feliz desarrollo! 🚀
