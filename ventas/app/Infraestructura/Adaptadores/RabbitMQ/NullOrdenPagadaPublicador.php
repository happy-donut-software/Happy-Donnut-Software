<?php

declare(strict_types=1);

namespace App\Infraestructura\Adaptadores\RabbitMQ;

use App\Dominio\Eventos\OrdenPagada;
use App\Dominio\Puertos\OrdenPagadaPublicadorInterface;

/**
 * Adaptador nulo para entornos de prueba o desarrollo sin broker.
 */
class NullOrdenPagadaPublicador implements OrdenPagadaPublicadorInterface
{
    /** @var OrdenPagada[] */
    private static array $publicados = [];

    public function publicar(OrdenPagada $evento): void
    {
        self::$publicados[] = $evento;
    }

    /** @return OrdenPagada[] */
    public static function obtenerPublicados(): array
    {
        return self::$publicados;
    }

    public static function limpiar(): void
    {
        self::$publicados = [];
    }
}