<?php

declare(strict_types=1);

namespace Finanzas\Application\DTOs;

use Finanzas\Domain\Events\CajaCerrada;
use DateTime;

/**
 * Data Transfer Object para la respuesta del cierre de caja.
 * 
 * Este DTO transforma el evento CajaCerrada (del dominio) en una estructura
 * lista para enviar como respuesta JSON con el resumen del reconcilio.
 * 
 * Contiene:
 * - Monto teórico (calculado por el sistema)
 * - Monto real (contado físicamente)
 * - Diferencia (faltante o sobrante)
 * - Análisis (si cuadra, hay faltante, hay sobrante)
 * 
 * Ejemplo de uso en Controller:
 * ```php
 * // Después de cerrar
 * $evento = $caja->getUltimoCajaCerradaEvent();
 * $response = CajaCierreResponse::fromEvent($evento);
 * return response()->json($response->toArray(), 200);
 * ```
 * 
 * @package Finanzas\Application\DTOs
 */
class CajaCierreResponse
{
    /**
     * Constructor.
     *
     * @param string $cajaId ID de la caja
     * @param string $vendedorId ID del vendedor
     * @param float $montoTeórico Monto calculado por el sistema
     * @param float $montoReal Monto contado físicamente
     * @param float $diferencia Diferencia (positivo=sobrante, negativo=faltante)
     * @param bool $cuadraPerfectamente Si los montos coinciden exactamente
     * @param bool $hayFaltante Si hay dinero faltante
     * @param bool $haySobrante Si hay dinero sobrante
     * @param DateTime $fecha Fecha/hora del cierre
     */
    public function __construct(
        public readonly string $cajaId,
        public readonly string $vendedorId,
        public readonly float $montoTeórico,
        public readonly float $montoReal,
        public readonly float $diferencia,
        public readonly bool $cuadraPerfectamente,
        public readonly bool $hayFaltante,
        public readonly bool $haySobrante,
        public readonly DateTime $fecha,
    ) {
    }

    /**
     * Factory method para crear desde un evento de dominio.
     *
     * @param CajaCerrada $evento El evento del dominio
     * @return self
     */
    public static function fromEvent(CajaCerrada $evento): self
    {
        return new self(
            cajaId: $evento->getCajaId(),
            vendedorId: $evento->getVendedorId(),
            montoTeórico: $evento->getMontoTeórico()->getAmountAsFloat(),
            montoReal: $evento->getMontoReal()->getAmountAsFloat(),
            diferencia: $evento->getDiferencia()->getAmountAsFloat(),
            cuadraPerfectamente: $evento->cuadraPerfectamente(),
            hayFaltante: $evento->hayFaltante(),
            haySobrante: $evento->haySobrante(),
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
            'vendedor_id' => $this->vendedorId,
            'monto_teórico' => $this->montoTeórico,
            'monto_real' => $this->montoReal,
            'diferencia' => $this->diferencia,
            'cuadra_perfectamente' => $this->cuadraPerfectamente,
            'hay_faltante' => $this->hayFaltante,
            'hay_sobrante' => $this->haySobrante,
            'resumen' => $this->getResumen(),
            'fecha_cierre' => $this->fecha->toIso8601String(),
        ];
    }

    /**
     * Obtiene un resumen legible del cierre.
     *
     * @return array
     */
    public function getResumen(): array
    {
        if ($this->cuadraPerfectamente) {
            return [
                'estado' => 'CUADRA_PERFECTO',
                'mensaje' => '✅ La caja cuadra perfectamente',
                'diferencia_abs' => 0.0,
            ];
        }

        if ($this->haySobrante) {
            return [
                'estado' => 'SOBRANTE',
                'mensaje' => sprintf('✅ Hay sobrante de %.2f PEN', $this->diferencia),
                'diferencia_abs' => $this->diferencia,
            ];
        }

        if ($this->hayFaltante) {
            return [
                'estado' => 'FALTANTE',
                'mensaje' => sprintf('⚠️ Hay faltante de %.2f PEN', abs($this->diferencia)),
                'diferencia_abs' => abs($this->diferencia),
            ];
        }

        return [
            'estado' => 'ERROR',
            'mensaje' => '❌ Estado desconocido',
            'diferencia_abs' => abs($this->diferencia),
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
     * Obtiene un mensaje amigable para el usuario.
     *
     * @return string
     */
    public function getMensajeAmigable(): string
    {
        $base = "Cierre de caja para {$this->vendedorId}\n";
        $base .= "Monto teórico: {$this->montoTeórico} PEN\n";
        $base .= "Monto real: {$this->montoReal} PEN\n";

        if ($this->cuadraPerfectamente) {
            $base .= "✅ ¡LA CAJA CUADRA PERFECTAMENTE!";
        } elseif ($this->haySobrante) {
            $base .= "✅ Hay sobrante de " . abs($this->diferencia) . " PEN";
        } else {
            $base .= "⚠️ Hay faltante de " . abs($this->diferencia) . " PEN";
        }

        return $base;
    }
}
