<?php

declare(strict_types=1);

namespace Finanzas\Application\DTOs;

use Finanzas\Domain\Events\TransaccionRegistrada;
use DateTime;

/**
 * Data Transfer Object para la respuesta de una transacción.
 * 
 * Este DTO transforma el evento de dominio TransaccionRegistrada en una
 * estructura lista para enviar como respuesta JSON a través de la API.
 * 
 * Se utiliza cuando:
 * - Se retorna una transacción individual después de registrarla
 * - Se lista histórico de transacciones de una caja
 * - Se calcula reportes con detalles de transacciones
 * 
 * Ejemplo de uso en Controller:
 * ```php
 * $eventos = $caja->getEventosDominio();
 * $transacciones = array_map(
 *     fn(TransaccionRegistrada $evento) => 
 *         TransaccionResponse::fromEvent($evento)->toArray(),
 *     array_filter(
 *         $eventos,
 *         fn($e) => $e instanceof TransaccionRegistrada
 *     )
 * );
 * ```
 * 
 * @package Finanzas\Application\DTOs
 */
class TransaccionResponse
{
    /**
     * Constructor.
     *
     * @param string $cajaId ID de la caja
     * @param string $tipo Tipo de transacción (INGRESO_VENTA, EGRESO_OPERATIVO, CIERRE_CAJA)
     * @param float $monto Monto de la transacción
     * @param string $descripcion Descripción de la transacción
     * @param float $montoActualPost Monto en caja después de esta transacción
     * @param DateTime $fecha Fecha/hora de la transacción
     */
    public function __construct(
        public readonly string $cajaId,
        public readonly string $tipo,
        public readonly float $monto,
        public readonly string $descripcion,
        public readonly float $montoActualPost,
        public readonly DateTime $fecha,
    ) {
    }

    /**
     * Factory method para crear desde un evento de dominio.
     *
     * @param TransaccionRegistrada $evento El evento del dominio
     * @return self
     */
    public static function fromEvent(TransaccionRegistrada $evento): self
    {
        return new self(
            cajaId: $evento->getCajaId(),
            tipo: $evento->getTipo()->value(),
            monto: $evento->getMonto()->getAmountAsFloat(),
            descripcion: $evento->getDescripcion(),
            montoActualPost: $evento->getMontoActual()->getAmountAsFloat(),
            fecha: $evento->getFecha(),
        );
    }

    /**
     * Convierte el DTO a array para serialización.
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'caja_id' => $this->cajaId,
            'tipo' => $this->tipo,
            'monto' => $this->monto,
            'descripcion' => $this->descripcion,
            'monto_actual_post' => $this->montoActualPost,
            'fecha' => $this->fecha->toIso8601String(),
        ];
    }

    /**
     * Convierte a JSON string.
     *
     * @return string
     */
    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Determina si esta transacción es un ingreso.
     *
     * @return bool
     */
    public function esIngreso(): bool
    {
        return str_starts_with($this->tipo, 'INGRESO');
    }

    /**
     * Determina si esta transacción es un egreso.
     *
     * @return bool
     */
    public function esEgreso(): bool
    {
        return str_starts_with($this->tipo, 'EGRESO');
    }
}
