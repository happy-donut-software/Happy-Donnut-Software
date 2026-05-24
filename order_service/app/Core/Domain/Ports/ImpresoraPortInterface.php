<?php

namespace App\Core\Domain\Ports;

use App\Core\Domain\Models\Venta;

interface ImpresoraPortInterface
{
    public function imprimir(Venta $venta): void;
}
