<?php

namespace Tests\Unit\Domain\Models;

use App\Core\Domain\Models\CorrelativoComprobante;
use App\Core\Domain\Models\DineroRecibido;
use App\Core\Domain\Models\TotalAPagar;
use App\Core\Domain\Models\Venta;
use App\Core\Domain\Models\VentaItem;
use DomainException;
use PHPUnit\Framework\TestCase;

final class VentaTest extends TestCase
{
    public function test_agregar_item_actualiza_total(): void
    {
        $venta = new Venta(new CorrelativoComprobante('VD-000001'), new TotalAPagar(0.0));
        $venta->agregarItem(new VentaItem(1, 'Producto A', 10.50, 2));

        $this->assertSame(21.0, $venta->totalAPagar()->value());
        $this->assertCount(1, $venta->items());
    }

    public function test_registrar_pago_con_monto_insuficiente_lanza_excepcion(): void
    {
        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('El dinero recibido no cubre el total a pagar.');

        $venta = new Venta(new CorrelativoComprobante('VD-000001'), new TotalAPagar(20.0));
        $venta->registrarPago(new DineroRecibido(10.0));
    }

    public function test_registrar_pago_calcula_vuelto(): void
    {
        $venta = new Venta(new CorrelativoComprobante('VD-000001'), new TotalAPagar(18.25));
        $venta->registrarPago(new DineroRecibido(20.00));

        $this->assertSame(20.0, $venta->dineroRecibido()->value());
        $this->assertSame(1.75, $venta->vueltoAEntregar()->value());
    }
}
