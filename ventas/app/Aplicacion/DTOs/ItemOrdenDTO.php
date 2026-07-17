<?php
declare(strict_types=1);
namespace App\Aplicacion\DTOs;

class ItemOrdenDTO
{
    public function __construct(
        public readonly string $productoId,
        public readonly int $cantidad
    ) {
    }
}