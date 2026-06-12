# 📋 DTOs y Excepciones - Capa de Aplicación

## 📍 Propósito

Los **DTOs** (Data Transfer Objects) y **Excepciones** son la interfaz pública de la capa de aplicación. Son el puente entre:

```
API HTTP / Controller
    ↓
DTOs (Request) - Validación de entrada
    ↓
Use Cases - Orquestación
    ↓
Dominio (Agregados, Eventos)
    ↓
DTOs (Response) - Transformación de salida
    ↓
API HTTP Response JSON
```

---

## 🎯 Excepciones de Aplicación

### `CajaNotFoundException`

Se lanza cuando un Use Case intenta buscar una caja que no existe.

```php
use Finanzas\Application\Exceptions\CajaNotFoundException;

try {
    $caja = $repository->search('id-inexistente');
    if (null === $caja) {
        throw new CajaNotFoundException('id-inexistente');
    }
} catch (CajaNotFoundException $e) {
    // HTTP 404
    echo "Caja no encontrada: " . $e->getCajaId();
}
```

**Caso de uso**: En RegistrarIngresoUseCase, RegistrarEgresoUseCase, CerrarCajaUseCase

---

### `CajaCerradaException`

Se lanza cuando se intenta operar sobre una caja que ya está cerrada.

```php
use Finanzas\Application\Exceptions\CajaCerradaException;

try {
    $caja = $repository->search($cajaId);
    if ($caja->estaCerrada()) {
        throw new CajaCerradaException($cajaId, 'registrar ingreso');
    }
} catch (CajaCerradaException $e) {
    // HTTP 422
    echo $e->getMessage();  
    // "No se puede realizar 'registrar ingreso' en la caja '...' porque está cerrada."
}
```

**Caso de uso**: En RegistrarIngresoUseCase, RegistrarEgresoUseCase cuando detectan caja cerrada

---

### `TransaccionInvalidaException`

Se lanza cuando hay un error con los parámetros de una transacción.

```php
use Finanzas\Application\Exceptions\TransaccionInvalidaException;

try {
    if ($monto <= 0) {
        throw new TransaccionInvalidaException(
            'El monto debe ser mayor a 0',
            $cajaId
        );
    }
} catch (TransaccionInvalidaException $e) {
    // HTTP 422
    echo $e->getRazon();
    echo $e->getCajaId();
}
```

**Caso de uso**: En cualquier validación de transacción

---

## 📨 DTOs de Solicitud (Input)

### `CajaAperturaRequest`

```php
use Finanzas\Application\DTOs\CajaAperturaRequest;

// En Controller
$request_data = [
    'vendedor_id' => 'juan',
    'monto' => 500.00,
];

$dto = CajaAperturaRequest::fromArray($request_data);
// o manualmente
$dto = new CajaAperturaRequest('juan', 500.00);

// Enviar al Use Case
$caja = $this->abrirCaja->execute(
    $dto->vendedorId,
    $dto->montoAperturaPen
);
```

**Propiedades públicas de solo lectura:**
- `vendedorId: string` - ID del vendedor
- `montoAperturaPen: float` - Monto en PEN

**Métodos:**
- `fromArray(array): self` - Factory desde array
- `toArray(): array` - Convierte a array

---

### `TransaccionRequest`

```php
use Finanzas\Application\DTOs\TransaccionRequest;

// En Controller - POST /cajas/{cajaId}/ingresos
$request_data = [
    'monto' => 45.50,
    'descripcion' => 'Venta: 2 donas + 1 café',
];

// El cajaId viene de la ruta
$dto = TransaccionRequest::fromArray($cajaId, $request_data);

// Validar antes de usar
if (!$dto->esValido()) {
    $errores = $dto->validar();
    // ['monto' => 'El monto debe ser mayor a 0', ...]
    return response()->json($errores, 422);
}

// Enviar al Use Case
$this->registrarIngreso->execute(
    $dto->cajaId,
    $dto->montoPen,
    $dto->descripcion
);
```

