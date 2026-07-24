<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Agregados\TurnoCaja;
use App\Dominio\Entidades\MovimientoCaja;
use App\Dominio\ObjetosValor\EstadoTurno;
use App\Dominio\ObjetosValor\Monto;
use App\Dominio\ObjetosValor\TipoMovimiento;
use App\Dominio\Puertos\TurnoCajaRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\MovimientoCajaModel;
use App\Infraestructura\Persistencia\Modelos\TurnoCajaModel;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

class EloquentTurnoCajaRepository implements TurnoCajaRepositoryInterface
{
    public function guardar(TurnoCaja $turno): void
    {
        // Usamos una transacciÃ³n para garantizar que Turno y Movimientos se guarden juntos o ninguno.
        DB::transaction(function () use ($turno) {
            
            // 1. Guardar o actualizar la RaÃ­z del Agregado (El Turno)
            TurnoCajaModel::updateOrCreate(
                ['id' => $turno->obtenerId()],
                [
                    'cajero_id' => $turno->obtenerCajeroId(),
                    'monto_apertura' => $turno->obtenerMontoApertura()->obtenerValor(),
                    'estado' => $turno->obtenerEstado()->value,
                    'fecha_inicio' => $turno->obtenerFechaInicio()->format('Y-m-d H:i:s'),
                    'fecha_cierre' => $turno->obtenerFechaCierre()?->format('Y-m-d H:i:s'),
                ]
            );

            // 2. Guardar los movimientos asociados (Las Entidades Locales)
            foreach ($turno->obtenerMovimientos() as $movimiento) {
                MovimientoCajaModel::updateOrCreate(
                    ['id' => $movimiento->obtenerId()],
                    [
                        'turno_caja_id' => $turno->obtenerId(),
                        'monto' => $movimiento->obtenerMonto()->obtenerValor(),
                        'tipo' => $movimiento->obtenerTipo()->value,
                        'fecha_hora' => $movimiento->obtenerFechaHora()->format('Y-m-d H:i:s'),
                        'descripcion' => $movimiento->obtenerDescripcion(),
                    ]
                );
            }
        });
    }

    public function buscarPorId(string $id): ?TurnoCaja
    {
        $modelo = TurnoCajaModel::with('movimientos')->find($id);

        if (!$modelo) {
            return null;
        }

        return $this->mapearADominio($modelo);
    }

    public function obtenerTurnoAbiertoActual(): ?TurnoCaja
    {
        $modelo = TurnoCajaModel::with('movimientos')
            ->where('estado', EstadoTurno::ABIERTO->value)
            ->first();

        if (!$modelo) {
            return null;
        }

        return $this->mapearADominio($modelo);
    }

    /**
     * Convierte un Modelo Eloquent a nuestra clase pura TurnoCaja (Data Mapper).
     */
    private function mapearADominio(TurnoCajaModel $modelo): TurnoCaja
    {
        $turno = new TurnoCaja(
            $modelo->id,
            $modelo->cajero_id,
            new Monto((float)$modelo->monto_apertura),
            DateTimeImmutable::createFromInterface($modelo->fecha_inicio),
            EstadoTurno::from($modelo->estado)
        );

        // Si el turno ya fue cerrado, le inyectamos la fecha mediante reflexiÃ³n o 
        // simulando el cierre (como el constructor es estricto). 
        // En un caso real mÃ¡s complejo se usa un "Reconstitutor" o se pasa al constructor.
        if ($modelo->fecha_cierre) {
            $propiedad = new \ReflectionProperty(TurnoCaja::class, 'fechaCierre');
            $propiedad->setValue($turno, DateTimeImmutable::createFromInterface($modelo->fecha_cierre));
        }

        // Reconstruimos e inyectamos los movimientos
        foreach ($modelo->movimientos as $movModel) {
            $movimiento = new MovimientoCaja(
                $movModel->id,
                new Monto((float)$movModel->monto),
                TipoMovimiento::from($movModel->tipo),
                new DateTimeImmutable($movModel->fecha_hora),
                $movModel->descripcion
            );
            
            // Inyectamos saltÃ¡ndonos validaciones usando ReflexiÃ³n 
            // ya que son datos que YA ocurrieron en el pasado.
            $propiedadMovs = new \ReflectionProperty(TurnoCaja::class, 'movimientos');
            $movimientosActuales = $propiedadMovs->getValue($turno);
            $movimientosActuales[] = $movimiento;
            $propiedadMovs->setValue($turno, $movimientosActuales);
        }

        return $turno;
    }
}