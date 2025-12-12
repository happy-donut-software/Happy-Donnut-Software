<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoDia extends Model
{
    use HasFactory;

    protected $table = 'movimientos_dias';
    protected $primaryKey = 'id_movimiento_dia';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_apertura',
        'total_entradas',
        'total_salidas',
        'total_ventas',
        'total_gastos',
        'total_efectivo_caja',
    ];

    /**
     * Get the apertura that owns the movimiento_dia.
     */
    public function apertura(): BelongsTo
    {
        return $this->belongsTo(Apertura::class, 'id_apertura', 'id_apertura');
    }
}
