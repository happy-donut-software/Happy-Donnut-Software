# 🏛️ Capa de Aplicación - Resumen Completo

## 📊 Estado de Implementación

La **Capa de Aplicación** ha sido completamente implementada con todos los componentes necesarios:

```
app/src/Finanzas/Application/
├── UseCases/
│   ├── AbrirCajaUseCase.php              ✅ Completo
│   ├── RegistrarIngresoUseCase.php       ✅ Completo
│   ├── RegistrarEgresoUseCase.php        ✅ Completo
│   └── CerrarCajaUseCase.php             ✅ Completo
├── Exceptions/
│   ├── CajaNotFoundException.php          ✅ Completo
│   ├── CajaCerradaException.php           ✅ Completo
│   └── TransaccionInvalidaException.php   ✅ Completo
└── DTOs/
    ├── CajaAperturaRequest.php            ✅ Completo
    ├── TransaccionRequest.php             ✅ Completo
    ├── CajaCierreRequest.php              ✅ Completo
    ├── CajaResponse.php                   ✅ Completo
    ├── TransaccionResponse.php            ✅ Completo
    └── CajaCierreResponse.php             ✅ Completo
```

---

## 🎯 Componentes Principales

### 1️⃣ Use Cases (Orquestadores de Lógica de Negocio)

#### `AbrirCajaUseCase`
**Propósito**: Orquestar la apertura de una nueva caja

```php
public function execute(
    string $vendedorId,
    float $montoAperturaPen
): Caja
```

**Flujo**:
1. Convierte float → Money
2. Genera UUID para caja
3. Llama `Caja::abrir()` en dominio
4. Persiste via `CajaRepository::save()`
5. Retorna Caja

**Excepciones**: InvalidArgumentException (de Money)

---

#### `RegistrarIngresoUseCase`
**Propósito**: Registrar transacción de ingreso en una caja

```php
public function execute(
    string $cajaId,
    float $montoPen,
    string $descripcion
): void
```

**Flujo**:
1. Busca caja en repositorio
2. Valida existencia (CajaNotFoundException)
3. Convierte float → Money
4. Llama `$caja->registrarIngreso()` en dominio
5. Persiste via repositorio

**Excepciones**: 
- CajaNotFoundException
- InvalidArgumentException

---

#### `RegistrarEgresoUseCase`
**Propósito**: Registrar transacción de egreso en una caja

**Identical** a RegistrarIngresoUseCase, pero llama:
- `$caja->registrarEgreso()` en lugar de `registrarIngreso()`

---

#### `CerrarCajaUseCase`
**Propósito**: Cerrar caja con reconciliación

```php
public function execute(
    string $cajaId,
    float $montoFinalRealPen
): void
```

**Flujo**:
1. Busca caja
2. Valida existencia
3. Convierte float → Money
4. Llama `$caja->arquearYCerrar()` en dominio
5. Persiste via repositorio

**Excepciones**: CajaNotFoundException

---

### 2️⃣ Excepciones (Señales de Error)

| Excepción | Código HTTP | Caso de Uso |
|-----------|-------------|-----------|
| `CajaNotFoundException` | 404 | Caja no existe |
| `CajaCerradaException` | 422 | Operación en caja cerrada |
| `TransaccionInvalidaException` | 422 | Parámetros inválidos |
| `InvalidArgumentException` (Money) | 400 | Monto inválido |

**Ejemplo de mapeo en Controller**:
```php
try {
    $this->abrirCaja->execute($vendedor_id, $monto);
} catch (CajaNotFoundException $e) {
    return response()->json(['error' => $e->getMessage()], 404);
} catch (InvalidArgumentException $e) {
    return response()->json(['error' => $e->getMessage()], 400);
}
```

---

### 3️⃣ DTOs de Entrada (Request)

#### `CajaAperturaRequest`
```php
new CajaAperturaRequest(
    vendedorId: string,      // ID del vendedor
    montoAperturaPen: float  // Monto inicial en PEN
)
```

**Factory**: `fromArray(array)` - Crea desde JSON/form data
**Validación**: Ninguna (la hace el controller con request validation)

---

#### `TransaccionRequest`
```php
new TransaccionRequest(
    cajaId: string,        // ID de la caja
    montoPen: float,       // Monto en PEN
    descripcion: string    // Descripción de la transacción
)
```

**Factory**: `fromArray(string $cajaId, array $data)`
**Validaciones internas**:
- `cajaId` no vacío
- `montoPen` > 0
- `descripcion` entre 3-255 caracteres
- Métodos: `validar(): array`, `esValido(): bool`

---

#### `CajaCierreRequest`
```php
new CajaCierreRequest(
    cajaId: string,           // ID de la caja
    montoFinalRealPen: float  // Monto contado físicamente
)
```

