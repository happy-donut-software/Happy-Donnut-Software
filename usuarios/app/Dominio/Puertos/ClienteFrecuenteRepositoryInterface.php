<?php

declare(strict_types=1);
namespace App\Dominio\Puertos;
use App\Dominio\Agregados\ClienteFrecuente;
interface ClienteFrecuenteRepositoryInterface { /** @return ClienteFrecuente[] */ public function buscar(string $termino,int $limite=10): array; }