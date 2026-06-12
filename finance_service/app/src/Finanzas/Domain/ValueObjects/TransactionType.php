<?php

declare(strict_types=1);

namespace Finanzas\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * TransactionType - Enum de tipos de transacciones
 * 
 * Define los tipos posibles de transacciones que pueden ocurrir en una Caja.
 * 
 * @package Finanzas\Domain\ValueObjects
 */
final class TransactionType
{
    /**
     * Ingreso por venta
     */
    public const INGRESO_VENTA = 'ingreso_venta';

    /**
     * Egreso operativo
     */
    public const EGRESO_OPERATIVO = 'egreso_operativo';

    /**
     * Cierre de caja
     */
    public const CIERRE_CAJA = 'cierre_caja';

    /**
     * Lista de tipos válidos
     */
    private const TIPOS_VALIDOS = [
        self::INGRESO_VENTA,
        self::EGRESO_OPERATIVO,
        self::CIERRE_CAJA,
    ];

    /**
     * Tipo de transacción
     *
     * @var string
     */
    private readonly string $tipo;

    /**
     * Constructor privado (patrón Value Object)
     *
     * @param string $tipo
     * @throws InvalidArgumentException
     */
    private function __construct(string $tipo)
    {
        $this->validarTipo($tipo);
        $this->tipo = $tipo;
    }

    /**
     * Factory para crear INGRESO_VENTA
     *
     * @return self
     */
    public static function ingresoVenta(): self
    {
        return new self(self::INGRESO_VENTA);
    }

    /**
     * Factory para crear EGRESO_OPERATIVO
     *
     * @return self
     */
    public static function egresoOperativo(): self
    {
        return new self(self::EGRESO_OPERATIVO);
    }

    /**
     * Factory para crear CIERRE_CAJA
     *
     * @return self
     */
    public static function cierreCaja(): self
    {
        return new self(self::CIERRE_CAJA);
    }

    /**
     * Factory desde string
     *
     * @param string $tipo
     * @return self
     * @throws InvalidArgumentException
     */
    public static function from(string $tipo): self
    {
        return new self($tipo);
    }

    /**
     * Obtener el valor del tipo
     *
     * @return string
     */
    public function value(): string
    {
        return $this->tipo;
    }

    /**
     * Verificar si es INGRESO_VENTA
     *
     * @return bool
     */
    public function esIngresoVenta(): bool
    {
        return $this->tipo === self::INGRESO_VENTA;
    }

    /**
     * Verificar si es EGRESO_OPERATIVO
     *
     * @return bool
     */
    public function esEgresoOperativo(): bool
    {
        return $this->tipo === self::EGRESO_OPERATIVO;
    }

    /**
     * Verificar si es CIERRE_CAJA
     *
     * @return bool
     */
    public function esCierreCaja(): bool
    {
        return $this->tipo === self::CIERRE_CAJA;
    }

    /**
     * Verificar si es ingreso (suma)
     *
     * @return bool
     */
    public function esIngreso(): bool
    {
        return $this->tipo === self::INGRESO_VENTA;
    }

    /**
     * Verificar si es egreso (resta)
     *
     * @return bool
     */
    public function esEgreso(): bool
    {
        return in_array($this->tipo, [self::EGRESO_OPERATIVO, self::CIERRE_CAJA], true);
    }

    /**
     * Comparar dos TransactionType
     *
     * @param TransactionType $otro
     * @return bool
     */
    public function equals(TransactionType $otro): bool
    {
        return $this->tipo === $otro->value();
    }

    /**
     * Obtener nombre legible
     *
     * @return string
     */
    public function nombre(): string
    {
        return match ($this->tipo) {
            self::INGRESO_VENTA => 'Ingreso por Venta',
            self::EGRESO_OPERATIVO => 'Egreso Operativo',
            self::CIERRE_CAJA => 'Cierre de Caja',
            default => 'Desconocido',
        };
    }

    /**
     * Obtener descripción legible
     *
     * @return string
     */
    public function descripcion(): string
    {
        return match ($this->tipo) {
            self::INGRESO_VENTA => 'Dinero ingresado por venta de productos',
            self::EGRESO_OPERATIVO => 'Dinero egresado para gastos operativos',
            self::CIERRE_CAJA => 'Cierre y reconciliación de caja',
            default => 'Tipo de transacción desconocido',
        };
    }

    /**
     * Obtener representación en string
     *
     * @return string
     */
    public function __toString(): string
    {
        return $this->tipo;
    }

    /**
     * Obtener todos los tipos válidos
     *
     * @return array
     */
    public static function getTiposValidos(): array
    {
        return self::TIPOS_VALIDOS;
    }

    /**
     * Validar que el tipo sea válido
     *
     * @param string $tipo
     * @throws InvalidArgumentException
     */
    private function validarTipo(string $tipo): void
    {
        if (!in_array($tipo, self::TIPOS_VALIDOS, true)) {
            throw new InvalidArgumentException(
                "El tipo de transacción '{$tipo}' no es válido. " .
                "Tipos válidos: " . implode(', ', self::TIPOS_VALIDOS)
            );
        }
    }
}
