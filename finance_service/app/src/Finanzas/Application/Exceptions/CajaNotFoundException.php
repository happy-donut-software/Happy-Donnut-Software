<?php

declare(strict_types=1);

namespace Finanzas\Application\Exceptions;

use Exception;

/**
 * Excepción lanzada cuando se intenta operar sobre una caja que no existe.
 * 
 * Esta excepción se genera en la capa de aplicación cuando los Use Cases
 * intentan buscar una caja en el repositorio y esta no se encuentra.
 * 
 * Casos de uso:
 * - RegistrarIngresoUseCase no encuentra la caja
 * - RegistrarEgresoUseCase no encuentra la caja
 * - CerrarCajaUseCase no encuentra la caja
 * 
 * @package Finanzas\Application\Exceptions
 */
class CajaNotFoundException extends Exception
{
    /**
     * Constructor.
     *
     * @param string $cajaId El ID de la caja que no fue encontrada
     * @param int $code Código de excepción (default: 404)
     * @param Exception|null $previous Excepción anterior si hay encadenamiento
     */
    public function __construct(
        private readonly string $cajaId,
        int $code = 404,
        ?Exception $previous = null
    ) {
        parent::__construct(
            sprintf("La caja con ID '%s' no existe.", $cajaId),
            $code,
            $previous
        );
    }

    /**
     * Obtiene el ID de la caja no encontrada.
     *
     * @return string
     */
    public function getCajaId(): string
    {
        return $this->cajaId;
    }
}
