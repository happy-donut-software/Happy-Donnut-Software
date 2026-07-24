<?php

declare(strict_types=1);
namespace App\Aplicacion\Puertos;
interface TransaccionInterface { public function ejecutar(callable $operacion): mixed; }