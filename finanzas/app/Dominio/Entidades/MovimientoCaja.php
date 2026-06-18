<?php

declare(strict_types=1);

namespace App\Dominio\Entidades;

use App\Dominio\ObjetosValor\Monto;
use App\Dominio\ObjetosValor\TipoMovimiento;
use DateTimeImmutable;

/**
 * Entidad Local que representa una transacción individual dentro de un Turno de Caja.
 * Tiene identidad propia ($id), pero su existencia depende del TurnoCaja (Aggregate Root).
 */
class MovimientoCaja
{
    public function __construct(
        private readonly string $id,
        private readonly Monto $monto,
        private readonly TipoMovimiento $tipo,
        private readonly DateTimeImmutable $fechaHora,
        private readonly ?string $descripcion = null
    ) {
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerMonto(): Monto
    {
        return $this->monto;
    }

    public function obtenerTipo(): TipoMovimiento
    {
        return $this->tipo;
    }

    public function obtenerFechaHora(): DateTimeImmutable
    {
        return $this->fechaHora;
    }

    public function obtenerDescripcion(): ?string
    {
        return $this->descripcion;
    }

    /**
     * Comodidad de negocio: Le preguntamos a la entidad si suma dinero.
     * Ella internamente delega la respuesta a su Objeto de Valor (TipoMovimiento).
     */
    public function esEntrada(): bool
    {
        return $this->tipo->esEntrada();
    }

    /**
     * Comodidad de negocio: Le preguntamos a la entidad si resta dinero.
     */
    public function esSalida(): bool
    {
        return $this->tipo->esSalida();
    }
}