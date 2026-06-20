<?php

declare(strict_types=1);

namespace App\Dominio\Entidades;

use DomainException;

/**
 * Representa un ítem dentro de la orden (ej: "2 Donas de Chocolate a $1.50 c/u").
 * Es una Entidad porque tiene identidad local dentro de la Orden.
 */
class LineaOrden
{
    public function __construct(
        private readonly string $id,
        private readonly string $productoId,
        private readonly string $nombreProducto,
        private readonly int $cantidad,
        private readonly float $precioUnitario
    ) {
        if ($this->cantidad <= 0) {
            throw new DomainException("La cantidad debe ser mayor a cero.");
        }
        if ($this->precioUnitario < 0) {
            throw new DomainException("El precio unitario no puede ser negativo.");
        }
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerProductoId(): string
    {
        return $this->productoId;
    }

    public function obtenerNombreProducto(): string
    {
        return $this->nombreProducto;
    }

    public function obtenerCantidad(): int
    {
        return $this->cantidad;
    }

    public function obtenerPrecioUnitario(): float
    {
        return $this->precioUnitario;
    }

    public function calcularSubtotal(): float
    {
        return $this->cantidad * $this->precioUnitario;
    }
}