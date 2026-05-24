<?php

namespace App\ValueObjects;

final class TotalVenta
{
    private string $value;

    public function __construct($amount)
    {
        $normalized = is_numeric($amount) ? number_format((float) $amount, 2, '.', '') : null;

        if ($normalized === null || (float) $normalized < 0) {
            throw new \InvalidArgumentException("Total de venta inválido: {$amount}");
        }

        $this->value = $normalized;
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
