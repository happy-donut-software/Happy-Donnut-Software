<?php

declare(strict_types=1);
namespace App\Infraestructura\Persistencia\Modelos;
use Illuminate\Database\Eloquent\Model;
class ProductoVentaModel extends Model { protected $table='productos_venta'; public $incrementing=false; protected $keyType='string'; protected $fillable=['id','nombre','precio','activo']; protected $casts=['precio'=>'decimal:2','activo'=>'boolean']; }