<?php

declare(strict_types=1);

namespace App\Infraestructura\Integraciones;

use App\Aplicacion\Puertos\CajaGatewayInterface;
use DomainException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class HttpCajaGateway implements CajaGatewayInterface
{
    public function hayTurnoAbierto(): bool
    {
        $url = (string) config('services.finanzas.caja_estado_url');
        if ($url === '') {
            throw new DomainException('No está configurada la verificación de caja.');
        }

        try {
            $response = Http::acceptJson()->timeout(5)->get($url);
        } catch (ConnectionException $exception) {
            throw new DomainException('No se pudo verificar el estado de la caja. Inténtalo nuevamente.', previous: $exception);
        }

        if (!$response->successful()) {
            throw new DomainException('Finanzas no pudo confirmar el estado de la caja.');
        }

        return (bool) $response->json('abierto', false);
    }
}
