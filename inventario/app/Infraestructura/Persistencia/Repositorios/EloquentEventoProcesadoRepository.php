<?php

declare(strict_types=1);
namespace App\Infraestructura\Persistencia\Repositorios;
use App\Dominio\Puertos\EventoProcesadoRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\EventoConsumidoModel;
class EloquentEventoProcesadoRepository implements EventoProcesadoRepositoryInterface {
    public function fueProcesado(string $eventoId): bool { return EventoConsumidoModel::whereKey($eventoId)->exists(); }
    public function marcarProcesado(string $eventoId): void { EventoConsumidoModel::firstOrCreate(['id'=>$eventoId],['procesado_en'=>now()]); }
}