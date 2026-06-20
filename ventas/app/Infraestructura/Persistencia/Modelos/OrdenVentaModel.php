<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo Eloquent para la tabla ordenes_venta.
 */
class OrdenVentaModel extends Model
{
    protected $table = 'ordenes_venta';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'cliente_id',
        'fecha_creacion',
        'estado',
        'total' // Lo guardamos pre-calculado para facilitar reportes
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'total' => 'decimal:2',
    ];

    public function lineas(): HasMany
    {
        return $this->hasMany(LineaOrdenModel::class, 'orden_venta_id', 'id');
    }
}