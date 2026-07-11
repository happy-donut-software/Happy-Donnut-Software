<?php

namespace Tests\Unit\Dominio;

use App\Dominio\ObjetosValor\Monto;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class MontoTest extends TestCase
{
    public function test_suma_dos_montos(): void
    {
        $resultado = (new Monto(10.50))->sumar(new Monto(5.25));

        $this->assertSame(15.75, $resultado->obtenerValor());
    }

    public function test_resta_montos_sin_resultado_negativo(): void
    {
        $resultado = (new Monto(20.00))->restar(new Monto(8.50));

        $this->assertSame(11.50, $resultado->obtenerValor());
    }

    public function test_rechaza_monto_negativo(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new Monto(-1.00);
    }

    public function test_resta_que_genera_negativo_lanza_excepcion(): void
    {
        $this->expectException(InvalidArgumentException::class);
        (new Monto(5.00))->restar(new Monto(10.00));
    }

    public function test_compara_igualdad(): void
    {
        $this->assertTrue((new Monto(10.00))->esIgualA(new Monto(10.00)));
    }
}