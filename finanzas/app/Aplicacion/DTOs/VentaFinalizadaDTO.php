<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

readonly class VentaFinalizadaDTO
{
    public function __construct(
        public string $eventoId,
        public string $ventaId,
        public float $total,
        public string $tipoComprobante,
        public string $metodoPago,
        public string $ocurridoEn
    ) {}
}