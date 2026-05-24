<?php

namespace App\Casts;

use App\ValueObjects\TotalVenta;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class TotalVentaCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return $value !== null ? new TotalVenta($value) : null;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof TotalVenta) {
            return $value->value();
        }

        return (new TotalVenta($value))->value();
    }
}
