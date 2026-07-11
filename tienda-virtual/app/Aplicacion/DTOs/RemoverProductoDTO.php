<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

readonly class RemoverProductoDTO
{
    public function __construct(
        public string $clienteId,
        public string $productoId
    ) {
    }
}