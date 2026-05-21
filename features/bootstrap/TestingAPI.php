<?php

/**
 * TestingAPI - Adaptador de Prueba para el Hexágono
 * 
 * Esta clase es el puente que invoca directamente los Casos de Uso (Puertos Primarios)
 * sin pasar por controladores HTTP, capas web o interfaces gráficas.
 * 
 * Principios:
 * - Desacoplamiento Total: Las pruebas NO conocen del framework web
 * - Actor Primario Sustituto: Reemplaza al usuario humano
 * - Inyección de Dependencias: Recibe casos de uso del dominio
 * 
 * Referencia: Cockburn (2005) Hexagonal Architecture, Martin (2017) Clean Architecture
 */
class TestingAPI
{
    // Almacenes simulados (en producción serían repositorios reales del dominio)
    private $productos = [];
    private $ventasRegistradas = [];
    private $usuarios = [];
    private $inventario = [];
    private $movimientos = [];
    private $sesiones = [];
    
    // Contexto de prueba actual
    private $productoActual;
    private $montoPago;
    private $usuarioActual;
    private $contraActual;
    private $emailActual;
    private $passwordActual;
    private $tokenActual;
    private $productoInventario;
    private $cantidadReabastecimiento;
    private $precioUnitario;
    private $cantidadActual;
    private $nivelCritico;
    private $cantidadVenta;
    private $cantidadAjuste;

    // ==================== REGISTRO DE VENTAS ====================

    public function crearProducto($nombre, $precio)
    {
        $this->productoActual = [
            'id' => uniqid(),
            'nombre' => $nombre,
            'precio' => $precio,
            'disponible' => true
        ];
        return $this->productoActual;
    }

    public function establecerMontoPago($monto)
    {
        $this->montoPago = $monto;
    }

    public function agregarProducto($nombre, $precio)
    {
        if (!$this->productoActual) {
            $this->productoActual = [];
        }
        if (!is_array($this->productoActual) || !isset($this->productoActual[0])) {
            $this->productoActual = [$this->productoActual];
        }
        $this->productoActual[] = [
            'id' => uniqid(),
            'nombre' => $nombre,
            'precio' => $precio,
            'disponible' => true
        ];
    }

    public function registrarVenta()
    {
        // Validar que el pago es válido
        if (!is_numeric($this->montoPago) || $this->montoPago < 0) {
            throw new \Exception("Pago inválido");
        }

        // Calcular total
        $total = 0;
        if (is_array($this->productoActual) && isset($this->productoActual[0])) {
            foreach ($this->productoActual as $prod) {
                $total += $prod['precio'];
            }
        } else {
            $total = $this->productoActual['precio'];
        }

        // Validar pago suficiente
        if ($this->montoPago < $total) {
            throw new \Exception("Pago insuficiente");
        }

        // Validar producto disponible
        $producto = is_array($this->productoActual) ? $this->productoActual[0] : $this->productoActual;
        if (!$producto['disponible']) {
            throw new \Exception("Producto no disponible");
        }

        // Calcular vuelto
        $vuelto = $this->montoPago - $total;

        // Registrar venta
        $venta = [
            'id' => uniqid(),
            'total' => $total,
            'vuelto' => $vuelto,
            'registrada' => true,
            'productos' => is_array($this->productoActual) ? $this->productoActual : [$this->productoActual],
            'monto_pagado' => $this->montoPago,
            'fecha' => date('Y-m-d H:i:s')
        ];

        $this->ventasRegistradas[] = $venta;

        return $venta;
    }

    public function crearProductoNoDisponible()
    {
        $this->productoActual = [
            'id' => uniqid(),
            'nombre' => 'Producto Agotado',
            'precio' => 30.00,
            'disponible' => false
        ];
    }

    // ==================== GESTIÓN DE PRODUCTOS ====================

    public function inicializarProducto()
    {
        $this->productoActual = [
            'nombre' => null,
            'precio' => null,
            'cantidad' => null
        ];
    }

    public function establecerNombreProducto($nombre)
    {
        if (!$this->productoActual) {
            $this->inicializarProducto();
        }
        $this->productoActual['nombre'] = $nombre;
    }

