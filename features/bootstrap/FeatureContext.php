<?php

use Behat\Behat\Context\Context;

/**
 * FeatureContext - Definiciones de Pasos para BDD
 * 
 * Este archivo actúa como el puente entre los archivos .feature (Gherkin)
 * y la lógica de dominio del MVP a través de la TestingAPI.
 * 
 * Principio Arquitectónico: Los pasos NO invocan controladores HTTP ni 
 * manipulan la UI. Invocan directamente el Puerto Primario (Caso de Uso)
 * mediante la TestingAPI.
 */
class FeatureContext implements Context
{
    private $testingAPI;
    private $resultado;
    private $excepciones = [];

    public function __construct()
    {
        // Inyección del Caso de Uso del Hexágono mediante TestingAPI
        $this->testingAPI = new TestingAPI();
    }

    // ==================== REGISTRO DE VENTAS ====================

    /**
     * @Given que el cajero tiene un producto con precio :precio
     */
    public function elCajeroTieneUnProducto($precio)
    {
        $this->testingAPI->crearProducto("Producto Teste", floatval($precio));
    }

    /**
     * @And que el cliente paga :monto
     */
    public function elClientePaga($monto)
    {
        $this->testingAPI->establecerMontoPago(floatval($monto));
    }

    /**
     * @And que el cajero añade otro producto con precio :precio
     */
    public function elCajeroAñadeOtroProducto($precio)
    {
        $this->testingAPI->agregarProducto("Producto Adicional", floatval($precio));
    }

    /**
     * @When el cajero registra la venta
     */
    public function elCajeroRegistraLaVenta()
    {
        $this->resultado = $this->testingAPI->registrarVenta();
    }

    /**
     * @When el cajero intenta registrar la venta
     */
    public function elCajeroIntentaRegistrar()
    {
        try {
            $this->resultado = $this->testingAPI->registrarVenta();
        } catch (\Exception $e) {
            $this->excepciones[] = $e->getMessage();
        }
    }

