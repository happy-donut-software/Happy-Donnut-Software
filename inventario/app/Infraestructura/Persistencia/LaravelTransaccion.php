<?php

declare(strict_types=1);
namespace App\Infraestructura\Persistencia;
use App\Aplicacion\Puertos\TransaccionInterface;
use Illuminate\Support\Facades\DB;
class LaravelTransaccion implements TransaccionInterface { public function ejecutar(callable $operacion): mixed { return DB::transaction($operacion); } }