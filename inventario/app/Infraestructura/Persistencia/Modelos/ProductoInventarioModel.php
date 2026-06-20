<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Eloquent para la tabla productos_inventario.
 */
class ProductoInventarioModel extends Model
{
    protected $table = 'productos_inventario';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'nombre',
        'stock_disponible'
    ];

    protected $casts = [
        'stock_disponible' => 'integer',
    ];
}