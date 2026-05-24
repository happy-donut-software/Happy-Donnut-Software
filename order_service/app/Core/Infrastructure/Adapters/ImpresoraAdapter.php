<?php

namespace App\Core\Infrastructure\Adapters;

use App\Core\Domain\Models\Venta;
use App\Core\Domain\Ports\ImpresoraPortInterface;
use Illuminate\Support\Facades\Log;

final class ImpresoraAdapter implements ImpresoraPortInterface
{
    public function imprimir(Venta $venta): void
    {
        $mensaje = sprintf(
            'Imprimiendo comprobante %s | Total: %.2f | Recibido: %.2f | Vuelto: %.2f',
            $venta->correlativoComprobante()->value(),
            $venta->totalAPagar()->value(),
            $venta->dineroRecibido()?->value() ?? 0.0,
            $venta->vueltoAEntregar()?->value() ?? 0.0,
        );

        Log::info($mensaje);
    }
}
