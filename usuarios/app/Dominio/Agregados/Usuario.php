<?php

declare(strict_types=1);

namespace App\Dominio\Agregados;

use App\Dominio\ObjetosValor\Email;
use App\Dominio\ObjetosValor\RolUsuario;
use DomainException;

/**
 * Raíz del Agregado de Usuarios.
 * Representa a una persona (empleado o cliente) que puede interactuar con el sistema.
 */
class Usuario
{
    public function __construct(
        private readonly string $id,
        private string $nombre,
        private Email $email,
        private string $passwordHashed,
        private RolUsuario $rol
    ) {
        if (trim($this->nombre) === '') {
            throw new DomainException("El nombre del usuario no puede estar vacío.");
        }
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerNombre(): string
    {
        return $this->nombre;
    }

    public function obtenerEmail(): Email
    {
        return $this->email;
    }

    public function obtenerPasswordHashed(): string
    {
        return $this->passwordHashed;
    }

    public function obtenerRol(): RolUsuario
    {
        return $this->rol;
    }

    /**
     * Regla de Negocio: Permitir cambiar el rol (ej. ascender de cajero a admin).
     */
    public function cambiarRol(RolUsuario $nuevoRol): void
    {
        $this->rol = $nuevoRol;
    }

    /**
     * Regla de Negocio: Permitir actualizar la contraseña de forma segura.
     */
    public function actualizarPassword(string $nuevoPasswordHashed): void
    {
        if (trim($nuevoPasswordHashed) === '') {
            throw new DomainException("El hash de la contraseña no puede estar vacío.");
        }
        $this->passwordHashed = $nuevoPasswordHashed;
    }
}