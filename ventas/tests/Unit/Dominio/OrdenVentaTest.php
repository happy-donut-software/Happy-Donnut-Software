<?php

namespace Tests\Unit\Dominio;

use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use App\Dominio\ObjetosValor\EstadoOrden;
use DateTimeImmutable;
use DomainException;
use PHPUnit\Framework\TestCase;

class OrdenVentaTest extends TestCase
{
    private function crearOrden(): OrdenVenta
    {
        return new OrdenVenta('ord_1', 'cli_1', new DateTimeImmutable());
    }

    private function crearLinea(): LineaOrden
    {
        return new LineaOrden('lin_1', 'prod_1', 'Dona Chocolate', 2, 3.50);
    }

    public function test_calcular_total_suma_lineas(): void
    {
        $orden = $this->crearOrden();
        $orden->agregarLinea($this->crearLinea());
        $orden->agregarLinea(new LineaOrden('lin_2', 'prod_2', 'Dona Vainilla', 1, 3.00));

        $this->assertSame(10.0, $orden->calcularTotal());
    }

    public function test_marcar_como_pagada_cambia_estado(): void
    {
        $orden = $this->crearOrden();
        $orden->agregarLinea($this->crearLinea());

        $orden->marcarComoPagada();

        $this->assertSame(EstadoOrden::PAGADA, $orden->obtenerEstado());
    }

    public function test_no_se_puede_pagar_orden_ya_pagada(): void
    {
        $orden = $this->crearOrden();
        $orden->agregarLinea($this->crearLinea());
        $orden->marcarComoPagada();

        $this->expectException(DomainException::class);
        $orden->marcarComoPagada();
    }

    public function test_no_se_pueden_agregar_lineas_a_orden_pagada(): void
    {
        $orden = $this->crearOrden();
        $orden->agregarLinea($this->crearLinea());
        $orden->marcarComoPagada();

        $this->expectException(DomainException::class);
        $orden->agregarLinea(new LineaOrden('lin_3', 'prod_3', 'Dona Fresa', 1, 4.00));
    }

    public function test_cancelar_orden_pendiente(): void
    {
        $orden = $this->crearOrden();
        $orden->agregarLinea($this->crearLinea());

        $orden->cancelar();

        $this->assertSame(EstadoOrden::CANCELADA, $orden->obtenerEstado());
    }
}