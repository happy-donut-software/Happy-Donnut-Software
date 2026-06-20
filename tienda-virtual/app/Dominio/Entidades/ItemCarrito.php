<?php

declare(strict_types=1);

namespace App\Dominio\Entidades;

use DomainException;

/**
 * Representa un producto temporal dentro del carrito de compras del cliente.
 */
class ItemCarrito
{
    public function __construct(
        private readonly string $productoId,
        private readonly string $nombreProducto,
        private int $cantidad,
        private readonly float $precioUnitario
    ) {
        if ($this->cantidad <= 0) {
            throw new DomainException("La cantidad debe ser mayor a cero.");
        }
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

    /**
     * Permite sumar más unidades del mismo producto.
     */
    public function incrementarCantidad(int $cantidadExtra): void
    {
        if ($cantidadExtra <= 0) {
            throw new DomainException("La cantidad extra debe ser mayor a cero.");
        }
        $this->cantidad += $cantidadExtra;
    }

    /**
     * Permite reducir unidades. Si llega a 0, el Agregado (Carrito) deberá eliminar el ítem.
     */
    public function reducirCantidad(int $cantidadMenos): void
    {
        if ($cantidadMenos <= 0) {
            throw new DomainException("La cantidad a reducir debe ser mayor a cero.");
        }
        
        $this->cantidad -= $cantidadMenos;
        
        // No permitimos cantidades negativas en el ítem.
        if ($this->cantidad < 0) {
            $this->cantidad = 0;
        }
    }
}