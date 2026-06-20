<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Modelos;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modelo Eloquent para la tabla usuarios.
 * IMPORTANTE: Usamos el trait "HasApiTokens" para que Sanctum pueda generar
 * tokens de acceso vinculados a este modelo.
 */
class UsuarioModel extends Model
{
    use HasApiTokens;

    protected $table = 'usuarios';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'nombre',
        'correo',
        'password',
        'rol'
    ];

    // Ocultamos la contraseña al serializar para que NUNCA viaje en un JSON por accidente
    protected $hidden = [
        'password',
    ];
}