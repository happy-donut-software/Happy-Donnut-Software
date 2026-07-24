<?php

declare(strict_types=1);
namespace App\Aplicacion\DTOs;
readonly class VentaFinalizadaDTO {
    /** @param array<int, array{producto_id:string,cantidad:int}> $lineas */
    public function __construct(public string $eventoId, public string $ventaId, public array $lineas) {}
}