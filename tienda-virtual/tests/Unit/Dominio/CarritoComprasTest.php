<?php

namespace Tests\Unit\Dominio;

use App\Dominio\Agregados\CarritoCompras;
use PHPUnit\Framework\TestCase;

class CarritoComprasTest extends TestCase
{
    private function crearCarrito(): CarritoCompras
    {
        return new CarritoCompras('cart_1', 'cli_1');
    }

    public function test_agregar_producto_nuevo(): void
    {
        $carrito = $this->crearCarrito();
        $carrito->agregarProducto('prod_1', 'Dona Chocolate', 2, 3.50);

        $this->assertCount(1, $carrito->obtenerItems());
        $this->assertSame(7.0, $carrito->calcularTotalEstimado());
    }

    public function test_agregar_mismo_producto_incrementa_cantidad(): void
    {
        $carrito = $this->crearCarrito();
        $carrito->agregarProducto('prod_1', 'Dona Chocolate', 2, 3.50);
        $carrito->agregarProducto('prod_1', 'Dona Chocolate', 1, 3.50);

        $this->assertCount(1, $carrito->obtenerItems());
        $this->assertSame(10.5, $carrito->calcularTotalEstimado());
    }

    public function test_remover_producto(): void
    {
        $carrito = $this->crearCarrito();
        $carrito->agregarProducto('prod_1', 'Dona Chocolate', 2, 3.50);
        $carrito->agregarProducto('prod_2', 'Dona Vainilla', 1, 3.00);
        $carrito->removerProducto('prod_1');

        $this->assertCount(1, $carrito->obtenerItems());
        $this->assertSame(3.0, $carrito->calcularTotalEstimado());
    }

    public function test_vaciar_carrito(): void
    {
        $carrito = $this->crearCarrito();
        $carrito->agregarProducto('prod_1', 'Dona Chocolate', 2, 3.50);
        $carrito->vaciar();

        $this->assertCount(0, $carrito->obtenerItems());
        $this->assertSame(0.0, $carrito->calcularTotalEstimado());
    }
}