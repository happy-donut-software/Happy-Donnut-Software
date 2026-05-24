<?php

namespace App\ValueObjects;

final class EstadoPedido
{
    private string $value;

    private const VALID_STATES = [
        'recibido',
        'procesando',
        'enviado',
        'entregado',
        'cancelado',
    ];

    public function __construct(string $estado)
    {
        $value = trim(strtolower($estado));

        if ($value === '' || !in_array($value, self::VALID_STATES, true)) {
            throw new \InvalidArgumentException("Estado de pedido inválido: {$estado}");
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    public static function validStates(): array
    {
        return self::VALID_STATES;
    }
}
