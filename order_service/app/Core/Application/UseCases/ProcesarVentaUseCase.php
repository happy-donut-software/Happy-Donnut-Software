<?php

namespace App\Core\Application\UseCases;

use App\Core\Domain\Models\CorrelativoComprobante;
use App\Core\Domain\Models\DineroRecibido;
use App\Core\Domain\Models\TotalAPagar;
use App\Core\Domain\Models\Venta;
use App\Core\Domain\Models\VentaItem;
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
        if (empty($data['items']) || !is_array($data['items'])) {
            throw new \DomainException('La orden debe contener al menos un ítem.');
        }

        $correlativo = new CorrelativoComprobante($this->ventaRepository->nextCorrelativo());
        $venta = new Venta($correlativo, new TotalAPagar(0.0), $data['estado_pedido'] ?? 'pendiente');

        foreach ($data['items'] as $itemData) {
            $venta->agregarItem(new VentaItem(
                (int) ($itemData['product_id'] ?? 0),
                (string) ($itemData['nombre_producto'] ?? ''),
                (float) ($itemData['precio_unitario_venta'] ?? 0),
                (int) ($itemData['quantity'] ?? 0)
            ));
        }

        $dineroRecibido = new DineroRecibido((float) ($data['dinero_recibido'] ?? 0));
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
