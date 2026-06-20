<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo de Eloquent (Infraestructura) para la tabla turnos_caja.
 */
class TurnoCajaModel extends Model
{
    protected $table = 'turnos_caja';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'cajero_id',
        'monto_apertura',
        'fecha_inicio',
        'fecha_cierre',
        'estado'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_cierre' => 'datetime',
        'monto_apertura' => 'decimal:2',
    ];

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoCajaModel::class, 'turno_id', 'id');
    }
}