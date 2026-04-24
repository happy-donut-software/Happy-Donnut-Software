<?php

namespace App\Domain\Aggregates;

use App\Models\Cliente;
use App\ValueObjects\Email;
use App\ValueObjects\Telefono;

final class ClienteAggregate
{
    private Cliente $cliente;

    private function __construct(Cliente $cliente)
    {
        $this->cliente = $cliente;
    }

    public static function create(string $nombre, string $apellido, Email $email, Telefono $telefono): self
    {
        $cliente = new Cliente([
            'nombre' => $nombre,
            'apellido' => $apellido,
            'email' => $email,
            'telefono' => $telefono,
        ]);

        return new self($cliente);
    }

    public static function fromModel(Cliente $cliente): self
    {
        return new self($cliente);
    }

    public function cambiarEmail(Email $email): void
    {
        $this->cliente->email = $email;
    }

    public function cambiarTelefono(Telefono $telefono): void
    {
        $this->cliente->telefono = $telefono;
    }

    public function cambiarNombreApellido(string $nombre, string $apellido): void
    {
        $this->cliente->nombre = $nombre;
        $this->cliente->apellido = $apellido;
    }

    public function cliente(): Cliente
    {
        return $this->cliente;
    }

    public function guardar(): Cliente
    {
        $this->cliente->save();

        return $this->cliente;
    }
}
