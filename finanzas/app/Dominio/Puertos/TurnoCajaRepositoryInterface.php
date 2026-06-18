<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Agregados\TurnoCaja;

/**
 * Puerto de salida para persistir y recuperar Turnos de Caja.
 * Esta interfaz protege al dominio de los detalles de la base de datos.
 */
interface TurnoCajaRepositoryInterface
{
    /**
     * Guarda un nuevo turno o actualiza uno existente.
     */
    public function guardar(TurnoCaja $turno): void;

    /**
     * Busca un turno por su ID único.
     * Retorna null si no se encuentra.
     */
    public function buscarPorId(string $id): ?TurnoCaja;

    /**
     * Obtiene el turno de caja que actualmente está abierto.
     * Idealmente debería haber solo un turno abierto a la vez.
     * Retorna null si no hay turnos abiertos.
     */
    public function obtenerTurnoAbiertoActual(): ?TurnoCaja;
}