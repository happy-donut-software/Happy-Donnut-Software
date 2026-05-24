<?php

use App\Core\Application\UseCases\ProcesarVentaUseCase;
use App\Core\Domain\Models\DineroRecibido;
use App\Core\Domain\Models\Venta;
use App\Core\Domain\Models\VentaItem;
use DomainException;
use Tests\Unit\Mocks\FakeImpresoraPort;
use Tests\Unit\Mocks\InMemoryVentaRepository;

it('processes a sale with valid items and persists it', function () {
    $repository = new InMemoryVentaRepository();
    $printer = new FakeImpresoraPort();
    $useCase = new ProcesarVentaUseCase($repository, $printer);

    $payload = [
        'items' => [
            [
                'product_id' => 101,
                'nombre_producto' => 'Cafe',
                'precio_unitario_venta' => 40.0,
                'quantity' => 2,
            ],
        ],
        'dinero_recibido' => 100.0,
        'cliente_id' => 12,
        'empleado_id' => 5,
        'metodo_pago_id' => 1,
    ];

    $venta = $useCase->execute($payload);

    expect($venta)->toBeInstanceOf(Venta::class)
        ->and($venta->totalAPagar()->value())->toBe(80.0)
        ->and($venta->vueltoAEntregar()?->value())->toBe(20.0)
        ->and($venta->items())->toHaveCount(1)
        ->and($printer->wasPrinted())->toBeTrue()
        ->and($repository->savedVentas())->toHaveCount(1);
});

it('throws when the order has no items', function () {
    $repository = new InMemoryVentaRepository();
    $printer = new FakeImpresoraPort();
    $useCase = new ProcesarVentaUseCase($repository, $printer);

    $payload = [
        'items' => [],
        'dinero_recibido' => 100.0,
    ];

    $useCase->execute($payload);
})->throws(DomainException::class, 'La orden debe contener al menos un ítem.');

it('throws when the payment does not cover the total', function () {
    $repository = new InMemoryVentaRepository();
    $printer = new FakeImpresoraPort();
    $useCase = new ProcesarVentaUseCase($repository, $printer);

    $payload = [
        'items' => [
            [
                'product_id' => 101,
                'nombre_producto' => 'Cafe',
                'precio_unitario_venta' => 50.0,
                'quantity' => 1,
            ],
        ],
        'dinero_recibido' => 10.0,
    ];

    $useCase->execute($payload);
})->throws(DomainException::class, 'El dinero recibido no cubre el total a pagar.');
