<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotaInventario extends Model
{
    protected $table = 'notas_inventario';
    protected $fillable = ['tipo', 'fecha', 'descripcion', 'user_id'];

    public function items()
    {
        return $this->hasMany(NotaItem::class, 'nota_inventario_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
