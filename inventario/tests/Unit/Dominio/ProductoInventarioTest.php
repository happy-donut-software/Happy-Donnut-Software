<?php

namespace Tests\Unit\Dominio;

use App\Dominio\Agregados\ProductoInventario;
use App\Dominio\ObjetosValor\CantidadStock;
use DomainException;
use PHPUnit\Framework\TestCase;

class ProductoInventarioTest extends TestCase
{
    private function crearProducto(int $stock = 10): ProductoInventario
    {
        return new ProductoInventario('prod_1', 'Dona Chocolate', new CantidadStock($stock));
    }

    public function test_registrar_entrada_aumenta_stock(): void
    {
        $producto = $this->crearProducto(10);
        $producto->registrarEntrada(new CantidadStock(5));

        $this->assertSame(15, $producto->obtenerStockDisponible()->obtenerValor());
    }

    public function test_registrar_salida_disminuye_stock(): void
    {
        $producto = $this->crearProducto(10);
        $producto->registrarSalida(new CantidadStock(3));

        $this->assertSame(7, $producto->obtenerStockDisponible()->obtenerValor());
    }

    public function test_registrar_salida_con_stock_insuficiente_falla(): void
    {
        $producto = $this->crearProducto(2);

        $this->expectException(DomainException::class);
        $producto->registrarSalida(new CantidadStock(5));
    }
}