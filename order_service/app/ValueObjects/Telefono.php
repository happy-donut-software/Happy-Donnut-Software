<?php

namespace App\ValueObjects;

final class Telefono
{
    private string $value;

    public function __construct(string $telefono)
    {
        $telefono = trim($telefono);

        if ($telefono === '' || !preg_match('/^\+?[0-9\-\(\) ]+$/', $telefono)) {
            throw new \InvalidArgumentException("Teléfono inválido: {$telefono}");
        }

        $this->value = $telefono;
    }

    public function value(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
