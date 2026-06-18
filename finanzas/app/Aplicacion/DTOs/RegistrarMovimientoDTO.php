<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * DTO para registrar ingresos o salidas de dinero en la caja.
 */
readonly class RegistrarMovimientoDTO
{
    public function __construct(
        public float $monto,
        public string $tipoMovimiento, // string plano que luego convertiremos a Enum
        public ?string $descripcion = null
    ) {
    }
}