**Factory**: `fromArray(string $cajaId, array $data)`
**Validaciones**:
- `cajaId` no vacío
- `montoFinalRealPen` >= 0

---

### 4️⃣ DTOs de Salida (Response)

#### `CajaResponse`
Transforma agregado `Caja` → JSON

```json
{
  "id": "uuid...",
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

**Methods**:
- `fromAggregate(Caja): self` - Crear desde agregado
- `toArray(): array` - Estructura completa
- `getResumen(): array` - Versión resumida
- `toJson(): string` - JSON string

---

#### `TransaccionResponse`
Transforma evento `TransaccionRegistrada` → JSON

```json
{
  "caja_id": "uuid...",
  "tipo": "INGRESO_VENTA",
  "monto": 45.50,
  "descripcion": "Venta: 2 donas + 1 café",
  "monto_actual_post": 545.50,
  "fecha": "2024-01-15T08:15:00+00:00"
}
```

**Methods**:
- `fromEvent(TransaccionRegistrada): self`
- `esIngreso(): bool`, `esEgreso(): bool`

---

#### `CajaCierreResponse`
Transforma evento `CajaCerrada` con análisis → JSON

```json
{
  "caja_id": "uuid...",
  "vendedor_id": "juan",
  "monto_teórico": 985.49,
  "monto_real": 1084.50,
  "diferencia": 99.01,
  "cuadra_perfectamente": false,
  "hay_faltante": false,
  "hay_sobrante": true,
  "resumen": {
    "estado": "SOBRANTE",
    "mensaje": "✅ Hay sobrante de 99.01 PEN"
  },
  "fecha_cierre": "2024-01-15T17:00:00+00:00"
}
```

**Methods**:
- `fromEvent(CajaCerrada): self`
- `getMensajeAmigable(): string` - Texto para usuario
- `getResumen(): array` - Análisis ejecutivo

---

## 📐 Arquitectura & Patrones

### Patrón: Application Layer Responsibility

```
┌─────────────────────────────────────────────────────────┐
│ ENTRADA (HTTP API)                                      │
│ - Valida input con Symfony/Validate o Laravel Validator │
│ - Crea DTO Request                                       │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│ CAPA DE APLICACIÓN (Use Cases)                          │
│ - Recibe DTO primitivo                                  │
│ - Convierte a Value Objects                             │
│ - Orquesta llamadas al dominio                          │
│ - Persiste via Repository                              │
│ - Retorna Agregado                                      │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│ CAPA DE DOMINIO (Business Logic)                        │
│ - Valida reglas de negocio                              │
│ - Genera eventos de dominio                             │
│ - Mantiene invariantes                                  │
│ - Retorna estado modificado                             │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│ CAPA DE INFRAESTRUCTURA (Persistence)                   │
│ - Implementa repositorio                                │
│ - Mapea a base de datos                                 │
│ - Executa queries                                       │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│ SALIDA (HTTP API)                                       │
│ - Crea DTO Response desde Agregado/Evento               │
│ - Convierte a JSON                                      │
│ - Retorna con código HTTP                               │
└─────────────────────────────────────────────────────────┘
```

### Ventajas de esta Arquitectura

✅ **Separación de Responsabilidades**
- Entrada/Salida (DTOs) desacoplada de lógica
- Dominio puro sin dependencias

✅ **Testabilidad**
- Use Cases se testean sin HTTP
- Mock de repositorio inyectado
- Dominio testeable sin base de datos

✅ **Mantenibilidad**
- Cambios en API no afectan dominio
- Reglas de negocio centralizadas
- Persistencia intercambiable

✅ **Escalabilidad**
- Fácil agregar nuevos Use Cases
- Dominio reutilizable en múltiples contextos
- Events para audit/logging/notifications

---

## 🔄 Flujo de Ejemplo: Día Completo

```php
// 1. APERTURA - POST /api/cajas
$req = new CajaAperturaRequest('juan', 500.00);
$caja = $abrirCaja->execute($req->vendedorId, $req->montoAperturaPen);
$res = CajaResponse::fromAggregate($caja);
// → { id: "...", monto_actual: 500, estado: "abierta" }

// 2. VENTA 1 - POST /api/cajas/{id}/ingresos
$req = new TransaccionRequest($cajaId, 150.00, 'Venta 1');
$registrarIngreso->execute($req->cajaId, $req->montoPen, $req->descripcion);
// Actualiza dominio, persiste

// 3. VENTA 2 - POST /api/cajas/{id}/ingresos
$req = new TransaccionRequest($cajaId, 120.00, 'Venta 2');
$registrarIngreso->execute($req->cajaId, $req->montoPen, $req->descripcion);

