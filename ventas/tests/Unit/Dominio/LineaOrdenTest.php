<?php

namespace Tests\Unit\Dominio;

use App\Dominio\Entidades\LineaOrden;
use DomainException;
use PHPUnit\Framework\TestCase;

class LineaOrdenTest extends TestCase
{
    public function test_calcular_subtotal(): void
    {
        $linea = new LineaOrden('lin_1', 'prod_1', 'Dona Chocolate', 3, 2.50);

        $this->assertSame(7.5, $linea->calcularSubtotal());
    }

    public function test_rechaza_cantidad_cero(): void
    {
        $this->expectException(DomainException::class);
        new LineaOrden('lin_1', 'prod_1', 'Dona', 0, 2.50);
    }

    public function test_rechaza_precio_negativo(): void
    {
        $this->expectException(DomainException::class);
        new LineaOrden('lin_1', 'prod_1', 'Dona', 1, -1.00);
    }
}