    /**
     * @Then el sistema calcula el total de la venta como :total
     */
    public function elSistemaCalculaTotal($total)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            floatval($total),
            $this->resultado['total'],
            "El total debe ser " . $total
        );
    }

    /**
     * @And el sistema calcula el vuelto como :vuelto
     */
    public function elSistemaCalculaVuelto($vuelto)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            floatval($vuelto),
            $this->resultado['vuelto'],
            "El vuelto debe ser " . $vuelto
        );
    }

    /**
     * @And la venta queda registrada en el sistema
     */
    public function laVentaQuedaRegistrada()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            $this->resultado['registrada'] === true,
            "La venta debe estar registrada"
        );
    }

    /**
     * @And no se registra la venta en el sistema
     */
    public function noSeRegistraLaVenta()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            count($this->excepciones) > 0,
            "Debe existir una excepción"
        );
    }

    /**
     * @And el sistema rechaza el registro de la venta
     */
    public function elSistemaRechazaRegistro()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            count($this->excepciones) > 0,
            "El sistema debe rechazar la venta"
        );
    }

    /**
     * @And el sistema muestra un mensaje de :mensaje
     */
    public function elSistemaMuestraMensaje($mensaje)
    {
        $mensajeEnExcepciones = false;
        foreach ($this->excepciones as $exc) {
            if (strpos($exc, $mensaje) !== false) {
                $mensajeEnExcepciones = true;
                break;
            }
        }
        \PHPUnit\Framework\Assert::assertTrue(
            $mensajeEnExcepciones,
            "El mensaje debe contener: " . $mensaje
        );
    }

    /**
     * @And que el cliente ingresa un pago inválido
     */
    public function elClienteIngresaPagoInvalido()
    {
        $this->testingAPI->establecerMontoPago("texto_invalido");
    }

    /**
     * @And que el cajero intenta vender un producto no disponible
     */
    public function elCajeroIntentaVenderProductoNoDisponible()
    {
        $this->testingAPI->crearProductoNoDisponible();
    }

    // ==================== GESTIÓN DE PRODUCTOS ====================

    /**
     * @Given que el administrador desea crear un nuevo producto
     */
    public function elAdministradorDeseaCrearProducto()
    {
        $this->testingAPI->inicializarProducto();
    }

    /**
     * @And que proporciona el nombre :nombre
     */
    public function queProporcionalNombre($nombre)
    {
        $this->testingAPI->establecerNombreProducto($nombre);
    }

    /**
     * @And que proporciona el precio :precio
     */
    public function queProporcionaPrecio($precio)
    {
        $this->testingAPI->establecerPrecioProducto(floatval($precio));
    }

    /**
     * @And que proporciona la cantidad inicial :cantidad
     */
    public function queProporcionaCantidadInicial($cantidad)
    {
        $this->testingAPI->establecerCantidadProducto(intval($cantidad));
    }

    /**
     * @And que no proporciona la cantidad inicial
     */
    public function queNoProporcionaCantidadInicial()
    {
        $this->testingAPI->establecerCantidadProducto(null);
    }

    /**
     * @When el administrador crea el producto
     */
    public function elAdministradorCreaElProducto()
    {
        $this->resultado = $this->testingAPI->crearProductoNuevo();
    }

    /**
     * @When el administrador intenta crear el producto
     */
    public function elAdministradorIntentaCrearelProducto()
    {
        try {
            $this->resultado = $this->testingAPI->crearProductoNuevo();
        } catch (\Exception $e) {
            $this->excepciones[] = $e->getMessage();
        }
    }

    /**
     * @Then el producto se registra en el sistema
     */
    public function elProductoSeRegistra()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            isset($this->resultado['id']),
            "El producto debe tener un ID asignado"
        );
    }

    /**
     * @And el producto aparece en el catálogo
     */
    public function elProductoApareceEnCatalogo()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            $this->resultado['visible'] === true,
            "El producto debe estar visible en el catálogo"
        );
    }

    /**
     * @And el estado del producto es :estado
     */
    public function elEstadoDelProductoEs($estado)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            $estado,
            $this->resultado['estado'],
            "El estado debe ser " . $estado
        );
    }

    /**
     * @And el producto no se registra en el sistema
     */
    public function elProductoNoSeRegistra()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            count($this->excepciones) > 0,
            "Debe haber una excepción de validación"
        );
    }

    /**
     * @Given que existe un producto :nombre con precio :precio
     */
    public function queExisteUnProducto($nombre, $precio)
    {
        $this->testingAPI->crearProducto($nombre, floatval($precio));
    }

    /**
     * @And que el administrador desea actualizar el precio
     */
    public function queElAdministradorDeseaActualizar()
    {
        // Preparar contexto
    }

    /**
     * @When el administrador actualiza el precio a :nuevoPrecio
     */
    public function elAdministradorActualizaPrecio($nuevoPrecio)
    {
        $this->resultado = $this->testingAPI->actualizarPrecioProducto(floatval($nuevoPrecio));
    }

    /**
     * @Then el sistema registra el cambio de precio
     */
    public function elSistemaRegistraElCambio()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            isset($this->resultado['actualizado']),
            "El precio debe haberse actualizado"
        );
    }

    /**
     * @And el nuevo precio es :precio
     */
    public function elNuevoPrecioEs($precio)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            floatval($precio),
            $this->resultado['precio'],
            "El precio debe ser " . $precio
        );
    }

    /**
     * @And el producto mantiene su disponibilidad
     */
    public function elProductoMantieneSuDisponibilidad()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            $this->resultado['disponible'] === true,
            "El producto debe estar disponible"
        );
    }

    /**
     * @Given que existe un producto :nombre con estado :estado
     */
    public function queExisteUnProductoConEstado($nombre, $estado)
    {
        $this->testingAPI->crearProducto($nombre, 10.00);
        $this->testingAPI->establecerEstadoProducto($estado);
    }

    /**
     * @And que la cantidad en inventario es :cantidad
     */
    public function queLaCantidadEnInventarioEs($cantidad)
    {
        $this->testingAPI->establecerCantidadProducto(intval($cantidad));
    }

    /**
     * @When el administrador desactiva el producto
     */
    public function elAdministradorDesactivaElProducto()
    {
        $this->resultado = $this->testingAPI->desactivarProducto();
    }

    /**
     * @Then el producto cambia su estado a :nuevoEstado
     */
    public function elProductoCambiaEstado($nuevoEstado)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            $nuevoEstado,
            $this->resultado['estado'],
            "El estado debe cambiar a " . $nuevoEstado
        );
    }

    /**
     * @And el producto no aparece en las ventas
     */
    public function elProductoNoAparece()
    {
        \PHPUnit\Framework\Assert::assertFalse(
            $this->resultado['visible'],
            "El producto no debe ser visible"
        );
    }

    /**
     * @And el sistema registra la fecha de desactivación
     */
    public function elSistemaRegistraFechaDesactivacion()
    {
        \PHPUnit\Framework\Assert::assertNotNull(
            $this->resultado['fecha_desactivacion'],
            "Debe registrarse la fecha de desactivación"
        );
    }

    // ==================== AUTENTICACIÓN ====================

    /**
     * @Given que el usuario tiene cuenta registrada con email :email
     */
    public function queElUsuarioTieneCuenta($email)
    {
        $this->testingAPI->crearUsuario($email, "segura123");
    }

    /**
     * @And que la contraseña registrada es :password
     */
    public function queLaContraseñaRegistrada($password)
    {
        $this->testingAPI->establecerContraseña($password);
    }

    /**
     * @And que la contraseña correcta es :password
     */
    public function queLaContraseñaCorrectaEs($password)
    {
        $this->testingAPI->establecerContraseña($password);
    }

    /**
     * @When el usuario proporciona email :email
     */
    public function elUsuarioProporcionaEmail($email)
    {
        $this->testingAPI->establecerEmail($email);
    }

    /**
     * @And el usuario proporciona contraseña :password
     */
    public function elUsuarioProporcionaPassword($password)
    {
        $this->testingAPI->establecerPassword($password);
    }

    /**
     * @And el usuario solicita autenticación
     */
    public function elUsuarioSolicitaAutenticacion()
    {
        try {
            $this->resultado = $this->testingAPI->autenticar();
        } catch (\Exception $e) {
            $this->excepciones[] = $e->getMessage();
        }
    }

    /**
     * @Then el sistema valida las credenciales
     */
    public function elSistemaValidaCredenciales()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            count($this->excepciones) === 0,
            "No debe haber excepciones en autenticación válida"
        );
    }

    /**
     * @And el usuario recibe un token de sesión
     */
    public function elUsuarioRecibeMToken()
    {
        \PHPUnit\Framework\Assert::assertNotNull(
            $this->resultado['token'],
            "Debe haber un token de sesión"
        );
    }

    /**
     * @And el usuario accede al sistema exitosamente
     */
    public function elUsuarioAccedeExitosamente()
    {
        \PHPUnit\Framework\Assert::assertEquals(
            "AUTENTICADO",
            $this->resultado['estado'],
            "El estado debe ser AUTENTICADO"
        );
    }

    /**
     * @Then el sistema rechaza la autenticación
     */
    public function elSistemaRechazaAutenticacion()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            count($this->excepciones) > 0,
            "Debe existir una excepción de autenticación"
        );
    }

    /**
     * @And el usuario no accede al sistema
     */
    public function elUsuarioNoAccede()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            !isset($this->resultado['token']) || $this->resultado['token'] === null,
            "No debe haber token de sesión"
        );
    }

    /**
     * @Given que el usuario proporciona email :email
     */
    public function queElUsuarioProporcionaEmail($email)
    {
        $this->testingAPI->establecerEmail($email);
    }

    /**
     * @And que el usuario proporciona contraseña :password
     */
    public function queElUsuarioProporcionaPassword($password)
    {
        $this->testingAPI->establecerPassword($password);
    }

    /**
     * @Then el sistema muestra un mensaje de :mensaje (for auth)
     */
    public function elSistemaMuestraMensajeAuth($mensaje)
    {
        $mensajeEnExcepciones = false;
        foreach ($this->excepciones as $exc) {
            if (strpos($exc, $mensaje) !== false) {
                $mensajeEnExcepciones = true;
                break;
            }
        }
        \PHPUnit\Framework\Assert::assertTrue(
            $mensajeEnExcepciones,
            "El mensaje debe contener: " . $mensaje
        );
    }

    /**
     * @And que no se registra intento de acceso al usuario
     */
    public function queNoSeRegistraIntentoDeAcceso()
    {
        // Validar que no hay token
        \PHPUnit\Framework\Assert::assertTrue(
            !isset($this->resultado['token']),
            "No debe generarse token para usuario inexistente"
        );
    }

    /**
     * @Given que el usuario está autenticado con token válido
     */
    public function queElUsuarioEstaAutenticado()
    {
        $this->testingAPI->crearUsuario("usuario@test.com", "password123");
        $auth = $this->testingAPI->autenticar();
        $this->testingAPI->establecerToken($auth['token']);
    }

    /**
     * @And que el usuario desea cerrar sesión
     */
    public function queElUsuarioDeseaCerrarSesion()
    {
        // Preparar contexto
    }

    /**
     * @When el usuario solicita cerrar sesión
     */
    public function elUsuarioSolicitaCerrarSesion()
    {
        $this->resultado = $this->testingAPI->cerrarSesion();
    }

    /**
     * @Then el sistema invalida el token de sesión
     */
    public function elSistemaInvalidaToken()
    {
        \PHPUnit\Framework\Assert::assertFalse(
            $this->resultado['token_activo'],
            "El token debe estar inactivo"
        );
    }

    /**
     * @And el usuario no puede realizar acciones posteriores
     */
    public function elUsuarioNoPuedeRealizar()
    {
        try {
            $this->testingAPI->validarTokenActivo();
            $valido = true;
        } catch (\Exception $e) {
            $valido = false;
        }
        \PHPUnit\Framework\Assert::assertFalse(
            $valido,
            "El token debe estar inválido después de cerrar sesión"
        );
    }

    /**
     * @And el usuario es redirigido a la página de autenticación
     */
    public function elUsuarioEsRedirigido()
    {
        \PHPUnit\Framework\Assert::assertEquals(
            "/login",
            $this->resultado['redireccion'],
            "Debe redirigir a /login"
        );
    }

    // ==================== GESTIÓN DE INVENTARIO ====================

    /**
     * @Given que llega un pedido de reabastecimiento de :cantidad unidades de :producto
     */
    public function queLlegaPedidoReabastecimiento($cantidad, $producto)
    {
        $this->testingAPI->crearProductoInventario($producto);
        $this->testingAPI->establecerCantidadReabastecimiento(intval($cantidad));
    }

    /**
     * @And que el precio unitario es :precio
     */
    public function quePrecioUnitario($precio)
    {
        $this->testingAPI->establecerPrecioUnitario(floatval($precio));
    }

    /**
     * @And que la cantidad actual en inventario es :cantidad
     */
    public function queLaCantidadActualEnInventario($cantidad)
    {
        $this->testingAPI->establecerCantidadActual(intval($cantidad));
    }

    /**
     * @When el gerente registra la entrada al inventario
     */
    public function elGerenteRegistraEntrada()
    {
        $this->resultado = $this->testingAPI->registrarEntradaInventario();
    }

    /**
     * @Then la cantidad total de :producto es ahora :cantidad
     */
    public function laCantidadTotalEs($producto, $cantidad)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            intval($cantidad),
            $this->resultado['cantidad_total'],
            "La cantidad debe ser " . $cantidad
        );
    }

    /**
     * @And el sistema registra la entrada con fecha y hora
     */
    public function elSistemaRegistraEntrada()
    {
        \PHPUnit\Framework\Assert::assertNotNull(
            $this->resultado['fecha_registro'],
            "Debe registrarse la fecha"
        );
    }

    /**
     * @And se actualiza el historial de movimientos
     */
    public function seActualizaHistorial()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            $this->resultado['movimiento_registrado'] === true,
            "Debe haber un movimiento en el historial"
        );
    }

    /**
     * @Given que existe un producto :producto con cantidad :cantidad
     */
    public function queExisteUnProductoConCantidad($producto, $cantidad)
    {
        $this->testingAPI->crearProductoInventario($producto);
        $this->testingAPI->establecerCantidadActual(intval($cantidad));
    }

    /**
     * @And que se realiza una venta de :cantidad unidades
     */
    public function queSerealizaVenta($cantidad)
    {
        $this->testingAPI->establecerCantidadVenta(intval($cantidad));
    }

    /**
     * @When el sistema registra la salida del inventario
     */
    public function elSistemaRegistraSalida()
    {
        $this->resultado = $this->testingAPI->registrarSalidaInventario();
    }

    /**
     * @Then la cantidad se reduce a :cantidad
     */
    public function laCantidadSeReduceA($cantidad)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            intval($cantidad),
            $this->resultado['cantidad_restante'],
            "La cantidad debe reducirse a " . $cantidad
        );
    }

    /**
     * @And el movimiento se vincula a la venta correspondiente
     */
    public function elmovimientoSeVincula()
    {
        \PHPUnit\Framework\Assert::assertNotNull(
            $this->resultado['venta_id'],
            "El movimiento debe estar vinculado a una venta"
        );
    }

    /**
     * @And se actualiza el estado del producto
     */
    public function seActualizaEstadoDelProducto()
    {
        \PHPUnit\Framework\Assert::assertNotNull(
            $this->resultado['estado_producto'],
            "El estado del producto debe actualizarse"
        );
    }

    /**
     * @Given que existe un producto :producto con cantidad :cantidad (for inventory level)
     */
    public function queExisteProductoInventoryLevel($producto, $cantidad)
    {
        $this->testingAPI->crearProductoInventario($producto);
        $this->testingAPI->establecerCantidadActual(intval($cantidad));
    }

    /**
     * @And que el nivel crítico del producto es :cantidad unidades
     */
    public function queElNivelCriticoEs($cantidad)
    {
        $this->testingAPI->establecerNivelCritico(intval($cantidad));
    }

    /**
     * @When el sistema verifica el nivel de inventario
     */
    public function elSistemaVerificaNivel()
    {
        $this->resultado = $this->testingAPI->verificarNivelInventario();
    }

    /**
     * @Then el sistema genera una alerta
     */
    public function elSistemaGeneraAlerta()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            $this->resultado['alerta_generada'] === true,
            "Debe generarse una alerta"
        );
    }

    /**
     * @And el gerente recibe notificación de :mensaje
     */
    public function elGerenteRecibeNotificacion($mensaje)
    {
        \PHPUnit\Framework\Assert::assertStringContainsString(
            "Stock bajo",
            $this->resultado['notificacion'],
            "Debe notificar sobre stock bajo"
        );
    }

    /**
     * @And el producto aparece en la lista de reorden
     */
    public function elProductoApareceEnListaReorden()
    {
        \PHPUnit\Framework\Assert::assertTrue(
            $this->resultado['en_lista_reorden'] === true,
            "Debe aparecer en la lista de reorden"
        );
    }

    /**
     * @Given que se detectan :cantidad unidades dañadas
     */
    public function queSeDetectanUnidadesDañadas($cantidad)
    {
        $this->testingAPI->establecerCantidadAjuste(intval($cantidad));
    }

    /**
     * @When el gerente registra un ajuste negativo de :cantidad unidades
     */
    public function elGerenteRegistraAjusteNegativo($cantidad)
    {
        $this->resultado = $this->testingAPI->registrarAjusteInventario(-intval($cantidad));
    }

    /**
     * @Then la cantidad del producto se reduce a :cantidad
     */
    public function laCantidadDelProductoSeReduceA($cantidad)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            intval($cantidad),
            $this->resultado['cantidad_final'],
            "La cantidad debe ser " . $cantidad
        );
    }

    /**
     * @And se registra el motivo del ajuste como :motivo
     */
    public function seRegistraMotivo($motivo)
    {
        \PHPUnit\Framework\Assert::assertEquals(
            $motivo,
            $this->resultado['motivo'],
            "El motivo debe ser " . $motivo
        );
    }

    /**
     * @And la operación queda documentada en el historial
     */
    public function laOperacionQuedeDocumentada()
    {
        \PHPUnit\Framework\Assert::assertNotNull(
            $this->resultado['registro_historial'],
            "La operación debe quedar documentada"
        );
    }
}