// 4. CAMBIO - POST /api/cajas/{id}/egresos
$req = new TransaccionRequest($cajaId, 50.00, 'Cambio cliente');
$registrarEgreso->execute($req->cajaId, $req->montoPen, $req->descripcion);

// 5. CIERRE - POST /api/cajas/{id}/cierre
$req = new CajaCierreRequest($cajaId, 720.00);  // Lo que Juan contó
$cerrarCaja->execute($req->cajaId, $req->montoFinalRealPen);

// 6. RESPUESTA DEL CIERRE
$caja = $repository->search($cajaId);
$evento = $caja->getCajaCerradaEvent();
$res = CajaCierreResponse::fromEvent($evento);
// → { estado: "SOBRANTE", diferencia: 0, ... }
```

---

## 🧪 Testing

### Unit Test de Use Case

```php
class AbrirCajaUseCaseTest extends TestCase
{
    private $mockRepo;
    private $useCase;

    protected function setUp(): void
    {
        $this->mockRepo = $this->createMock(CajaRepository::class);
        $this->useCase = new AbrirCajaUseCase($this->mockRepo);
    }

    public function test_abrir_caja_exitosamente()
    {
        // Arrange
        $this->mockRepo->expects($this->once())->method('save');

        // Act
        $caja = $this->useCase->execute('juan', 500.00);

        // Assert
        $this->assertTrue($caja->estaAbierta());
        $this->assertEquals(500.00, $caja->getMontoActual()->getAmountAsFloat());
    }

    public function test_lanza_excepcion_monto_negativo()
    {
        // Assert
        $this->expectException(InvalidArgumentException::class);

        // Act
        $this->useCase->execute('juan', -100.00);
    }
}
```

### Integration Test

```php
class CajaUseCaseIntegrationTest extends TestCase
{
    public function test_flujo_completo_dia()
    {
        // 1. Abrir
        $caja = $this->abrirCaja->execute('juan', 500.00);
        $this->assertDatabaseHas('cajas', [
            'id' => $caja->getId(),
            'estado' => 'abierta',
        ]);

        // 2. Ingresos
        $this->registrarIngreso->execute(
            $caja->getId(),
            150.00,
            'Venta 1'
        );
        
        $caja = $this->repository->search($caja->getId());
        $this->assertEquals(650.00, $caja->getMontoActual()->getAmountAsFloat());

        // 3. Cierre
        $this->cerrarCaja->execute($caja->getId(), 650.00);
        
        $caja = $this->repository->search($caja->getId());
        $this->assertFalse($caja->estaAbierta());
        $this->assertTrue($caja->getDiferencia()->isZero());
    }
}
```

---

## 📋 Checklist de Completitud

### Use Cases
- [x] `AbrirCajaUseCase` - Implementado y documentado
- [x] `RegistrarIngresoUseCase` - Implementado y documentado
- [x] `RegistrarEgresoUseCase` - Implementado y documentado
- [x] `CerrarCajaUseCase` - Implementado y documentado
- [x] Dependency Injection en todos

### Excepciones
- [x] `CajaNotFoundException` - Implementada
- [x] `CajaCerradaException` - Implementada
- [x] `TransaccionInvalidaException` - Implementada
- [x] Documentación de códigos HTTP

### DTOs Request
- [x] `CajaAperturaRequest` - Implementado
- [x] `TransaccionRequest` - Implementado con validación
- [x] `CajaCierreRequest` - Implementado con validación
- [x] Factory methods `fromArray()`

### DTOs Response
- [x] `CajaResponse` - Implementado
- [x] `TransaccionResponse` - Implementado
- [x] `CajaCierreResponse` - Implementado con análisis
- [x] Métodos de serialización

### Documentación
- [x] `APPLICATION_EXAMPLES.md` - Ejemplos prácticos
- [x] `DTOS_AND_EXCEPTIONS.md` - Referencia completa
- [x] Este documento - Resumen arquitectónico
- [x] Comentarios inline en código

---

## 🚀 Próximos Pasos

La capa de aplicación está **100% completa**. 

**Próximas capas a implementar**:

1. **Capa de Infraestructura**
   - [ ] Eloquent Models (CajaEloquent)
   - [ ] CajaRepositoryEloquent
   - [ ] Database Migrations
   - [ ] Query Builders

2. **Capa de Presentación (HTTP)**
   - [ ] CajaController
   - [ ] Route Definitions
   - [ ] Request Validation
   - [ ] Exception Handlers

3. **Event Listeners**
   - [ ] CajaAbiertaListener
   - [ ] TransaccionRegistradaListener
   - [ ] CajaCerradaListener

4. **Testing**
   - [ ] Use Case tests
   - [ ] Integration tests
   - [ ] API tests (Feature tests)

---

**¡La capa de aplicación proporciona la interfaz limpia y profesional del sistema! ✨**
