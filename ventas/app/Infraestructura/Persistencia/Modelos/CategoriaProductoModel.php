<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaProductoModel extends Model
{
    protected $table = 'categorias_producto';
    protected $fillable = ['nombre', 'slug', 'descripcion', 'activa'];
    protected $casts = ['activa' => 'boolean'];

    public function productos(): HasMany
    {
        return $this->hasMany(ProductoVentaModel::class, 'categoria_id');
    }
}
