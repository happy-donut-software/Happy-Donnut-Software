<?php

namespace Tests\Unit\Dominio;

use App\Dominio\ObjetosValor\CantidadStock;
use DomainException;
use PHPUnit\Framework\TestCase;

class CantidadStockTest extends TestCase
{
    public function test_suma_cantidades(): void
    {
        $resultado = (new CantidadStock(10))->sumar(new CantidadStock(5));

        $this->assertSame(15, $resultado->obtenerValor());
    }

    public function test_resta_cantidades(): void
    {
        $resultado = (new CantidadStock(10))->restar(new CantidadStock(4));

        $this->assertSame(6, $resultado->obtenerValor());
    }

    public function test_rechaza_valor_negativo(): void
    {
        $this->expectException(DomainException::class);
        new CantidadStock(-1);
    }

    public function test_resta_que_genera_negativo_falla(): void
    {
        $this->expectException(DomainException::class);
        (new CantidadStock(3))->restar(new CantidadStock(10));
    }
}