<?php

namespace App\Core\Application\UseCases;

use App\Core\Domain\Models\CorrelativoComprobante;
use App\Core\Domain\Models\DineroRecibido;
use App\Core\Domain\Models\TotalAPagar;
use App\Core\Domain\Models\Venta;
use App\Core\Domain\Ports\ImpresoraPortInterface;
use App\Core\Domain\Ports\VentaRepositoryInterface;

final class ProcesarVentaUseCase
{
    public function __construct(
        private readonly VentaRepositoryInterface $ventaRepository,
        private readonly ImpresoraPortInterface $impresora
    ) {
    }

    public function execute(array $data): Venta
    {
        $correlativo = new CorrelativoComprobante($this->ventaRepository->nextCorrelativo());
        $totalAPagar = new TotalAPagar((float) ($data['total_apagar'] ?? 0));
        $dineroRecibido = new DineroRecibido((float) ($data['dinero_recibido'] ?? 0));
        $estadoPedido = $data['estado_pedido'] ?? 'pendiente';

        $venta = new Venta($correlativo, $totalAPagar, $estadoPedido);
        $venta->registrarPago($dineroRecibido);

        $this->ventaRepository->save(
            $venta,
            isset($data['cliente_id']) ? (int) $data['cliente_id'] : null,
            isset($data['empleado_id']) ? (int) $data['empleado_id'] : null,
            isset($data['metodo_pago_id']) ? (int) $data['metodo_pago_id'] : null,
        );

        $this->impresora->imprimir($venta);

        return $venta;
    }
}
