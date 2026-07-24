<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;

class ProductoInventarioModel extends Model
{
    protected $table = 'productos_inventario';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'nombre', 'stock_disponible', 'stock_minimo'];
    protected $casts = ['stock_disponible' => 'integer', 'stock_minimo' => 'integer'];
}
