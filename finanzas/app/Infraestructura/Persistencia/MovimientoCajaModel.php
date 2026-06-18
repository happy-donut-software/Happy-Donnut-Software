<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;

class MovimientoCajaModel extends Model
{
    protected $table = 'movimientos_caja';
    
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $guarded = [];
}