<?php

namespace App\Core\Domain\Models;

final class CorrelativoComprobante
{
    private string $value;

    public function __construct(string $value)
    {
        $sanitized = trim($value);

        if ($sanitized === '') {
            throw new \InvalidArgumentException('El correlativo del comprobante no puede estar vacío.');
        }

        $this->value = $sanitized;
    }

    public function value(): string
    {
        return $this->value;
    }
}
