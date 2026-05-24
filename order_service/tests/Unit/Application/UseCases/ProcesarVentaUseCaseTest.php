<?php

namespace Tests\Unit\Application\UseCases;

use App\Core\Application\UseCases\ProcesarVentaUseCase;
use App\Core\Domain\Models\Venta;
use App\Core\Domain\Models\VentaItem;
use App\Core\Domain\Models\DineroRecibido;
use App\Core\Domain\Ports\ImpresoraPortInterface;
use App\Core\Domain\Ports\VentaRepositoryInterface;
use DomainException;
use PHPUnit\Framework\TestCase;

final class ProcesarVentaUseCaseTest extends TestCase
{
    public function test_execute_lanza_excepcion_si_no_hay_items(): void
    {
        $repository = $this->createMock(VentaRepositoryInterface::class);
        $printer = $this->createMock(ImpresoraPortInterface::class);
        $useCase = new ProcesarVentaUseCase($repository, $printer);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('La orden debe contener al menos un ítem.');

        $useCase->execute(['items' => []]);
    }

    public function test_execute_guarda_e_imprime_venta_correctamente(): void
    {
        $repository = $this->createMock(VentaRepositoryInterface::class);
        $printer = $this->createMock(ImpresoraPortInterface::class);

        $repository->expects(self::once())
            ->method('nextCorrelativo')
            ->willReturn('VD-000001');

        $repository->expects(self::once())
            ->method('save')
            ->with(self::callback(static function ($venta) {
                return $venta instanceof Venta && $venta->totalAPagar()->value() === 20.0;
            }), self::equalTo(1), self::equalTo(2), self::equalTo(3));

        $printer->expects(self::once())
            ->method('imprimir')
            ->with(self::isInstanceOf(Venta::class));

        $useCase = new ProcesarVentaUseCase($repository, $printer);

        $venta = $useCase->execute([
            'items' => [
                ['product_id' => 1, 'nombre_producto' => 'Producto A', 'precio_unitario_venta' => 10.0, 'quantity' => 2],
            ],
            'dinero_recibido' => 20.0,
            'cliente_id' => 1,
            'empleado_id' => 2,
            'metodo_pago_id' => 3,
        ]);

        $this->assertSame('VD-000001', $venta->correlativoComprobante()->value());
        $this->assertSame(20.0, $venta->totalAPagar()->value());
    }

    public function test_execute_lanza_excepcion_cuando_el_pago_es_insuficiente(): void
    {
        $repository = $this->createMock(VentaRepositoryInterface::class);
        $printer = $this->createMock(ImpresoraPortInterface::class);

        $repository->expects(self::once())
            ->method('nextCorrelativo')
            ->willReturn('VD-000002');

        $useCase = new ProcesarVentaUseCase($repository, $printer);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('El dinero recibido no cubre el total a pagar.');

        $useCase->execute([
            'items' => [
                ['product_id' => 1, 'nombre_producto' => 'Producto A', 'precio_unitario_venta' => 10.0, 'quantity' => 2],
            ],
            'dinero_recibido' => 5.0,
        ]);
    }
}