**Propiedades públicas de solo lectura:**
- `cajaId: string` - ID de la caja
- `montoPen: float` - Monto en PEN
- `descripcion: string` - Descripción

**Métodos:**
- `fromArray(string $cajaId, array $data): self` - Factory
- `toArray(): array` - Convierte a array
- `validar(): array` - Retorna array de errores
- `esValido(): bool` - Verifica validez

**Validaciones automáticas:**
- cajaId no vacío
- montoPen > 0
- descripcion no vacía
- descripcion >= 3 caracteres
- descripcion <= 255 caracteres

---

### `CajaCierreRequest`

```php
use Finanzas\Application\DTOs\CajaCierreRequest;

// En Controller - POST /cajas/{cajaId}/cierre
$request_data = [
    'monto_real' => 680.50,  // Lo que Juan contó
];

$dto = CajaCierreRequest::fromArray($cajaId, $request_data);

// Validar
if (!$dto->esValido()) {
    return response()->json($dto->validar(), 422);
}

// Enviar al Use Case
$this->cerrarCaja->execute($dto->cajaId, $dto->montoFinalRealPen);
```

**Propiedades públicas de solo lectura:**
- `cajaId: string` - ID de la caja
- `montoFinalRealPen: float` - Monto real contado

**Métodos:**
- `fromArray(string $cajaId, array $data): self` - Factory
- `toArray(): array` - Convierte a array
- `validar(): array` - Retorna array de errores
- `esValido(): bool` - Verifica validez

**Validaciones:**
- cajaId no vacío
- montoFinalRealPen >= 0

---

## 📤 DTOs de Respuesta (Output)

### `CajaResponse`

Transforma el agregado Caja en una estructura JSON segura.

```php
use Finanzas\Application\DTOs\CajaResponse;

// En Controller, después de usar un Use Case
$caja = $this->abrirCaja->execute('juan', 500.00);

// Crear DTO de respuesta
$response = CajaResponse::fromAggregate($caja);

// Retornar como JSON
return response()->json($response->toArray(), 201);
```

**Método factory:**
- `fromAggregate(Caja $caja): self`

**Métodos de serialización:**
- `toArray(): array` - Estructura completa para JSON
- `getResumen(): array` - Resumen rápido
- `toJson(): string` - JSON string directo

**Ejemplo de respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "vendedor_id": "juan",
  "monto_apertura": 500.00,
  "monto_actual": 545.50,
  "estado": "abierta",
  "fecha_apertura": "2024-01-15T08:00:00+00:00",
  "fecha_cierre": null,
  "diferencia": null,
  "total_transacciones": 1
}
```

---

### `TransaccionResponse`

Transforma el evento TransaccionRegistrada en una estructura JSON.

```php
use Finanzas\Application\DTOs\TransaccionResponse;

// En el agregado después de una transacción
$caja = $repository->search($cajaId);
$eventos = $caja->getEventosDominio();

// Filtrar solo transacciones y convertir
$transacciones = array_map(
    fn($evento) => TransaccionResponse::fromEvent($evento)->toArray(),
    array_filter(
        $eventos,
        fn($e) => $e instanceof TransaccionRegistrada
    )
);
```

**Método factory:**
- `fromEvent(TransaccionRegistrada $evento): self`

**Métodos de utilidad:**
- `esIngreso(): bool` - Si es ingreso
- `esEgreso(): bool` - Si es egreso

**Ejemplo de respuesta:**
```json
{
  "caja_id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "INGRESO_VENTA",
  "monto": 45.50,
  "descripcion": "Venta: 2 donas + 1 café",
  "monto_actual_post": 545.50,
  "fecha": "2024-01-15T08:15:00+00:00"
}
```

---

### `CajaCierreResponse`

Transforma el evento CajaCerrada en una estructura con análisis de reconcilio.

```php
use Finanzas\Application\DTOs\CajaCierreResponse;

