<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo Eloquent para la tabla carritos_compras.
 */
class CarritoModel extends Model
{
    protected $table = 'carritos_compras';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'cliente_id',
        'total_estimado'
    ];

    protected $casts = [
        'total_estimado' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ItemCarritoModel::class, 'carrito_id', 'id');
    }
}