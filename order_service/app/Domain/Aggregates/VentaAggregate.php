<?php

namespace App\Domain\Aggregates;

use App\Models\Cliente;
use App\Models\Venta;
use App\ValueObjects\EstadoPedido;
use App\ValueObjects\TotalVenta;
use Illuminate\Support\Carbon;

final class VentaAggregate
{
    private Venta $venta;
    private ?Cliente $cliente;

    private function __construct(Venta $venta, ?Cliente $cliente = null)
    {
        $this->venta = $venta;
        $this->cliente = $cliente;
    }

    public static function create(Cliente $cliente, TotalVenta $totalVenta, EstadoPedido $estadoPedido): self
    {
        $venta = new Venta([
            'cliente_id' => $cliente->cliente_id,
            'empleado_id' => 0,
            'total_venta' => $totalVenta,
            'estado_pedido' => $estadoPedido,
            'fecha_venta' => Carbon::now(),
        ]);

        return new self($venta, $cliente);
    }

    public static function fromModel(Venta $venta): self
    {
        return new self($venta, $venta->cliente ?? null);
    }

    public function cambiarEstado(EstadoPedido $estadoPedido): void
    {
        $this->venta->estado_pedido = $estadoPedido;
    }

    public function actualizarTotal(TotalVenta $totalVenta): void
    {
        $this->venta->total_venta = $totalVenta;
    }

    public function cliente(): ?Cliente
    {
        return $this->cliente;
    }

    public function venta(): Venta
    {
        return $this->venta;
    }

    public function guardar(): Venta
    {
        $this->venta->save();

        if ($this->cliente && ! $this->venta->cliente) {
            $this->venta->cliente()->associate($this->cliente);
            $this->venta->save();
        }

        return $this->venta;
    }
}
