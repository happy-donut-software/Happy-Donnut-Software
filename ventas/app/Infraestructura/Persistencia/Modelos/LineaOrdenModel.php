<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Eloquent para la tabla lineas_orden.
 */
class LineaOrdenModel extends Model
{
    protected $table = 'lineas_orden';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'orden_venta_id',
        'producto_id',
        'nombre_producto',
        'cantidad',
        'precio_unitario'
    ];

    protected $casts = [
        'precio_unitario' => 'decimal:2',
        'cantidad' => 'integer',
    ];
}