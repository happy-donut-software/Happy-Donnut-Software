<?php

namespace App\Casts;

use App\ValueObjects\EstadoPedido;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class EstadoPedidoCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return $value !== null ? new EstadoPedido($value) : null;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof EstadoPedido) {
            return $value->value();
        }

        return (new EstadoPedido($value))->value();
    }
}
