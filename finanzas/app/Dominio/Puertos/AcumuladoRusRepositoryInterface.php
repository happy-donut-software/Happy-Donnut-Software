<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Agregados\AcumuladoRus;

interface AcumuladoRusRepositoryInterface
{
    public function buscarPorPeriodo(string $periodo): ?AcumuladoRus;
    public function guardar(AcumuladoRus $acumulado): void;
    public function eventoFueProcesado(string $eventoId): bool;
    public function marcarEventoProcesado(string $eventoId): void;
}