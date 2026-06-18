<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * Objeto de transferencia de datos para la apertura de caja.
 * Transporta la información limpia desde el Controlador hacia el Caso de Uso.
 */
readonly class AbrirTurnoDTO
{
    public function __construct(
        public string $cajeroId,
        public float $montoApertura
    ) {
    }
}