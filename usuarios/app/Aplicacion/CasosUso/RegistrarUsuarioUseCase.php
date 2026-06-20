<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\RegistrarUsuarioDTO;
use App\Dominio\Agregados\Usuario;
use App\Dominio\ObjetosValor\Email;
use App\Dominio\ObjetosValor\RolUsuario;
use App\Dominio\Puertos\PasswordHasherInterface;
use App\Dominio\Puertos\UsuarioRepositoryInterface;
use DomainException;
use ValueError;

/**
 * Caso de Uso: Permite a un administrador registrar nuevos empleados o clientes.
 */
class RegistrarUsuarioUseCase
{
    public function __construct(
        private readonly UsuarioRepositoryInterface $repositorio,
        private readonly PasswordHasherInterface $hasher
    ) {
    }

    public function ejecutar(RegistrarUsuarioDTO $dto): Usuario
    {
        // 1. Validar si el email ya existe
        if ($this->repositorio->buscarPorEmail($dto->email) !== null) {
            throw new DomainException("El correo electrónico ya está registrado.");
        }

        // 2. Convertir datos primitivos a Objetos de Valor (Validación de negocio)
        $email = new Email($dto->email);
        
        try {
            $rol = RolUsuario::from($dto->rol);
        } catch (ValueError $e) {
            throw new DomainException("El rol proporcionado no es válido.");
        }

        // 3. Hashear la contraseña usando el puerto
        $passwordHashed = $this->hasher->hashear($dto->passwordRaw);

        // 4. Crear la Raíz del Agregado
        $usuarioId = uniqid('usr_');
        $usuario = new Usuario(
            $usuarioId,
            $dto->nombre,
            $email,
            $passwordHashed,
            $rol
        );

        // 5. Guardar
        $this->repositorio->guardar($usuario);

        return $usuario;
    }
}