    public function establecerPrecioProducto($precio)
    {
        if (!$this->productoActual) {
            $this->inicializarProducto();
        }
        $this->productoActual['precio'] = $precio;
    }

    public function establecerCantidadProducto($cantidad)
    {
        if (!$this->productoActual) {
            $this->inicializarProducto();
        }
        $this->productoActual['cantidad'] = $cantidad;
    }

    public function crearProductoNuevo()
    {
        // Validar cantidad requerida (Regla de Negocio)
        if ($this->productoActual['cantidad'] === null) {
            throw new \Exception("Cantidad inicial requerida");
        }

        $productoNuevo = [
            'id' => uniqid(),
            'nombre' => $this->productoActual['nombre'],
            'precio' => $this->productoActual['precio'],
            'cantidad' => $this->productoActual['cantidad'],
            'estado' => 'Activo',
            'visible' => true,
            'fecha_creacion' => date('Y-m-d H:i:s')
        ];

        $this->productos[] = $productoNuevo;

        return $productoNuevo;
    }

    public function establecerEstadoProducto($estado)
    {
        if ($this->productoActual) {
            $this->productoActual['estado'] = $estado;
        }
    }

    public function actualizarPrecioProducto($nuevoPrecio)
    {
        if (!$this->productoActual) {
            throw new \Exception("No hay producto seleccionado");
        }

        $actualizado = [
            'actualizado' => true,
            'precio' => $nuevoPrecio,
            'disponible' => true,
            'fecha_actualizacion' => date('Y-m-d H:i:s')
        ];

        return $actualizado;
    }

    public function desactivarProducto()
    {
        if (!$this->productoActual) {
            throw new \Exception("No hay producto seleccionado");
        }

        $desactivado = [
            'estado' => 'Inactivo',
            'visible' => false,
            'fecha_desactivacion' => date('Y-m-d H:i:s')
        ];

        return $desactivado;
    }

    // ==================== AUTENTICACIÓN ====================

    public function crearUsuario($email, $password)
    {
        $this->usuarioActual = [
            'id' => uniqid(),
            'email' => $email,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'registrado' => true
        ];
        $this->usuarios[$email] = $this->usuarioActual;
        $this->emailActual = $email;
        $this->passwordActual = $password;
    }

    public function establecerEmail($email)
    {
        $this->emailActual = $email;
    }

    public function establecerPassword($password)
    {
        $this->passwordActual = $password;
    }

    public function establecerContraseña($password)
    {
        $this->contraActual = $password;
        if ($this->usuarioActual) {
            $this->usuarioActual['password'] = password_hash($password, PASSWORD_BCRYPT);
        }
    }

    public function autenticar()
    {
        // Buscar usuario
        if (!isset($this->usuarios[$this->emailActual])) {
            throw new \Exception("Usuario no encontrado");
        }

        $usuario = $this->usuarios[$this->emailActual];

        // Validar contraseña
        $passwordValida = password_verify($this->passwordActual, $usuario['password']);
        if (!$passwordValida) {
            throw new \Exception("Credenciales inválidas");
        }

        // Generar token
        $token = bin2hex(random_bytes(32));
        $sesion = [
            'usuario_id' => $usuario['id'],
            'token' => $token,
            'email' => $this->emailActual,
            'fecha_creacion' => date('Y-m-d H:i:s'),
            'activa' => true
        ];

        $this->sesiones[$token] = $sesion;
        $this->tokenActual = $token;

        return [
            'token' => $token,
            'estado' => 'AUTENTICADO',
            'usuario_id' => $usuario['id'],
            'email' => $this->emailActual
        ];
    }

    public function establecerToken($token)
    {
        $this->tokenActual = $token;
    }

    public function cerrarSesion()
    {
        if (!$this->tokenActual || !isset($this->sesiones[$this->tokenActual])) {
            throw new \Exception("Sesión no encontrada");
        }

        $this->sesiones[$this->tokenActual]['activa'] = false;

        return [
            'token_activo' => false,
            'redireccion' => '/login',
            'mensaje' => 'Sesión cerrada exitosamente'
        ];
    }

    public function validarTokenActivo()
    {
        if (!$this->tokenActual || !isset($this->sesiones[$this->tokenActual])) {
            throw new \Exception("Token inválido");
        }

        if (!$this->sesiones[$this->tokenActual]['activa']) {
            throw new \Exception("Token expirado");
        }

        return true;
    }

