<?php

namespace Tests\Unit\Mocks;

use App\Core\Domain\Models\Venta;
use App\Core\Domain\Ports\VentaRepositoryInterface;

final class InMemoryVentaRepository implements VentaRepositoryInterface
{
    private array $ventas = [];

    public function nextCorrelativo(): string
    {
        return str_pad((string) (count($this->ventas) + 1), 4, '0', STR_PAD_LEFT);
    }

    public function save(Venta $venta, ?int $clienteId = null, ?int $empleadoId = null, ?int $metodoPagoId = null): void
    {
        $this->ventas[] = [
            'venta' => $venta,
            'clienteId' => $clienteId,
            'empleadoId' => $empleadoId,
            'metodoPagoId' => $metodoPagoId,
        ];
    }

    public function savedVentas(): array
    {
        return $this->ventas;
    }
}
