<?php

namespace App\Casts;

use App\ValueObjects\Telefono;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class TelefonoCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return $value !== null ? new Telefono($value) : null;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof Telefono) {
            return $value->value();
        }

        return (new Telefono($value))->value();
    }
}
