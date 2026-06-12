<?php

declare(strict_types=1);

namespace Finanzas\Application\DTOs;

/**
 * Data Transfer Object para registrar transacciones (ingresos o egresos).
 * 
 * Este DTO transporta los datos recibidos desde la API o Controller
 * hacia los Use Cases RegistrarIngresoUseCase y RegistrarEgresoUseCase.
 * 
 * El mismo DTO se utiliza para ambos tipos de transacciones, pero
 * se pasa a diferentes use cases basado en la operación HTTP.
 * 
 * Ejemplo de uso en Controller:
 * ```php
 * // Para ingreso
 * $dto = new TransaccionRequest(
 *     cajaId: $request->caja_id,
 *     montoPen: (float) $request->monto,
 *     descripcion: $request->descripcion
 * );
 * $this->registrarIngreso->execute($dto->cajaId, $dto->montoPen, $dto->descripcion);
 * 
 * // Para egreso
 * $this->registrarEgreso->execute($dto->cajaId, $dto->montoPen, $dto->descripcion);
 * ```
 * 
 * @package Finanzas\Application\DTOs
 */
class TransaccionRequest
{
    /**
     * Constructor.
     *
     * @param string $cajaId Identificador único de la caja
     * @param float $montoPen Monto de la transacción en PEN
     * @param string $descripcion Descripción de la transacción
     */
    public function __construct(
        public readonly string $cajaId,
        public readonly float $montoPen,
        public readonly string $descripcion,
    ) {
    }

    /**
     * Factory method para crear desde datos de request JSON.
     *
     * @param string $cajaId El ID de la caja (típicamente de la ruta)
     * @param array $data Array asociativo con keys: monto, descripcion
     * @return self
     */
    public static function fromArray(string $cajaId, array $data): self
    {
        return new self(
            cajaId: $cajaId,
            montoPen: (float) ($data['monto'] ?? 0),
            descripcion: (string) ($data['descripcion'] ?? ''),
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
            'monto' => $this->montoPen,
            'descripcion' => $this->descripcion,
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

        if ($this->montoPen <= 0) {
            $errores['monto'] = 'El monto debe ser mayor a 0';
        }

        if (empty($this->descripcion)) {
            $errores['descripcion'] = 'La descripción es requerida';
        }

        if (strlen($this->descripcion) < 3) {
            $errores['descripcion'] = 'La descripción debe tener al menos 3 caracteres';
        }

        if (strlen($this->descripcion) > 255) {
            $errores['descripcion'] = 'La descripción no puede exceder 255 caracteres';
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
