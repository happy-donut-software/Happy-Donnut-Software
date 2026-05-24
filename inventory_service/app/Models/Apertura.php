<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Apertura extends Model
{
    use HasFactory;

    protected $table = 'aperturas';
    protected $primaryKey = 'id_apertura';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'fondo_inicial',
        'responsable_caja',
        'observaciones',
        'fecha',
        'hora',
    ];

    /**
     * Get the movimiento_dia associated with the apertura.
     */
    public function movimientoDia(): HasOne
    {
        return $this->hasOne(MovimientoDia::class, 'id_apertura', 'id_apertura');
    }
}
