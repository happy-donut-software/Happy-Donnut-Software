<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotaItem extends Model
{
    protected $table = 'nota_items';
    protected $fillable = ['nota_inventario_id', 'insumo_id', 'producto_id', 'cantidad'];

    public function nota()
    {
        return $this->belongsTo(NotaInventario::class, 'nota_inventario_id');
    }

    public function insumo()
    {
        return $this->belongsTo(Insumo::class, 'insumo_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}
