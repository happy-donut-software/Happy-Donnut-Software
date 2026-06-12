<?php

declare(strict_types=1);

namespace Finanzas\Application\DTOs;

/**
 * Data Transfer Object para la apertura de caja.
 * 
 * Este DTO transporta los datos recibidos desde la API o Controller
 * hacia el Use Case AbrirCajaUseCase.
 * 
 * Es responsabilidad del Controller validar estos datos antes de 
 * crear esta instancia.
 * 
 * Ejemplo de uso en Controller:
 * ```php
 * $dto = new CajaAperturaRequest(
 *     vendedorId: $request->vendedor_id,
 *     montoAperturaPen: (float) $request->monto
 * );
 * 
 * $caja = $this->abrirCaja->execute(
 *     $dto->vendedorId,
 *     $dto->montoAperturaPen
 * );
 * ```
 * 
 * @package Finanzas\Application\DTOs
 */
class CajaAperturaRequest
{
    /**
     * Constructor.
     *
     * @param string $vendedorId Identificador único del vendedor
     * @param float $montoAperturaPen Monto de apertura en PEN
     */
    public function __construct(
        public readonly string $vendedorId,
        public readonly float $montoAperturaPen,
    ) {
    }

    /**
     * Factory method para crear desde datos de request JSON.
     *
     * @param array $data Array asociativo con keys: vendedor_id, monto
     * @return self
     */
    public static function fromArray(array $data): self
    {
        return new self(
            vendedorId: (string) $data['vendedor_id'] ?? '',
            montoAperturaPen: (float) ($data['monto'] ?? 0),
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
            'vendedor_id' => $this->vendedorId,
            'monto_apertura' => $this->montoAperturaPen,
        ];
    }
}
