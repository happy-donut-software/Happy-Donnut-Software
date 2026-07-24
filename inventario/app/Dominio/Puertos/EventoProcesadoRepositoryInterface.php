<?php

declare(strict_types=1);
namespace App\Dominio\Puertos;
interface EventoProcesadoRepositoryInterface { public function fueProcesado(string $eventoId): bool; public function marcarProcesado(string $eventoId): void; }