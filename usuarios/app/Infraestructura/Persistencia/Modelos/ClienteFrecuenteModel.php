<?php

declare(strict_types=1);
namespace App\Infraestructura\Persistencia\Modelos;
use Illuminate\Database\Eloquent\Model;
class ClienteFrecuenteModel extends Model { protected $table='clientes_frecuentes'; public $incrementing=false; protected $keyType='string'; protected $fillable=['id','nombre','telefono','direccion']; }