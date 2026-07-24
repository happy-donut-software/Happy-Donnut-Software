<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use DateTimeImmutable;
use DomainException;
use PHPUnit\Framework\TestCase;

class OrdenVentaTest extends TestCase
{
    private function ordenDeDiezSoles(): OrdenVenta
    {
        $orden = new OrdenVenta('ord_test', null, new DateTimeImmutable());
        $orden->agregarLinea(new LineaOrden('lin_1', 'prod_1', 'Dona', 2, 5.0));
        return $orden;
    }

    public function test_calcula_vuelto_en_efectivo(): void
    {
        $orden = $this->ordenDeDiezSoles();
        $orden->registrarPago(20, 'EFECTIVO', 'BOLETA');
        self::assertSame(10.0, $orden->obtenerVuelto());
        self::assertSame('BOLETA', $orden->obtenerTipoComprobante());
    }

    public function test_pago_digital_no_genera_vuelto(): void
    {
        $orden = $this->ordenDeDiezSoles();
        $orden->registrarPago(0, 'YAPE', 'NOTA_PEDIDO');
        self::assertSame(10.0, $orden->obtenerMontoRecibido());
        self::assertSame(0.0, $orden->obtenerVuelto());
    }

    public function test_rechaza_efectivo_insuficiente(): void
    {
        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('El monto recibido no cubre');
        $this->ordenDeDiezSoles()->registrarPago(5, 'EFECTIVO', 'BOLETA');
    }
}