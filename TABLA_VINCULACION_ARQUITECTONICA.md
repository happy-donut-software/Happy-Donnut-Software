# Tabla de Vinculación Arquitectónica - BDD con Behat

## Resumen de Especificaciones Ejecutables

Este documento mapea cada escenario Gherkin hacia el caso de uso del hexágono interno (Puerto Primario) y la técnica SWEBOK aplicada.

---

## 1. Registro de Ventas (`features/registro_ventas.feature`)

| Nombre del Escenario Gherkin | Puerto Primario / Caso de Uso Invocado | Técnica SWEBOK Aplicada |
|---|---|---|
| Registrar venta válida y calcular vuelto correctamente | `RegistrarVentaUseCase::procesar()` | Caja Negra - Partición de Equivalencia (entrada válida) |
| Registrar venta con pago exacto y no hay vuelto | `RegistrarVentaUseCase::procesar()` | Caja Negra - Valor Frontera (pago exacto) |
| Registrar venta con múltiples productos y calcular vuelto | `RegistrarVentaUseCase::procesar()` | Caja Negra - Partición de Equivalencia (múltiples items) |
| Registrar venta con pago insuficiente y mostrar excepción | `RegistrarVentaUseCase::validarPago()` | Caja Negra - Clase de Error (pago < total) |
| Registrar venta con pago cero y mostrar excepción | `RegistrarVentaUseCase::validarPago()` | Caja Negra - Valor Frontera (límite inferior) |
| Registrar venta con monto de pago inválido y mostrar error | `RegistrarVentaUseCase::validarPago()` | Caja Negra - Clase de Error (dato no numérico) |
| Registrar venta con producto no disponible y mostrar excepción | `RegistrarVentaUseCase::validarProductos()` | Caja Negra - Clase de Error (recurso no existe) |

---

## 2. Gestión de Productos (`features/gestion_productos.feature`)

| Nombre del Escenario Gherkin | Puerto Primario / Caso de Uso Invocado | Técnica SWEBOK Aplicada |
|---|---|---|
| Crear un producto nuevo exitosamente | `CrearProductoUseCase::ejecutar()` | Caja Negra - Partición de Equivalencia (datos válidos) |
| Crear producto sin cantidad inicial muestra error | `CrearProductoUseCase::validarDatos()` | Caja Negra - Clase de Error (campo obligatorio) |
| Actualizar precio de un producto existente | `ActualizarProductoUseCase::actualizarPrecio()` | Caja Negra - Partición de Equivalencia (actualización válida) |
| Desactivar producto no disponible | `DesactivarProductoUseCase::ejecutar()` | Caja Negra - Valor Frontera (cambio de estado) |

---

## 3. Autenticación de Usuario (`features/autenticacion_usuario.feature`)

| Nombre del Escenario Gherkin | Puerto Primario / Caso de Uso Invocado | Técnica SWEBOK Aplicada |
|---|---|---|
| Autenticación exitosa con credenciales válidas | `AutenticarUsuarioUseCase::autenticar()` | Caja Negra - Partición de Equivalencia (credenciales correctas) |
| Autenticación falla con contraseña incorrecta | `AutenticarUsuarioUseCase::validarCredenciales()` | Caja Negra - Clase de Error (credencial inválida) |
| Autenticación falla cuando usuario no existe | `AutenticarUsuarioUseCase::buscarUsuario()` | Caja Negra - Clase de Error (usuario no existe) |
| Cerrar sesión invalida el token | `CerrarSesionUseCase::ejecutar()` | Caja Negra - Partición de Equivalencia (operación exitosa) |

---

## 4. Gestión de Inventario (`features/gestion_inventario.feature`)

| Nombre del Escenario Gherkin | Puerto Primario / Caso de Uso Invocado | Técnica SWEBOK Aplicada |
|---|---|---|
| Registrar entrada de productos al inventario | `RegistrarEntradaInventarioUseCase::procesar()` | Caja Negra - Partición de Equivalencia (entrada válida) |
| Registrar salida de productos por venta | `RegistrarSalidaInventarioUseCase::descontar()` | Caja Negra - Partición de Equivalencia (salida vinculada) |
| Alerta cuando inventario alcanza nivel crítico | `VerificarNivelInventarioUseCase::evaluar()` | Caja Negra - Valor Frontera (nivel crítico) |
| Ajuste de inventario por pérdida o daño | `AjusteInventarioUseCase::ejecutar()` | Caja Negra - Partición de Equivalencia (ajuste con motivo) |

---

## Principios Arquitectónicos Aplicados

✅ **Desacoplamiento Total**: Cada escenario invoca directamente el **Puerto Primario (Caso de Uso)** sin pasar por controladores HTTP o capas de presentación.

✅ **TestingAPI**: Se utiliza una clase `TestingAPI` como intermediaria que inyecta los casos de uso y ejecuta la lógica de negocio.

✅ **Ausencia de Lógica en Aserciones**: Los pasos `Then` realizan comparaciones planas de valores, sin cálculos matemáticos ni condicionales.

✅ **Lenguaje Ubicuo**: Toda la especificación usa vocabulario del dominio, no jerga técnica.

---

## Ejecución con Behat

```bash
# Instalar dependencias
composer require behat/behat --dev

# Ejecutar todas las especificaciones
./vendor/bin/behat features/

# Ejecutar archivo específico
./vendor/bin/behat features/registro_ventas.feature

# Con formato de salida detallado
./vendor/bin/behat features/ --format=progress --format=html --out=coverage/
```

---

## Estado de Implementación

- **Total de Escenarios**: 19
- **Archivos .feature**: 4
- **Técnicas SWEBOK Aplicadas**: 
  - ✅ Caja Negra (Black Box)
  - ✅ Partición de Equivalencia
  - ✅ Análisis de Valor Frontera
  - ✅ Prueba de Clase de Error

---

## Referencias

- Cockburn, A. (2005). *Hexagonal Architecture*. 
- Martin, R. C. (2017). *Clean Architecture*.
- Washizaki, H. (2025). *SWEBOK Guide v4.0a*.
- Behat Documentation: https://behat.org/
