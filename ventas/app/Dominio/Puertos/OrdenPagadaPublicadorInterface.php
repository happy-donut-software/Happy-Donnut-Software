<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Eventos\OrdenPagada;

/**
 * Puerto de salida para publicar el evento OrdenPagada hacia otros microservicios.
 */
interface OrdenPagadaPublicadorInterface
{
    public function publicar(OrdenPagada $evento): void;
}