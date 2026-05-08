<?php

namespace App\Core\Infrastructure\Adapters;

use App\Core\Domain\Models\Venta;
use App\Core\Domain\Ports\VentaRepositoryInterface;
use App\Models\Pago;
use App\Models\Venta as VentaModel;

final class EloquentVentaRepository implements VentaRepositoryInterface
{
    public function nextCorrelativo(): string
    {
        $last = VentaModel::orderBy('venta_id', 'desc')->first();
        $next = $last ? $last->venta_id + 1 : 1;

        return sprintf('VD-%06d', $next);
    }

    public function save(Venta $venta, ?int $clienteId = null, ?int $empleadoId = null, ?int $metodoPagoId = null): void
    {
        $model = new VentaModel();
        $model->cliente_id = $clienteId;
        $model->empleado_id = $empleadoId ?? 0;
        $model->total_venta = $venta->totalAPagar()->value();
        $model->estado_pedido = $venta->estadoPedido();
        $model->fecha_venta = $venta->fechaVenta()->format('Y-m-d H:i:s');
        $model->save();

        if ($metodoPagoId !== null && $venta->dineroRecibido() !== null) {
            Pago::create([
                'venta_id' => $model->venta_id,
                'metodo_pago_id' => $metodoPagoId,
                'monto' => $venta->dineroRecibido()->value(),
            ]);
        }
    }
}
