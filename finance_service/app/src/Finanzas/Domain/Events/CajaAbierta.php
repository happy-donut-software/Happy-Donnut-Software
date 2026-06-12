<?php

declare(strict_types=1);

namespace Finanzas\Domain\Events;

use Shared\Domain\ValueObjects\Money;

/**
 * CajaAbierta - Domain Event
 * 
 * Ocurre cuando un vendedor abre una nueva caja.
 * 
 * @package Finanzas\Domain\Events
 */
final class CajaAbierta
{
    /**
     * Constructor
     *
     * @param string $cajaId Identificador de la caja
     * @param string $vendedorId Identificador del vendedor
     * @param Money $montoApertura Monto inicial de la caja
     * @param \DateTime $fechaApertura Cuándo se abrió la caja
     */
    public function __construct(
        private readonly string $cajaId,
        private readonly string $vendedorId,
        private readonly Money $montoApertura,
        private readonly \DateTime $fechaApertura
    ) {}

    /**
     * Obtener ID de la caja
     *
     * @return string
     */
    public function getCajaId(): string
    {
        return $this->cajaId;
    }

    /**
     * Obtener ID del vendedor
     *
     * @return string
     */
    public function getVendedorId(): string
    {
        return $this->vendedorId;
    }

    /**
     * Obtener monto de apertura
     *
     * @return Money
     */
    public function getMontoApertura(): Money
    {
        return $this->montoApertura;
    }

    /**
     * Obtener fecha de apertura
     *
     * @return \DateTime
     */
    public function getFechaApertura(): \DateTime
    {
        return $this->fechaApertura;
    }

    /**
     * Obtener array con datos del evento
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'evento' => 'CajaAbierta',
            'caja_id' => $this->cajaId,
            'vendedor_id' => $this->vendedorId,
            'monto_apertura' => $this->montoApertura->toString(),
            'fecha_apertura' => $this->fechaApertura->format('Y-m-d H:i:s'),
            'ocurrido_en' => $this->fechaApertura->format('Y-m-d H:i:s'),
        ];
    }
}