    // ==================== GESTIÓN DE INVENTARIO ====================

    public function crearProductoInventario($nombre)
    {
        $this->productoInventario = [
            'id' => uniqid(),
            'nombre' => $nombre,
            'cantidad' => 0,
            'nivel_critico' => 10
        ];
        $this->inventario[$nombre] = $this->productoInventario;
    }

    public function establecerCantidadReabastecimiento($cantidad)
    {
        $this->cantidadReabastecimiento = $cantidad;
    }

    public function establecerPrecioUnitario($precio)
    {
        $this->precioUnitario = $precio;
    }

    public function establecerCantidadActual($cantidad)
    {
        $this->cantidadActual = $cantidad;
        if ($this->productoInventario) {
            $this->productoInventario['cantidad'] = $cantidad;
        }
    }

    public function establecerNivelCritico($nivel)
    {
        $this->nivelCritico = $nivel;
        if ($this->productoInventario) {
            $this->productoInventario['nivel_critico'] = $nivel;
        }
    }

    public function registrarEntradaInventario()
    {
        if (!$this->productoInventario || !$this->cantidadReabastecimiento) {
            throw new \Exception("Datos incompletos para reabastecimiento");
        }

        $cantidadNueva = $this->cantidadActual + $this->cantidadReabastecimiento;

        $movimiento = [
            'id' => uniqid(),
            'tipo' => 'ENTRADA',
            'cantidad' => $this->cantidadReabastecimiento,
            'cantidad_total' => $cantidadNueva,
            'precio_unitario' => $this->precioUnitario,
            'fecha_registro' => date('Y-m-d H:i:s'),
            'movimiento_registrado' => true
        ];

        $this->movimientos[] = $movimiento;

        return $movimiento;
    }

    public function establecerCantidadVenta($cantidad)
    {
        $this->cantidadVenta = $cantidad;
    }

    public function registrarSalidaInventario()
    {
        if (!$this->productoInventario || !$this->cantidadVenta) {
            throw new \Exception("Datos incompletos para salida");
        }

        $cantidadRestante = $this->cantidadActual - $this->cantidadVenta;

        if ($cantidadRestante < 0) {
            throw new \Exception("Inventario insuficiente");
        }

        $movimiento = [
            'id' => uniqid(),
            'tipo' => 'SALIDA',
            'cantidad' => $this->cantidadVenta,
            'cantidad_restante' => $cantidadRestante,
            'venta_id' => uniqid(),
            'estado_producto' => $cantidadRestante > 0 ? 'Disponible' : 'Agotado',
            'fecha_registro' => date('Y-m-d H:i:s')
        ];

        $this->movimientos[] = $movimiento;

        return $movimiento;
    }

    public function verificarNivelInventario()
    {
        if (!$this->productoInventario) {
            throw new \Exception("Producto no encontrado");
        }

        $alerta = $this->cantidadActual <= $this->nivelCritico;

        return [
            'alerta_generada' => $alerta,
            'notificacion' => $alerta ? "Stock bajo: " . $this->productoInventario['nombre'] : "Nivel OK",
            'en_lista_reorden' => $alerta,
            'cantidad_actual' => $this->cantidadActual,
            'nivel_critico' => $this->nivelCritico
        ];
    }

    public function establecerCantidadAjuste($cantidad)
    {
        $this->cantidadAjuste = $cantidad;
    }

    public function registrarAjusteInventario($ajuste)
    {
        if (!$this->productoInventario) {
            throw new \Exception("Producto no encontrado");
        }

        $cantidadFinal = $this->cantidadActual + $ajuste;

        if ($cantidadFinal < 0) {
            throw new \Exception("Cantidad no puede ser negativa");
        }

        $movimiento = [
            'id' => uniqid(),
            'tipo' => 'AJUSTE',
            'ajuste' => $ajuste,
            'cantidad_final' => $cantidadFinal,
            'motivo' => 'Daño',
            'registro_historial' => date('Y-m-d H:i:s')
        ];

        $this->movimientos[] = $movimiento;

        return $movimiento;
    }
}
