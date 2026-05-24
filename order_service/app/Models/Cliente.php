<?php

// app/Models/Cliente.php
namespace App\Models;

use App\Casts\EmailCast;
use App\Casts\TelefonoCast;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $primaryKey = 'cliente_id';
    protected $fillable = ['nombre', 'apellido', 'telefono', 'email'];

    protected $casts = [
        'email' => EmailCast::class,
        'telefono' => TelefonoCast::class,
    ];

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'cliente_id');
    }
}