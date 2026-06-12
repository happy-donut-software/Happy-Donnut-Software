<?php

declare(strict_types=1);

namespace Finanzas\Application\DTOs;

/**
 * Data Transfer Object para cerrar caja.
 * 
 * Este DTO transporta los datos recibidos desde la API o Controller
 * hacia el Use Case CerrarCajaUseCase.
 * 
 * En el cierre de caja, se requiere el monto final real que el vendedor
 * contó físicamente, para poder compararlo con el teórico y detectar
 * faltantes o sobrantes.
 * 
 * Ejemplo de uso en Controller:
 * ```php
 * $dto = new CajaCierreRequest(
 *     cajaId: $request->caja_id,
 *     montoFinalRealPen: (float) $request->monto_real
 * );
 * 
 * $this->cerrarCaja->execute($dto->cajaId, $dto->montoFinalRealPen);
 * ```
 * 
 * @package Finanzas\Application\DTOs
 */
class CajaCierreRequest
{
    /**
     * Constructor.
     *
     * @param string $cajaId Identificador único de la caja
     * @param float $montoFinalRealPen Monto final contado físicamente en PEN
     */
    public function __construct(
        public readonly string $cajaId,
        public readonly float $montoFinalRealPen,
    ) {
    }

    /**
     * Factory method para crear desde datos de request JSON.
     *
     * @param string $cajaId El ID de la caja (típicamente de la ruta)
     * @param array $data Array asociativo con key: monto_real
     * @return self
     */
    public static function fromArray(string $cajaId, array $data): self
    {
        return new self(
            cajaId: $cajaId,
            montoFinalRealPen: (float) ($data['monto_real'] ?? 0),
        );
    }

    /**
     * Convierte el DTO a array.
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'caja_id' => $this->cajaId,
            'monto_real' => $this->montoFinalRealPen,
        ];
    }

    /**
     * Valida que el DTO contenga datos válidos.
     *
     * @return array Array de errores si los hay, vacío si es válido
     */
    public function validar(): array
    {
        $errores = [];

        if (empty($this->cajaId)) {
            $errores['caja_id'] = 'El ID de la caja es requerido';
        }

        if ($this->montoFinalRealPen < 0) {
            $errores['monto_real'] = 'El monto real no puede ser negativo';
        }

        return $errores;
    }

    /**
     * Verifica si el DTO es válido.
     *
     * @return bool
     */
    public function esValido(): bool
    {
        return empty($this->validar());
    }
}
