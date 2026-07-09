<?php

declare(strict_types=1);

namespace App\Infraestructura\Seguridad;

use App\Dominio\Puertos\TokenRevocadorInterface;
use App\Infraestructura\Persistencia\Modelos\UsuarioModel;
use Laravel\Sanctum\PersonalAccessToken;

class SanctumTokenRevocador implements TokenRevocadorInterface
{
    public function revocarToken(string $usuarioId, string $tokenId): void
    {
        $token = PersonalAccessToken::find($tokenId);

        if ($token !== null && (string) $token->tokenable_id === $usuarioId) {
            $token->delete();
        }
    }
}