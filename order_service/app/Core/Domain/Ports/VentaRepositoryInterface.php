<?php

namespace App\Core\Domain\Ports;

use App\Core\Domain\Models\Venta;

interface VentaRepositoryInterface
{
    public function nextCorrelativo(): string;

    public function save(Venta $venta, ?int $clienteId = null, ?int $empleadoId = null, ?int $metodoPagoId = null): void;
}
