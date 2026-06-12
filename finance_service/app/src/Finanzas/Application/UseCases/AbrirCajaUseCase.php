<?php

declare(strict_types=1);

namespace Finanzas\Application\UseCases;

use Finanzas\Domain\Aggregates\Caja;
use Finanzas\Domain\Repositories\CajaRepository;
use Shared\Domain\ValueObjects\Money;
use Ramsey\Uuid\Uuid;
use InvalidArgumentException;

/**
 * AbrirCajaUseCase - Caso de Uso
 * 
 * Orquesta el flujo para abrir una nueva caja registradora.
 * 
 * Responsabilidades:
 * 1. Validar entrada
 * 2. Crear el agregado Caja
 * 3. Persistir usando el repositorio
 * 4. Retornar la caja creada
 * 
 * @package Finanzas\Application\UseCases
 */
final class AbrirCajaUseCase
{
    /**
     * Constructor con inyección de dependencias
     *
     * @param CajaRepository $repository Interfaz del repositorio
     */
    public function __construct(
        private readonly CajaRepository $repository
    ) {}

    /**
     * Ejecutar el caso de uso: abrir una nueva caja
     *
     * @param string $vendedorId ID del vendedor que abre la caja
     * @param float $montoAperturaPen Monto inicial de la caja en PEN
     * @return Caja Agregado Caja recién creado
     * 
     * @throws InvalidArgumentException Si los parámetros son inválidos
     */
    public function execute(string $vendedorId, float $montoAperturaPen): Caja
    {
        // 1. Validar entrada
        $this->validarVendedorId($vendedorId);
        $this->validarMonto($montoAperturaPen);

        // 2. Generar ID único para la caja
        $cajaId = Uuid::uuid4()->toString();

        // 3. Crear el Value Object Money
        $montoApertura = Money::create($montoAperturaPen);

        // 4. Instanciar el agregado Caja (llamar factory)
        $caja = Caja::abrir(
            id: $cajaId,
            vendedor_id: $vendedorId,
            monto_apertura: $montoApertura
        );

        // 5. Persistir usando el repositorio
        $this->repository->save($caja);

        // 6. Retornar la caja creada
        return $caja;
    }

    /**
     * Validar que el vendedor ID sea válido
     *
     * @param string $vendedorId
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarVendedorId(string $vendedorId): void
    {
        if (empty($vendedorId)) {
            throw new InvalidArgumentException('El ID del vendedor no puede estar vacío');
        }

        if (strlen($vendedorId) < 3) {
            throw new InvalidArgumentException('El ID del vendedor debe tener al menos 3 caracteres');
        }
    }

    /**
     * Validar que el monto sea válido
     *
     * @param float $monto
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarMonto(float $monto): void
    {
        if ($monto < 0) {
            throw new InvalidArgumentException('El monto de apertura no puede ser negativo');
        }

        if ($monto > 100000) {
            throw new InvalidArgumentException('El monto de apertura no puede exceder 100000 PEN');
        }
    }
}
