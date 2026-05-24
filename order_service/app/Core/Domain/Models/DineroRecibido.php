<?php

namespace App\Core\Domain\Models;

final class DineroRecibido
{
    private float $amount;

    public function __construct(float $amount)
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('El dinero recibido no puede ser negativo.');
        }

        $this->amount = round($amount, 2);
    }

    public function value(): float
    {
        return $this->amount;
    }
}