// En Controller después de cerrar
$caja = $repository->search($cajaId);
$evento_cierre = $caja->getCajaCerradaEvent();

$response = CajaCierreResponse::fromEvent($evento_cierre);

// Retornar con análisis
return response()->json($response->toArray(), 200);
```

**Métodos utiles:**
- `getMensajeAmigable(): string` - Texto para mostrar al usuario
- `getResumen(): array` - Resumen ejecutivo con estado

**Ejemplo de respuesta completa:**
```json
{
  "caja_id": "550e8400-e29b-41d4-a716-446655440000",
  "vendedor_id": "juan",
  "monto_teórico": 985.49,
  "monto_real": 1084.50,
  "diferencia": 99.01,
  "cuadra_perfectamente": false,
  "hay_faltante": false,
  "hay_sobrante": true,
  "resumen": {
    "estado": "SOBRANTE",
    "mensaje": "✅ Hay sobrante de 99.01 PEN",
    "diferencia_abs": 99.01
  },
  "fecha_cierre": "2024-01-15T17:00:00+00:00"
}
```

---

## 🔄 Patrón Completo en Controller

```php
<?php
namespace Finanzas\Infrastructure\Controllers;

use Finanzas\Application\UseCases\AbrirCajaUseCase;
use Finanzas\Application\UseCases\RegistrarIngresoUseCase;
use Finanzas\Application\DTOs\CajaAperturaRequest;
use Finanzas\Application\DTOs\TransaccionRequest;
use Finanzas\Application\DTOs\CajaResponse;
use Finanzas\Application\DTOs\TransaccionResponse;
use Finanzas\Application\Exceptions\CajaNotFoundException;
use Illuminate\Http\Request;

class CajaController
{
    public function __construct(
        private AbrirCajaUseCase $abrirCaja,
        private RegistrarIngresoUseCase $registrarIngreso,
    ) {}

    /**
     * Abrir caja
     * POST /api/cajas
     */
    public function store(Request $request)
    {
        // 1. Validar y crear DTO
        $dto = CajaAperturaRequest::fromArray($request->validated());
        
        try {
            // 2. Ejecutar Use Case
            $caja = $this->abrirCaja->execute(
                $dto->vendedorId,
                $dto->montoAperturaPen
            );

            // 3. Convertir a DTO de respuesta
            $response = CajaResponse::fromAggregate($caja);

            // 4. Retornar JSON
            return response()->json($response->toArray(), 201);
            
        } catch (InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Registrar ingreso
     * POST /api/cajas/{cajaId}/ingresos
     */
    public function registrarIngreso(string $cajaId, Request $request)
    {
        // 1. Validar y crear DTO
        $dto = TransaccionRequest::fromArray($cajaId, $request->validated());
        
        if (!$dto->esValido()) {
            return response()->json($dto->validar(), 422);
        }

        try {
            // 2. Ejecutar Use Case
            $this->registrarIngreso->execute(
                $dto->cajaId,
                $dto->montoPen,
                $dto->descripcion
            );

            // 3. Retornar caja actualizada
            $caja = $repository->search($cajaId);
            $response = CajaResponse::fromAggregate($caja);
            
            return response()->json($response->toArray(), 200);
            
        } catch (CajaNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
```

---

## ✅ Checklist de Implementación

- [ ] Todas las excepciones definidas y documentadas
- [ ] Todos los DTOs de request implementados
- [ ] Todos los DTOs de response implementados
- [ ] Controllers usando los DTOs correctamente
- [ ] Validación de entrada en DTOs
- [ ] Transformación de domain objects a DTOs en responses
- [ ] Manejo de excepciones en Controllers
- [ ] Retorno de códigos HTTP correctos (201, 200, 400, 404, 422, 500)

---

**¡Los DTOs y excepciones proporcionan la interfaz limpia de la capa de aplicación! 🚀**
