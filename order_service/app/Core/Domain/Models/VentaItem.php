<?php

namespace App\Core\Domain\Models;

final class VentaItem
{
    private int $productoId;
    private string $nombreProducto;
    private float $precioUnitario;
    private int $cantidad;

    public function __construct(int $productoId, string $nombreProducto, float $precioUnitario, int $cantidad)
    {
        if ($cantidad <= 0) {
            throw new \DomainException('La cantidad debe ser mayor a cero.');
        }

        if ($precioUnitario < 0) {
            throw new \DomainException('El precio unitario no puede ser negativo.');
        }

        $this->productoId = $productoId;
        $this->nombreProducto = $nombreProducto;
        $this->precioUnitario = round($precioUnitario, 2);
        $this->cantidad = $cantidad;
    }

    public function productoId(): int
    {
        return $this->productoId;
    }

    public function nombreProducto(): string
    {
        return $this->nombreProducto;
    }

    public function precioUnitario(): float
    {
        return $this->precioUnitario;
    }

    public function cantidad(): int
    {
        return $this->cantidad;
    }

    public function subtotal(): float
    {
        return round($this->precioUnitario * $this->cantidad, 2);
    }

    public function toArray(): array
    {
        return [
            'producto_id' => $this->productoId,
            'nombre_producto' => $this->nombreProducto,
            'precio_unitario_venta' => $this->precioUnitario,
            'cantidad' => $this->cantidad,
            'subtotal' => $this->subtotal(),
        ];
    }
}
