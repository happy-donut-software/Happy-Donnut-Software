<?php

declare(strict_types=1);

namespace App\Dominio\Agregados;

use App\Dominio\Entidades\LineaOrden;
use App\Dominio\ObjetosValor\EstadoOrden;
use DateTimeImmutable;
use DomainException;

/**
 * Raíz del Agregado de Ventas.
 * Controla toda la lógica matemática y de estado de un pedido en la tienda.
 */
class OrdenVenta
{
    /** @var LineaOrden[] */
    private array $lineas = [];

    public function __construct(
        private readonly string $id,
        private readonly ?string $clienteId,
        private readonly DateTimeImmutable $fechaCreacion,
        private EstadoOrden $estado = EstadoOrden::PENDIENTE
    ) {
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerClienteId(): ?string 
    {
        return $this->clienteId;
    }

    public function obtenerEstado(): EstadoOrden
    {
        return $this->estado;
    }

    /**
     * @return LineaOrden[]
     */
    public function obtenerLineas(): array
    {
        return $this->lineas;
    }

    public function agregarLinea(LineaOrden $linea): void
    {
        if ($this->estado !== EstadoOrden::PENDIENTE) {
            throw new DomainException("No se pueden agregar productos a una orden que ya no está pendiente.");
        }

        $this->lineas[] = $linea;
    }

    public function calcularTotal(): float
    {
        $total = 0.0;
        foreach ($this->lineas as $linea) {
            $total += $linea->calcularSubtotal();
        }
        return $total;
    }

    public function marcarComoPagada(): void
    {
        if (!$this->estado->puedeSerPagada()) {
            throw new DomainException("Esta orden no está en estado pendiente para ser pagada.");
        }
        
        $this->estado = EstadoOrden::PAGADA;
    }

    public function cancelar(): void
    {
        if (!$this->estado->puedeSerCancelada()) {
            throw new DomainException("Esta orden ya no puede ser cancelada.");
        }

        $this->estado = EstadoOrden::CANCELADA;
    }
    
    public function obtenerFechaCreacion(): DateTimeImmutable
    {
        return $this->fechaCreacion;
    }
}