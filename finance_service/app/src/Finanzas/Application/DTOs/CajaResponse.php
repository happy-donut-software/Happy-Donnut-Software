<?php

declare(strict_types=1);

namespace Finanzas\Application\DTOs;

use Finanzas\Domain\Aggregates\Caja;
use DateTime;

/**
 * Data Transfer Object para la respuesta de caja.
 * 
 * Este DTO transforma el agregado Caja (del dominio) en una estructura
 * lista para enviar como respuesta JSON a través de la API.
 * 
 * Responsabilidades:
 * - Serializar el agregado Caja a un formato estable
 * - Convertir objetos de valor (Money) a tipos primitivos
 * - Ocultar detalles internos del dominio que no deben ser públicos
 * - Proporcionar métodos para convertir a JSON
 * 
 * Ejemplo de uso en Controller:
 * ```php
 * $caja = $this->abrirCaja->execute($vendedor_id, $monto);
 * $response = CajaResponse::fromAggregate($caja);
 * return response()->json($response->toArray(), 201);
 * ```
 * 
 * @package Finanzas\Application\DTOs
 */
class CajaResponse
{
    /**
     * Constructor.
     *
     * @param string $id Identificador único
     * @param string $vendedorId ID del vendedor
     * @param float $montoApertura Monto de apertura en PEN
     * @param float $montoActual Monto actual en PEN
     * @param string $estado Estado (abierta/cerrada)
     * @param DateTime $fechaApertura Fecha/hora de apertura
     * @param DateTime|null $fechaCierre Fecha/hora de cierre
     * @param float|null $diferencia Diferencia en cierre
     * @param int $totalTransacciones Total de transacciones
     */
    public function __construct(
        public readonly string $id,
        public readonly string $vendedorId,
        public readonly float $montoApertura,
        public readonly float $montoActual,
        public readonly string $estado,
        public readonly DateTime $fechaApertura,
        public readonly ?DateTime $fechaCierre,
        public readonly ?float $diferencia,
        public readonly int $totalTransacciones,
    ) {
    }

    /**
     * Factory method para crear desde un agregado Caja.
     *
     * @param Caja $caja El agregado del dominio
     * @return self
     */
    public static function fromAggregate(Caja $caja): self
    {
        return new self(
            id: $caja->getId(),
            vendedorId: $caja->getVendedorId(),
            montoApertura: $caja->getMontoApertura()->getAmountAsFloat(),
            montoActual: $caja->getMontoActual()->getAmountAsFloat(),
            estado: $caja->getEstado(),
            fechaApertura: $caja->getFechaApertura(),
            fechaCierre: $caja->getFechaCierre(),
            diferencia: $caja->getDiferencia()?->getAmountAsFloat(),
            totalTransacciones: $caja->getTotalTransacciones(),
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
            'id' => $this->id,
            'vendedor_id' => $this->vendedorId,
            'monto_apertura' => $this->montoApertura,
            'monto_actual' => $this->montoActual,
            'estado' => $this->estado,
            'fecha_apertura' => $this->fechaApertura->toIso8601String(),
            'fecha_cierre' => $this->fechaCierre?->toIso8601String(),
            'diferencia' => $this->diferencia,
            'total_transacciones' => $this->totalTransacciones,
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
     * Obtiene un resumen de la caja para respuestas rápidas.
     *
     * @return array
     */
    public function getResumen(): array
    {
        return [
            'id' => $this->id,
            'vendedor_id' => $this->vendedorId,
            'monto_actual' => $this->montoActual,
            'estado' => $this->estado,
        ];
    }
}
