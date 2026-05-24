<?php

namespace App\ValueObjects;

final class Email
{
    private string $value;

    public function __construct(string $email)
    {
        $email = trim($email);

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("Email inválido: {$email}");
        }

        $this->value = strtolower($email);
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
