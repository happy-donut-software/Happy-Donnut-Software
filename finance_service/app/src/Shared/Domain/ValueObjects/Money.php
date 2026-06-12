<?php

declare(strict_types=1);

namespace Shared\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Value Object Money (Inmutable)
 * 
 * Representa un monto de dinero en una moneda específica (PEN - Soles).
 * Es inmutable: todos los métodos que modifican valores retornan nuevas instancias.
 * Permite montos negativos para representar egresos o deudas.
 * 
 * @package Shared\Domain\ValueObjects
 */
final class Money
{
    /**
     * Moneda soportada por defecto: PEN (Soles peruanos)
     */
    private const CURRENCY = 'PEN';

    /**
     * Precisión en decimales (2 decimales para moneda)
     */
    private const SCALE = 2;

    /**
     * Monto en la moneda especificada
     * Se almacena como string para evitar problemas de precisión con float
     *
     * @var string
     */
    private readonly string $amount;

    /**
     * Código de la moneda (ISO 4217)
     *
     * @var string
     */
    private readonly string $currency;

    /**
     * Constructor privado (patrón Value Object)
     * Use los métodos factory: create(), zero(), etc.
     *
     * @param string $amount
     * @param string $currency
     * @throws InvalidArgumentException
     */
    private function __construct(string $amount, string $currency = self::CURRENCY)
    {
        $this->validateCurrency($currency);
        $this->amount = $this->normalizeAmount($amount);
        $this->currency = $currency;
    }

    /**
     * Crear una instancia de Money
     *
     * @param int|float|string $amount
     * @param string $currency
     * @return self
     * @throws InvalidArgumentException
     */
    public static function create(int|float|string $amount, string $currency = self::CURRENCY): self
    {
        return new self((string)$amount, $currency);
    }

    /**
     * Crear Money con valor cero
     *
     * @param string $currency
     * @return self
     */
    public static function zero(string $currency = self::CURRENCY): self
    {
        return new self('0.00', $currency);
    }

    /**
     * Obtener el monto como string (para cálculos precisos)
     *
     * @return string
     */
    public function getAmount(): string
    {
        return $this->amount;
    }

    /**
     * Obtener el monto como float
     *
     * @return float
     */
    public function getAmountAsFloat(): float
    {
        return (float)$this->amount;
    }

    /**
     * Obtener el monto como entero (en centavos)
     *
     * @return int
     */
    public function getAmountAsInt(): int
    {
        return (int)round($this->getAmountAsFloat() * 100);
    }

    /**
     * Obtener la moneda
     *
     * @return string
     */
    public function getCurrency(): string
    {
        return $this->currency;
    }

    /**
     * Sumar un monto
     *
     * @param Money $money
     * @return Money
     * @throws InvalidArgumentException Si las monedas no coinciden
     */
    public function add(Money $money): Money
    {
        $this->validateSameCurrency($money);

        $result = (string)((float)$this->amount + (float)$money->getAmount());
        return new self($result, $this->currency);
    }

    /**
     * Restar un monto
     *
     * @param Money $money
     * @return Money
     * @throws InvalidArgumentException Si las monedas no coinciden
     */
    public function subtract(Money $money): Money
    {
        $this->validateSameCurrency($money);

        $result = (string)((float)$this->amount - (float)$money->getAmount());
        return new self($result, $this->currency);
    }

    /**
     * Multiplicar por un factor
     *
     * @param int|float $factor
     * @return Money
     * @throws InvalidArgumentException
     */
    public function multiply(int|float $factor): Money
    {
        if ($factor < 0) {
            throw new InvalidArgumentException('El factor de multiplicación no puede ser negativo');
        }

        $result = (string)((float)$this->amount * (float)$factor);
        return new self($result, $this->currency);
    }

    /**
     * Dividir por un factor
     *
     * @param int|float $divisor
     * @return Money
     * @throws InvalidArgumentException
     */
    public function divide(int|float $divisor): Money
    {
        if ($divisor == 0) {
            throw new InvalidArgumentException('No se puede dividir entre cero');
        }

        if ($divisor < 0) {
            throw new InvalidArgumentException('El divisor no puede ser negativo');
        }

        $result = (string)((float)$this->amount / (float)$divisor);
        return new self($result, $this->currency);
    }

