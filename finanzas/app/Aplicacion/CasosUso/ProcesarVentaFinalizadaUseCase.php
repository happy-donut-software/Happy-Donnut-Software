<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\VentaFinalizadaDTO;
use App\Aplicacion\Puertos\TransaccionInterface;
use App\Dominio\Agregados\AcumuladoRus;
use App\Dominio\Entidades\MovimientoCaja;
use App\Dominio\ObjetosValor\Monto;
use App\Dominio\ObjetosValor\TipoMovimiento;
use App\Dominio\Puertos\AcumuladoRusRepositoryInterface;
use App\Dominio\Puertos\TurnoCajaRepositoryInterface;
use DateTimeImmutable;
use DomainException;

class ProcesarVentaFinalizadaUseCase
{
    public function __construct(
        private readonly TurnoCajaRepositoryInterface $turnos,
        private readonly AcumuladoRusRepositoryInterface $rus,
        private readonly TransaccionInterface $transaccion
    ) {}

    /** @return array{duplicado: bool, estado_rus: string, acumulado_rus: float} */
    public function ejecutar(VentaFinalizadaDTO $dto): array
    {
        return $this->transaccion->ejecutar(function () use ($dto): array {
            if ($this->rus->eventoFueProcesado($dto->eventoId)) {
                $periodo = (new DateTimeImmutable($dto->ocurridoEn))->format('Y-m');
                $actual = $this->rus->buscarPorPeriodo($periodo) ?? new AcumuladoRus($periodo);
                return ['duplicado' => true, 'estado_rus' => $actual->obtenerEstado(), 'acumulado_rus' => $actual->obtenerTotal()];
            }
            $turno = $this->turnos->obtenerTurnoAbiertoActual();
            if ($turno === null) { throw new DomainException('No hay turno abierto para registrar la venta.'); }
            $turno->registrarMovimiento(new MovimientoCaja(
                'venta_' . $dto->ventaId,
                new Monto($dto->total),
                TipoMovimiento::VENTA,
                new DateTimeImmutable($dto->ocurridoEn),
                'Ingreso automatico por VentaFinalizada ' . $dto->ventaId
            ));
            $periodo = (new DateTimeImmutable($dto->ocurridoEn))->format('Y-m');
            $acumulado = $this->rus->buscarPorPeriodo($periodo) ?? new AcumuladoRus($periodo);
            $estado = $acumulado->registrarComprobante($dto->total, $dto->tipoComprobante);
            $this->turnos->guardar($turno);
            $this->rus->guardar($acumulado);
            $this->rus->marcarEventoProcesado($dto->eventoId);
            return ['duplicado' => false, 'estado_rus' => $estado, 'acumulado_rus' => $acumulado->obtenerTotal()];
        });
    }
}