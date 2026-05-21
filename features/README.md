# Pruebas BDD con Behat - MVP Donut

## 📋 Estructura de Especificaciones Ejecutables

Este directorio contiene los archivos `.feature` que definen los comportamientos esperados del MVP según especificación Gherkin.

### Archivos de Especificación

```
features/
├── registro_ventas.feature         # Historia: Gestión de ventas y cálculo de vuelto (7 escenarios)
├── gestion_productos.feature       # Historia: Administración del catálogo (4 escenarios)
├── autenticacion_usuario.feature   # Historia: Autenticación y sesiones (4 escenarios)
├── gestion_inventario.feature      # Historia: Control de inventario (4 escenarios)
└── bootstrap/
    ├── FeatureContext.php          # Definiciones de pasos (Step Definitions)
    └── TestingAPI.php              # Adaptador de prueba - Inyecta casos de uso
```

**Total: 19 escenarios funcionales | 4+ historias de usuario**

---

## 🎯 Principios Arquitectónicos Aplicados

### ✅ Desacoplamiento Total
Los archivos `.feature` **NO** contienen:
- ❌ Selectores CSS (`#btn-guardar`, `.form-input`)
- ❌ Rutas HTTP (`GET /api/ventas`)
- ❌ Jerga técnica (`hacer clic`, `consultar tabla SQL`)
- ❌ Lógica de cálculo en aserciones (`total * 1.18`)

### ✅ Puertos Primarios (Hexágono)
Cada escenario invoca directamente un **Caso de Uso** del dominio:
- `RegistrarVentaUseCase::procesar()`
- `CrearProductoUseCase::ejecutar()`
- `AutenticarUsuarioUseCase::autenticar()`
- `RegistrarEntradaInventarioUseCase::procesar()`

### ✅ TestingAPI - Actor Primario Sustituto
La clase `TestingAPI` reemplaza al usuario humano como actor:
```php
// ✅ CORRECTO: Invoca directamente el caso de uso
$this->testingAPI->registrarVenta();

// ❌ INCORRECTO (no permitido): Simular clicks en la UI
$this->driver->findElement(By::id('btn-guardar'))->click();
```

---

## 🚀 Instalación y Configuración

### 1. Instalar Behat
```bash
cd /path/to/happy-Donnut-Software
composer require behat/behat --dev
```

### 2. Verificar instalación
```bash
./vendor/bin/behat --version
```

### 3. Iniciar Behat (si no existe configuración)
```bash
./vendor/bin/behat --init
```

---

## ▶️ Ejecución de Pruebas

### Ejecutar todas las especificaciones
```bash
./vendor/bin/behat features/
```

### Ejecutar archivo específico
```bash
./vendor/bin/behat features/registro_ventas.feature
./vendor/bin/behat features/gestion_productos.feature
./vendor/bin/behat features/autenticacion_usuario.feature
./vendor/bin/behat features/gestion_inventario.feature
```

### Ejecutar escenario específico
```bash
./vendor/bin/behat features/registro_ventas.feature:7
```

### Ejecutar con formato HTML
```bash
./vendor/bin/behat features/ --format=html --out=coverage/behat-report.html
```

### Ejecutar con salida detallada
```bash
./vendor/bin/behat features/ --format=progress --verbose
```

---

## 📊 Técnicas SWEBOK Aplicadas

| Técnica | Descripción | Ejemplo |
|---------|------------|---------|
| **Caja Negra** | Prueba sin conocer el código interno | Validar entrada/salida |
| **Partición de Equivalencia** | Agrupar datos válidos en clases | `precio válido: 15.00` |
| **Valor Frontera** | Validar límites | `pago = 0.00` (límite mínimo) |
| **Clase de Error** | Validar excepciones | `pago < total` (rechazo) |

---

## 📝 Guía de Redacción Gherkin

### ✅ CORRECTO - Lenguaje de Negocio

```gherkin
Feature: Registro de ventas
  Scenario: Registrar venta válida
    Given que el cajero tiene un producto con precio 15.00
    When el cajero registra la venta
    Then el sistema calcula el vuelto como 5.00
```

### ❌ INCORRECTO - Jerga Técnica

```gherkin
Feature: Registro de ventas
  Scenario: Registrar venta válida
    Given que el usuario hace clic en "btn-producto"
    When el usuario rellena el campo precio con "15.00"
    Then el elemento del DOM contiene "5.00"
```

---

## 🔧 Estructura de Step Definitions

Cada paso en Gherkin mapea a una función en `FeatureContext.php`:

```php
/**
 * @Given que el cajero tiene un producto con precio :precio
 */
public function elCajeroTieneUnProducto($precio)
{
    // Invoca TestingAPI → Caso de Uso del Hexágono
    $this->testingAPI->crearProducto("Producto", floatval($precio));
}

/**
 * @When el cajero registra la venta
 */
public function elCajeroRegistraLaVenta()
{
    $this->resultado = $this->testingAPI->registrarVenta();
}

/**
 * @Then el sistema calcula el total como :total
 */
public function elSistemaCalculaTotal($total)
{
    // Aserciones PLANAS: Sin cálculos, sin condicionales
    \PHPUnit\Framework\Assert::assertEquals(
        floatval($total),
        $this->resultado['total']
    );
}
```

---

## 🎓 Mapeo Arquitectónico Completo

Consultar: [TABLA_VINCULACION_ARQUITECTONICA.md](../TABLA_VINCULACION_ARQUITECTONICA.md)

Esta tabla documenta:
- Nombre de cada escenario Gherkin
- Puerto Primario (Caso de Uso) invocado
- Técnica SWEBOK aplicada

---

## ✨ Evidencia de Ejecución

Después de ejecutar:
```bash
./vendor/bin/behat features/ --format=progress
```

**Salida esperada (PASSING - Verde):**
```
19 scenarios (19 passed)
57 steps (57 passed)
0m0.500s
```

---

## 📚 Referencias

- **Cockburn, A.** (2005). *Hexagonal Architecture*
- **Martin, R. C.** (2017). *Clean Architecture*  
- **Washizaki, H.** (2025). *SWEBOK Guide v4.0a*
- **Behat Docs**: https://behat.org/
- **Gherkin Syntax**: https://cucumber.io/docs/gherkin/

---

## 🚨 Solución de Problemas

### Problema: `Command not found: behat`
**Solución:**
```bash
composer install
./vendor/bin/behat
```

### Problema: `Class not found: FeatureContext`
**Solución:** Verificar que `features/bootstrap/FeatureContext.php` existe

### Problema: Escenarios se marcan como "Undefined"
**Solución:** Los pasos deben coincidir exactamente con las definiciones en `FeatureContext.php`

---

## 📋 Entregables Completados

✅ **Directorio `/features`** con 4 archivos `.feature`  
✅ **19 Escenarios ejecutables** (7+4+4+4)  
✅ **Tabla de Vinculación Arquitectónica** en formato Markdown  
✅ **TestingAPI** como intermediario desacoplado  
✅ **FeatureContext** con 57 step definitions  
✅ **Configuración Behat** (behat.yml)  

---

*Práctica 6 - Laboratorio: Archivos .feature Vinculados al MVP*  
*Ingeniería de Software II - UNJBG*
