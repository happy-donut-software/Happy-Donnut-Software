<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Eloquent para la tabla items_carrito.
 */
class ItemCarritoModel extends Model
{
    protected $table = 'items_carrito';

    protected $fillable = [
        'carrito_id',
        'producto_id',
        'nombre_producto',
        'cantidad',
        'precio_unitario'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
    ];
}