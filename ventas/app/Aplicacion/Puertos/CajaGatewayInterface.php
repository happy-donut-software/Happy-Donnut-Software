<?php

declare(strict_types=1);

namespace App\Aplicacion\Puertos;

interface CajaGatewayInterface
{
    public function hayTurnoAbierto(): bool;
}
