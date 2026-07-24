<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;

class EventoDominioModel extends Model
{
    protected $table = 'eventos_dominio';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'nombre', 'agregado_id', 'payload', 'ocurrido_en', 'publicado_en', 'intentos'];

    protected $casts = [
        'payload' => 'array',
        'ocurrido_en' => 'datetime',
        'publicado_en' => 'datetime',
        'intentos' => 'integer',
    ];
}