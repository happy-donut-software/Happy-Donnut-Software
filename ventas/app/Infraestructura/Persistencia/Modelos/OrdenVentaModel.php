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
        'total', 'monto_recibido', 'vuelto', 'metodo_pago', 'tipo_comprobante'
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'total' => 'decimal:2',
        'monto_recibido' => 'decimal:2',
        'vuelto' => 'decimal:2',
    ];

    public function lineas(): HasMany
    {
        return $this->hasMany(LineaOrdenModel::class, 'orden_venta_id', 'id');
    }
}