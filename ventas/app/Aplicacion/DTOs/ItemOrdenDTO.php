<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * DTO que representa un producto individual que el cliente quiere comprar.
 */
readonly class ItemOrdenDTO
{
    public function __construct(
        public string $productoId,
        public string $nombreProducto,
        public int $cantidad,
        public float $precioUnitario
    ) {
    }
}