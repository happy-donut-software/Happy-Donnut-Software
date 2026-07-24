<?php

declare(strict_types=1);
namespace App\Infraestructura\Persistencia\Modelos;
use Illuminate\Database\Eloquent\Model;
class EventoConsumidoModel extends Model {
    protected $table='eventos_consumidos'; public $incrementing=false; protected $keyType='string';
    protected $fillable=['id','procesado_en']; protected $casts=['procesado_en'=>'datetime'];
}