<?php

declare(strict_types=1);

namespace Finanzas\Application\UseCases;

use Finanzas\Domain\Repositories\CajaRepository;
use Shared\Domain\ValueObjects\Money;
use InvalidArgumentException;

/**
 * RegistrarEgresoUseCase - Caso de Uso
 * 
 * Orquesta el flujo para registrar un egreso (gasto operativo) en una caja.
 * 
 * Responsabilidades:
 * 1. Validar entrada
 * 2. Buscar la caja existente
 * 3. Registrar el egreso en el agregado
 * 4. Persistir los cambios
 * 
 * @package Finanzas\Application\UseCases
 */
final class RegistrarEgresoUseCase
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
     * Ejecutar el caso de uso: registrar un egreso
     *
     * @param string $cajaId ID de la caja donde registrar el egreso
     * @param float $montoPen Monto del egreso en PEN
     * @param string $descripcion Descripción del egreso (ej: "Cambio al cliente")
     * @return void
     * 
     * @throws InvalidArgumentException Si la caja no existe o parámetros son inválidos
     */
    public function execute(string $cajaId, float $montoPen, string $descripcion): void
    {
        // 1. Validar entrada
        $this->validarCajaId($cajaId);
        $this->validarMonto($montoPen);
        $this->validarDescripcion($descripcion);

        // 2. Buscar la caja existente
        $caja = $this->repository->search($cajaId);

        if ($caja === null) {
            throw new InvalidArgumentException(
                "La caja con ID '{$cajaId}' no existe"
            );
        }

        // 3. Crear el Value Object Money
        $monto = Money::create($montoPen);

        // 4. Registrar el egreso en el agregado
        // (El agregado valida automáticamente que esté abierta)
        // Nota: registrarEgreso() internamente convierte a negativo
        $caja->registrarEgreso($monto, $descripcion);

        // 5. Persistir los cambios en el repositorio
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
     * Validar que el monto sea válido
     *
     * @param float $monto
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarMonto(float $monto): void
    {
        if ($monto <= 0) {
            throw new InvalidArgumentException('El monto del egreso debe ser mayor a 0');
        }

        if ($monto > 100000) {
            throw new InvalidArgumentException('El monto del egreso no puede exceder 100000 PEN');
        }
    }

    /**
     * Validar que la descripción sea válida
     *
     * @param string $descripcion
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarDescripcion(string $descripcion): void
    {
        if (empty($descripcion)) {
            throw new InvalidArgumentException('La descripción no puede estar vacía');
        }

        if (strlen($descripcion) > 500) {
            throw new InvalidArgumentException('La descripción no puede exceder 500 caracteres');
        }
    }
}
