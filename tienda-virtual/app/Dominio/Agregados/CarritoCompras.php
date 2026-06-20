<?php

declare(strict_types=1);

namespace App\Dominio\Agregados;

use App\Dominio\Entidades\ItemCarrito;

/**
 * Raíz del Agregado de la Tienda Virtual.
 * Controla la intención de compra del cliente antes de convertirse en una orden real.
 */
class CarritoCompras
{
    /** @var ItemCarrito[] */
    private array $items = [];

    public function __construct(
        private readonly string $id, // ID del carrito o de la sesión
        private readonly string $clienteId
    ) {
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerClienteId(): string
    {
        return $this->clienteId;
    }

    /**
     * @return ItemCarrito[]
     */
    public function obtenerItems(): array
    {
        return $this->items;
    }

    public function agregarProducto(
        string $productoId, 
        string $nombreProducto, 
        int $cantidad, 
        float $precioUnitario
    ): void {
        // Regla: Si el producto ya está en el carrito, solo sumamos la cantidad.
        foreach ($this->items as $item) {
            if ($item->obtenerProductoId() === $productoId) {
                $item->incrementarCantidad($cantidad);
                return;
            }
        }

        // Si no está, lo agregamos como un ítem nuevo.
        $this->items[] = new ItemCarrito(
            $productoId, 
            $nombreProducto, 
            $cantidad, 
            $precioUnitario
        );
    }

    public function removerProducto(string $productoId): void
    {
        // Filtramos el array para dejar todos los ítems excepto el que queremos borrar.
        $this->items = array_values(array_filter(
            $this->items,
            fn(ItemCarrito $item) => $item->obtenerProductoId() !== $productoId
        ));
    }

    public function calcularTotalEstimado(): float
    {
        $total = 0.0;
        foreach ($this->items as $item) {
            $total += $item->calcularSubtotal();
        }
        return $total;
    }

    public function vaciar(): void
    {
        $this->items = [];
    }
}