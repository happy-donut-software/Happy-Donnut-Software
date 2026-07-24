<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoVentaModel extends Model
{
    protected $table = 'productos_venta';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'nombre', 'categoria_id', 'descripcion', 'precio', 'imagen_url', 'activo'];
    protected $casts = ['precio' => 'decimal:2', 'activo' => 'boolean'];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaProductoModel::class, 'categoria_id');
    }
}
