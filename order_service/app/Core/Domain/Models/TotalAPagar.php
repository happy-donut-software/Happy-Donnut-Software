<?php

namespace App\Core\Domain\Models;

final class TotalAPagar
{
    private float $amount;

    public function __construct(float $amount)
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('El total a pagar debe ser un número positivo.');
        }

        $this->amount = round($amount, 2);
    }

    public function value(): float
    {
        return $this->amount;
    }
}
