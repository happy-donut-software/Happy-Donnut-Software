<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Agregados\AcumuladoRus;
use App\Dominio\Puertos\AcumuladoRusRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\AcumuladoRusModel;
use App\Infraestructura\Persistencia\Modelos\EventoConsumidoModel;

class EloquentAcumuladoRusRepository implements AcumuladoRusRepositoryInterface
{
    public function buscarPorPeriodo(string $periodo): ?AcumuladoRus
    {
        $modelo = AcumuladoRusModel::find($periodo);
        return $modelo ? new AcumuladoRus($modelo->periodo, (float) $modelo->total, (float) $modelo->limite) : null;
    }
    public function guardar(AcumuladoRus $acumulado): void
    {
        AcumuladoRusModel::updateOrCreate(['periodo' => $acumulado->obtenerPeriodo()], [
            'total' => $acumulado->obtenerTotal(), 'limite' => $acumulado->obtenerLimite(), 'estado' => $acumulado->obtenerEstado(),
        ]);
    }
    public function eventoFueProcesado(string $eventoId): bool { return EventoConsumidoModel::whereKey($eventoId)->exists(); }
    public function marcarEventoProcesado(string $eventoId): void { EventoConsumidoModel::firstOrCreate(['id' => $eventoId], ['procesado_en' => now()]); }
}