    /**
     * Obtener el valor absoluto
     *
     * @return Money
     */
    public function absolute(): Money
    {
        $result = (string)abs((float)$this->amount);
        return new self($result, $this->currency);
    }

    /**
     * Negar el monto (cambiar signo)
     *
     * @return Money
     */
    public function negate(): Money
    {
        $result = (string)(-(float)$this->amount);
        return new self($result, $this->currency);
    }

    /**
     * Verificar si es mayor que otro Money
     *
     * @param Money $money
     * @return bool
     * @throws InvalidArgumentException
     */
    public function isGreaterThan(Money $money): bool
    {
        $this->validateSameCurrency($money);
        return (float)$this->amount > (float)$money->getAmount();
    }

    /**
     * Verificar si es mayor o igual que otro Money
     *
     * @param Money $money
     * @return bool
     * @throws InvalidArgumentException
     */
    public function isGreaterThanOrEqual(Money $money): bool
    {
        $this->validateSameCurrency($money);
        return (float)$this->amount >= (float)$money->getAmount();
    }

    /**
     * Verificar si es menor que otro Money
     *
     * @param Money $money
     * @return bool
     * @throws InvalidArgumentException
     */
    public function isLessThan(Money $money): bool
    {
        $this->validateSameCurrency($money);
        return (float)$this->amount < (float)$money->getAmount();
    }

    /**
     * Verificar si es menor o igual que otro Money
     *
     * @param Money $money
     * @return bool
     * @throws InvalidArgumentException
     */
    public function isLessThanOrEqual(Money $money): bool
    {
        $this->validateSameCurrency($money);
        return (float)$this->amount <= (float)$money->getAmount();
    }

    /**
     * Verificar si es igual a otro Money
     *
     * @param Money $money
     * @return bool
     */
    public function equals(Money $money): bool
    {
        return $this->currency === $money->getCurrency()
            && $this->getAmountAsInt() === $money->getAmountAsInt();
    }

    /**
     * Verificar si es cero
     *
     * @return bool
     */
    public function isZero(): bool
    {
        return (float)$this->amount === 0.0;
    }

    /**
     * Verificar si es positivo
     *
     * @return bool
     */
    public function isPositive(): bool
    {
        return (float)$this->amount > 0.0;
    }

    /**
     * Verificar si es negativo
     *
     * @return bool
     */
    public function isNegative(): bool
    {
        return (float)$this->amount < 0.0;
    }

    /**
     * Obtener representación en string formateada
     *
     * @return string
     */
    public function toString(): string
    {
        return number_format($this->getAmountAsFloat(), self::SCALE, '.', ',') . ' ' . $this->currency;
    }

    /**
     * Obtener representación en string
     *
     * @return string
     */
    public function __toString(): string
    {
        return $this->toString();
    }

    /**
     * Normalizar el monto a la precisión requerida
     *
     * @param string $amount
     * @return string
     * @throws InvalidArgumentException
     */
    private function normalizeAmount(string $amount): string
    {
        // Validar que sea un número válido
        if (!is_numeric($amount)) {
            throw new InvalidArgumentException("El monto '{$amount}' no es un número válido");
        }

        // Convertir a float y redondear a la precisión correcta
        $floatAmount = (float)$amount;
        $normalized = number_format($floatAmount, self::SCALE, '.', '');

        return $normalized;
    }

    /**
     * Validar la moneda
     *
     * @param string $currency
     * @throws InvalidArgumentException
     */
    private function validateCurrency(string $currency): void
    {
        if (empty($currency)) {
            throw new InvalidArgumentException('La moneda no puede estar vacía');
        }

        if (strlen($currency) !== 3) {
            throw new InvalidArgumentException('El código de moneda debe tener 3 caracteres (ISO 4217)');
        }

        // Por ahora solo permitimos PEN, pero puede extenderse
        if ($currency !== self::CURRENCY) {
            throw new InvalidArgumentException("La moneda '{$currency}' no es soportada. Use: " . self::CURRENCY);
        }
    }

    /**
     * Validar que dos Money tengan la misma moneda
     *
     * @param Money $money
     * @throws InvalidArgumentException
     */
    private function validateSameCurrency(Money $money): void
    {
        if ($this->currency !== $money->getCurrency()) {
            throw new InvalidArgumentException(
                "No se pueden operar monedas diferentes: {$this->currency} y {$money->getCurrency()}"
            );
        }
    }
}
