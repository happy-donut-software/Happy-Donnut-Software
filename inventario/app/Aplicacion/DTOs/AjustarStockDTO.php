<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * Objeto de transferencia de datos genérico para sumar o restar stock.
 * Se usa para transportar los datos desde la petición HTTP hacia el Caso de Uso.
 */
readonly class AjustarStockDTO
{
    public function __construct(
        public string $productoId,
        public int $cantidad
    ) {
    }
}