<?php

declare(strict_types=1);

namespace Finanzas\Application\Exceptions;

use Exception;

/**
 * Excepción lanzada cuando se intenta realizar una operación en una caja cerrada.
 * 
 * Esta excepción se genera cuando los Use Cases intentan registrar ingresos o egresos
 * en una caja que ya ha sido cerrada.
 * 
 * Casos de uso:
 * - RegistrarIngresoUseCase intenta agregar dinero a caja cerrada
 * - RegistrarEgresoUseCase intenta retirar dinero de caja cerrada
 * - CerrarCajaUseCase intenta cerrar una caja que ya está cerrada
 * 
 * @package Finanzas\Application\Exceptions
 */
class CajaCerradaException extends Exception
{
    /**
     * Constructor.
     *
     * @param string $cajaId El ID de la caja cerrada
     * @param string $operacion La operación que se intentó
     * @param int $code Código de excepción (default: 422)
     * @param Exception|null $previous Excepción anterior si hay encadenamiento
     */
    public function __construct(
        private readonly string $cajaId,
        private readonly string $operacion = 'operación',
        int $code = 422,
        ?Exception $previous = null
    ) {
        parent::__construct(
            sprintf(
                "No se puede realizar '%s' en la caja '%s' porque está cerrada.",
                $operacion,
                $cajaId
            ),
            $code,
            $previous
        );
    }

    /**
     * Obtiene el ID de la caja cerrada.
     *
     * @return string
     */
    public function getCajaId(): string
    {
        return $this->cajaId;
    }

    /**
     * Obtiene la operación que se intentó.
     *
     * @return string
     */
    public function getOperacion(): string
    {
        return $this->operacion;
    }
}
