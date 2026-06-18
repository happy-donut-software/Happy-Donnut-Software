<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\CerrarTurnoDTO;
use App\Dominio\Agregados\TurnoCaja;
use App\Dominio\ObjetosValor\Monto;
use App\Dominio\Puertos\TurnoCajaRepositoryInterface;
use DateTimeImmutable;
use DomainException;

/**
 * Caso de Uso: Cierra el turno de caja actual y realiza el arqueo de forma automática.
 */
class CerrarTurnoUseCase
{
    public function __construct(
        private readonly TurnoCajaRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(CerrarTurnoDTO $dto): TurnoCaja
    {
        // 1. Buscar la caja abierta
        $turnoActual = $this->repositorio->obtenerTurnoAbiertoActual();
        
        if ($turnoActual === null) {
            throw new DomainException("No hay ningún turno de caja abierto para cerrar.");
        }

        // 2. Convertir el dinero físico reportado a un Objeto de Valor
        $dineroFisico = new Monto($dto->dineroFisicoReal);
        
        // 3. Delegar la lógica compleja del Arqueo al Agregado
        // Él se encargará de calcular sobrantes/faltantes
        $turnoActual->cerrarTurno($dineroFisico, new DateTimeImmutable());

        // 4. Persistir la caja ya cerrada (y sus movimientos de ajuste si los hubo)
        $this->repositorio->guardar($turnoActual);

        // Retornamos el turno para que el controlador pueda mostrar el resumen del arqueo
        return $turnoActual;
    }
}