<?php

declare(strict_types=1);
namespace App\Dominio\Agregados;
use DomainException;
readonly class ClienteFrecuente { public function __construct(public string $id,public string $nombre,public string $telefono,public ?string $direccion=null) { if(trim($id)===''||trim($nombre)===''||!preg_match('/^[0-9+ -]{6,20}$/',$telefono)){throw new DomainException('Datos de cliente frecuente invalidos.');} } }