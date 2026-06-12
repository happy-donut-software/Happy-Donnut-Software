<?php

declare(strict_types=1);

namespace Finanzas\Application\Exceptions;

use Exception;

/**
 * Excepción lanzada cuando hay un error al registrar una transacción.
 * 
 * Esta excepción es generada por el agregado Caja cuando existen problemas
 * con los parámetros de una transacción (monto negativo, etc.).
 * 
 * Casos de uso:
 * - Intentar registrar un ingreso con monto <= 0
 * - Intentar registrar un egreso con monto <= 0
 * - Intentar registrar transacción sin descripción
 * - Intentar registrar transacción con monto que excede límites
 * 
 * @package Finanzas\Application\Exceptions
 */
class TransaccionInvalidaException extends Exception
{
    /**
     * Constructor.
     *
     * @param string $razon La razón del error
     * @param string|null $cajaId El ID de la caja (opcional)
     * @param int $code Código de excepción (default: 422)
     * @param Exception|null $previous Excepción anterior si hay encadenamiento
     */
    public function __construct(
        private readonly string $razon,
        private readonly ?string $cajaId = null,
        int $code = 422,
        ?Exception $previous = null
    ) {
        $mensaje = "Transacción inválida: {$razon}";
        if ($cajaId) {
            $mensaje .= " (Caja: {$cajaId})";
        }

        parent::__construct($mensaje, $code, $previous);
    }

    /**
     * Obtiene la razón del error.
     *
     * @return string
     */
    public function getRazon(): string
    {
        return $this->razon;
    }

    /**
     * Obtiene el ID de la caja afectada.
     *
     * @return string|null
     */
    public function getCajaId(): ?string
    {
        return $this->cajaId;
    }
}
