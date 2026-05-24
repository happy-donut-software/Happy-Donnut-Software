<?php

namespace Tests\Unit\Mocks;

use App\Core\Domain\Models\Venta;
use App\Core\Domain\Ports\ImpresoraPortInterface;

final class FakeImpresoraPort implements ImpresoraPortInterface
{
    private bool $printed = false;
    private ?Venta $lastVenta = null;

    public function imprimir(Venta $venta): void
    {
        $this->printed = true;
        $this->lastVenta = $venta;
    }

    public function wasPrinted(): bool
    {
        return $this->printed;
    }

    public function lastVenta(): ?Venta
    {
        return $this->lastVenta;
    }
}
