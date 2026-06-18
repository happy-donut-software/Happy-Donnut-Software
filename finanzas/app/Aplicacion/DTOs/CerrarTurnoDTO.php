<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * DTO para el cierre de caja. 
 * Solo requiere que el cajero indique cuánto dinero físico contó en el cajón.
 */
readonly class CerrarTurnoDTO
{
    public function __construct(
        public float $dineroFisicoReal
    ) {
    }
}