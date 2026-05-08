<?php

namespace App\Core\Domain\Models;

final class Venta
{
    private CorrelativoComprobante $correlativoComprobante;
    private TotalAPagar $totalAPagar;
    private ?DineroRecibido $dineroRecibido = null;
    private ?VueltoAEntregar $vueltoAEntregar = null;
    private string $estadoPedido;
    private \DateTimeImmutable $fechaVenta;

    public function __construct(
        CorrelativoComprobante $correlativoComprobante,
        TotalAPagar $totalAPagar,
        string $estadoPedido = 'pendiente'
    ) {
        $this->correlativoComprobante = $correlativoComprobante;
        $this->totalAPagar = $totalAPagar;
        $this->estadoPedido = $estadoPedido;
        $this->fechaVenta = new \DateTimeImmutable();
    }

    public function registrarPago(DineroRecibido $dineroRecibido): void
    {
        if ($dineroRecibido->value() < $this->totalAPagar->value()) {
            throw new \DomainException('El dinero recibido no cubre el total a pagar.');
        }

        $this->dineroRecibido = $dineroRecibido;
        $this->vueltoAEntregar = new VueltoAEntregar(
            round($dineroRecibido->value() - $this->totalAPagar->value(), 2)
        );
    }

    public function correlativoComprobante(): CorrelativoComprobante
    {
        return $this->correlativoComprobante;
    }

    public function totalAPagar(): TotalAPagar
    {
        return $this->totalAPagar;
    }

    public function dineroRecibido(): ?DineroRecibido
    {
        return $this->dineroRecibido;
    }

    public function vueltoAEntregar(): ?VueltoAEntregar
    {
        return $this->vueltoAEntregar;
    }

    public function estadoPedido(): string
    {
        return $this->estadoPedido;
    }

    public function fechaVenta(): \DateTimeImmutable
    {
        return $this->fechaVenta;
    }

    public function toArray(): array
    {
        return [
            'correlativo_comprobante' => $this->correlativoComprobante->value(),
            'total_a_pagar' => $this->totalAPagar->value(),
            'dinero_recibido' => $this->dineroRecibido?->value(),
            'vuelto_a_entregar' => $this->vueltoAEntregar?->value(),
            'estado_pedido' => $this->estadoPedido,
            'fecha_venta' => $this->fechaVenta->format('Y-m-d H:i:s'),
        ];
    }
}
