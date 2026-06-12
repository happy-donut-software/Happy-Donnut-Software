<?php

declare(strict_types=1);

namespace Finanzas\Domain\Events;

use Shared\Domain\ValueObjects\Money;

/**
 * CajaCerrada - Domain Event
 * 
 * Ocurre cuando se arquea y cierra una caja.
 * Captura el monto teórico, el monto real y la diferencia (faltante/sobrante).
 * 
 * @package Finanzas\Domain\Events
 */
final class CajaCerrada
{
    /**
     * Constructor
     *
     * @param string $cajaId Identificador de la caja
     * @param string $vendedorId Identificador del vendedor
     * @param Money $montoTeoricoFinal Monto teórico calculado
     * @param Money $montoRealFinal Monto real contado
     * @param Money $diferencia Diferencia: real - teórico
     * @param \DateTime $fechaCierre Cuándo se cerró
     * @param int $totalTransacciones Total de transacciones en la sesión
     */
    public function __construct(
        private readonly string $cajaId,
        private readonly string $vendedorId,
        private readonly Money $montoTeoricoFinal,
        private readonly Money $montoRealFinal,
        private readonly Money $diferencia,
        private readonly \DateTime $fechaCierre,
        private readonly int $totalTransacciones
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
     * Obtener monto teórico final
     *
     * @return Money
     */
    public function getMontoTeoricoFinal(): Money
    {
        return $this->montoTeoricoFinal;
    }

    /**
     * Obtener monto real final
     *
     * @return Money
     */
    public function getMontoRealFinal(): Money
    {
        return $this->montoRealFinal;
    }

    /**
     * Obtener diferencia
     *
     * @return Money
     */
    public function getDiferencia(): Money
    {
        return $this->diferencia;
    }

    /**
     * Obtener fecha de cierre
     *
     * @return \DateTime
     */
    public function getFechaCierre(): \DateTime
    {
        return $this->fechaCierre;
    }

    /**
     * Obtener total de transacciones
     *
     * @return int
     */
    public function getTotalTransacciones(): int
    {
        return $this->totalTransacciones;
    }

    /**
     * Verificar si hay faltante
     *
     * @return bool
     */
    public function hayFaltante(): bool
    {
        return $this->diferencia->isNegative();
    }

    /**
     * Verificar si hay sobrante
     *
     * @return bool
     */
    public function haySobrante(): bool
    {
        return $this->diferencia->isPositive();
    }

    /**
     * Verificar si cuadra perfectamente
     *
     * @return bool
     */
    public function cuadraPerfectamente(): bool
    {
        return $this->diferencia->isZero();
    }

    /**
     * Obtener array con datos del evento
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'evento' => 'CajaCerrada',
            'caja_id' => $this->cajaId,
            'vendedor_id' => $this->vendedorId,
            'monto_teoricoFinal' => $this->montoTeoricoFinal->toString(),
            'monto_real_final' => $this->montoRealFinal->toString(),
            'diferencia' => $this->diferencia->toString(),
            'hay_faltante' => $this->hayFaltante(),
            'hay_sobrante' => $this->haySobrante(),
            'cuadra_perfectamente' => $this->cuadraPerfectamente(),
            'total_transacciones' => $this->totalTransacciones,
            'fecha_cierre' => $this->fechaCierre->format('Y-m-d H:i:s'),
            'ocurrido_en' => $this->fechaCierre->format('Y-m-d H:i:s'),
        ];
    }
}
