<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\RegistrarMovimientoDTO;
use App\Dominio\Entidades\MovimientoCaja;
use App\Dominio\ObjetosValor\Monto;
use App\Dominio\ObjetosValor\TipoMovimiento;
use App\Dominio\Puertos\TurnoCajaRepositoryInterface;
use DateTimeImmutable;
use DomainException;
use ValueError;

/**
 * Caso de Uso: Registra un ingreso o salida en el turno de caja activo.
 */
class RegistrarMovimientoUseCase
{
    public function __construct(
        private readonly TurnoCajaRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(RegistrarMovimientoDTO $dto): void
    {
        // 1. Recuperar el turno activo
        $turnoActual = $this->repositorio->obtenerTurnoAbiertoActual();
        
        if ($turnoActual === null) {
            throw new DomainException("No hay un turno de caja abierto para registrar movimientos.");
        }

        // 2. Convertir y validar datos
        $monto = new Monto($dto->monto);
        
        try {
            $tipo = TipoMovimiento::from($dto->tipoMovimiento);
        } catch (ValueError $e) {
            throw new DomainException("El tipo de movimiento proporcionado no es válido.");
        }

        $movimientoId = uniqid('mov_'); // Podría ser un UUID
        
        // 3. Crear la entidad Movimiento
        $movimiento = new MovimientoCaja(
            $movimientoId,
            $monto,
            $tipo,
            new DateTimeImmutable(),
            $dto->descripcion
        );

        // 4. Agregar el movimiento al Agregado (Él validará internamente si la caja está cerrada)
        $turnoActual->registrarMovimiento($movimiento);

        // 5. Persistir el estado actualizado del Turno
        $this->repositorio->guardar($turnoActual);
    }
}