<?php

declare(strict_types=1);

namespace Finanzas\Application\UseCases;

use Finanzas\Domain\Repositories\CajaRepository;
use Shared\Domain\ValueObjects\Money;
use InvalidArgumentException;

/**
 * CerrarCajaUseCase - Caso de Uso
 * 
 * Orquesta el flujo para cerrar y arquear una caja registradora.
 * 
 * Responsabilidades:
 * 1. Validar entrada
 * 2. Buscar la caja existente
 * 3. Arquear y cerrar el agregado
 * 4. Persistir los cambios
 * 
 * @package Finanzas\Application\UseCases
 */
final class CerrarCajaUseCase
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
     * Ejecutar el caso de uso: cerrar una caja
     *
     * @param string $cajaId ID de la caja a cerrar
     * @param float $montoFinalRealPen Monto físico contado en la caja (en PEN)
     * @return void
     * 
     * @throws InvalidArgumentException Si la caja no existe, ya está cerrada, o parámetros inválidos
     */
    public function execute(string $cajaId, float $montoFinalRealPen): void
    {
        // 1. Validar entrada
        $this->validarCajaId($cajaId);
        $this->validarMontoReal($montoFinalRealPen);

        // 2. Buscar la caja existente
        $caja = $this->repository->search($cajaId);

        if ($caja === null) {
            throw new InvalidArgumentException(
                "La caja con ID '{$cajaId}' no existe"
            );
        }

        // 3. Verificar que la caja está abierta
        if (!$caja->estaAbierta()) {
            throw new InvalidArgumentException(
                "La caja con ID '{$cajaId}' ya está cerrada. " .
                "No se puede cerrar una caja que ya fue cerrada."
            );
        }

        // 4. Crear el Value Object Money para el monto real
        $montoReal = Money::create($montoFinalRealPen);

        // 5. Arquear y cerrar el agregado
        // (El agregado calcula diferencias automáticamente)
        $caja->arquearYCerrar($montoReal);

        // 6. Persistir los cambios en el repositorio
        $this->repository->save($caja);
    }

    /**
     * Validar que el ID de caja sea válido
     *
     * @param string $cajaId
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarCajaId(string $cajaId): void
    {
        if (empty($cajaId)) {
            throw new InvalidArgumentException('El ID de la caja no puede estar vacío');
        }
    }

    /**
     * Validar que el monto real sea válido
     *
     * @param float $monto
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarMontoReal(float $monto): void
    {
        if ($monto < 0) {
            throw new InvalidArgumentException('El monto real no puede ser negativo');
        }

        if ($monto > 100000) {
            throw new InvalidArgumentException('El monto real no puede exceder 100000 PEN');
        }
    }
}
