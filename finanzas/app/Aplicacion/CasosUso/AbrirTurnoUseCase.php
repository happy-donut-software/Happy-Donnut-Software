<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\AbrirTurnoDTO;
use App\Dominio\Agregados\TurnoCaja;
use App\Dominio\ObjetosValor\Monto;
use App\Dominio\Puertos\TurnoCajaRepositoryInterface;
use DateTimeImmutable;
use DomainException;

/**
 * Caso de Uso: Apertura de un nuevo turno de caja.
 */
class AbrirTurnoUseCase
{
    // Inyectamos el contrato, NO la implementación de base de datos.
    public function __construct(
        private readonly TurnoCajaRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(AbrirTurnoDTO $dto): TurnoCaja
    {
        // 1. Validar que no exista ya un turno abierto en la tienda
        $turnoActual = $this->repositorio->obtenerTurnoAbiertoActual();
        
        if ($turnoActual !== null) {
            throw new DomainException("No se puede abrir la caja porque ya existe un turno abierto.");
        }

        // 2. Convertimos los datos crudos a Objetos de Valor protegidos
        $montoApertura = new Monto($dto->montoApertura);
        
        // Generamos un ID único (en la vida real podríamos usar UUIDs)
        $nuevoTurnoId = uniqid('turno_');

        // 3. Instanciamos la Raíz del Agregado
        $nuevoTurno = new TurnoCaja(
            $nuevoTurnoId,
            $dto->cajeroId,
            $montoApertura,
            new DateTimeImmutable() // Fecha y hora exacta actual
        );

        // 4. Persistimos a través del Puerto
        $this->repositorio->guardar($nuevoTurno);

        // Retornamos el turno para que el controlador lo pueda mostrar en la respuesta JSON
        return $nuevoTurno;
    }
}   