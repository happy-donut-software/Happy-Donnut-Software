<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Dominio\Puertos\TokenRevocadorInterface;

class CerrarSesionUseCase
{
    public function __construct(
        private readonly TokenRevocadorInterface $tokenRevocador
    ) {
    }

    public function ejecutar(string $usuarioId, string $tokenId): void
    {
        $this->tokenRevocador->revocarToken($usuarioId, $tokenId);
    }
}