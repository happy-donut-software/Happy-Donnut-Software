<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\AutenticarUsuarioDTO;
use App\Dominio\Agregados\Usuario;
use App\Dominio\Puertos\PasswordHasherInterface;
use App\Dominio\Puertos\UsuarioRepositoryInterface;
use DomainException;

/**
 * Caso de Uso: Valida credenciales para iniciar sesión.
 * NOTA: Este caso de uso NO genera el Token de Sanctum. Solo valida quién es.
 * La generación del token es un detalle de infraestructura HTTP que haremos en el Controlador.
 */
class AutenticarUsuarioUseCase
{
    public function __construct(
        private readonly UsuarioRepositoryInterface $repositorio,
        private readonly PasswordHasherInterface $hasher
    ) {
    }

    public function ejecutar(AutenticarUsuarioDTO $dto): Usuario
    {
        // 1. Buscar usuario por email (usamos el string plano, no el Objeto de Valor
        // porque si el email es inválido, simplemente no lo encontrará).
        $usuario = $this->repositorio->buscarPorEmail($dto->email);

        if ($usuario === null) {
            throw new DomainException("Credenciales incorrectas.");
        }

        // 2. Verificar la contraseña usando el puerto
        $esValida = $this->hasher->verificar($dto->passwordRaw, $usuario->obtenerPasswordHashed());

        if (!$esValida) {
            throw new DomainException("Credenciales incorrectas.");
        }

        return $usuario;
    }
}