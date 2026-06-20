<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * DTO que transporta los datos cuando un cliente da clic en "Agregar al Carrito".
 */
readonly class AgregarProductoDTO
{
    public function __construct(
        public string $clienteId, // ID del cliente logueado o ID de sesión temporal
        public string $productoId,
        public string $nombreProducto,
        public int $cantidad,
        public float $precioUnitario
    ) {
    }
}