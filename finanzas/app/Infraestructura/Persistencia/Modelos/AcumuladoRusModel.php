<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;

class AcumuladoRusModel extends Model
{
    protected $table = 'acumulados_rus';
    protected $primaryKey = 'periodo';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['periodo', 'total', 'limite', 'estado'];
    protected $casts = ['total' => 'decimal:2', 'limite' => 'decimal:2'];
}