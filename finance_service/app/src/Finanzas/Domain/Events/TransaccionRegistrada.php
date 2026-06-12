<?php

declare(strict_types=1);

namespace Finanzas\Domain\Events;

use Finanzas\Domain\ValueObjects\TransactionType;
use Shared\Domain\ValueObjects\Money;

/**
 * TransaccionRegistrada - Domain Event
 * 
 * Ocurre cuando se registra una transacción (ingreso o egreso) en la caja.
 * 
 * @package Finanzas\Domain\Events
 */
final class TransaccionRegistrada
{
    /**
     * Constructor
     *
     * @param string $cajaId Identificador de la caja
     * @param TransactionType $tipo Tipo de transacción
     * @param Money $monto Monto de la transacción
     * @param string $descripcion Descripción de la transacción
     * @param Money $montoActual Monto actual de la caja después de la transacción
     * @param \DateTime $fechaTransaccion Cuándo ocurrió
     */
    public function __construct(
        private readonly string $cajaId,
        private readonly TransactionType $tipo,
        private readonly Money $monto,
        private readonly string $descripcion,
        private readonly Money $montoActual,
        private readonly \DateTime $fechaTransaccion
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
     * Obtener tipo de transacción
     *
     * @return TransactionType
     */
    public function getTipo(): TransactionType
    {
        return $this->tipo;
    }

    /**
     * Obtener monto de la transacción
     *
     * @return Money
     */
    public function getMonto(): Money
    {
        return $this->monto;
    }

    /**
     * Obtener descripción
     *
     * @return string
     */
    public function getDescripcion(): string
    {
        return $this->descripcion;
    }

    /**
     * Obtener monto actual de la caja después de la transacción
     *
     * @return Money
     */
    public function getMontoActual(): Money
    {
        return $this->montoActual;
    }

    /**
     * Obtener fecha de la transacción
     *
     * @return \DateTime
     */
    public function getFechaTransaccion(): \DateTime
    {
        return $this->fechaTransaccion;
    }

    /**
     * Verificar si es un ingreso
     *
     * @return bool
     */
    public function esIngreso(): bool
    {
        return $this->tipo->esIngreso();
    }

    /**
     * Verificar si es un egreso
     *
     * @return bool
     */
    public function esEgreso(): bool
    {
        return $this->tipo->esEgreso();
    }

    /**
     * Obtener array con datos del evento
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'evento' => 'TransaccionRegistrada',
            'caja_id' => $this->cajaId,
            'tipo_transaccion' => $this->tipo->value(),
            'tipo_nombre' => $this->tipo->nombre(),
            'monto' => $this->monto->toString(),
            'descripcion' => $this->descripcion,
            'monto_actual_caja' => $this->montoActual->toString(),
            'fecha_transaccion' => $this->fechaTransaccion->format('Y-m-d H:i:s'),
            'es_ingreso' => $this->esIngreso(),
            'es_egreso' => $this->esEgreso(),
        ];
    }
}
