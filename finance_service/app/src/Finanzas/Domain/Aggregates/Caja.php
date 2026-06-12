<?php

declare(strict_types=1);

namespace Finanzas\Domain\Aggregates;

use Finanzas\Domain\Events\CajaAbierta;
use Finanzas\Domain\Events\TransaccionRegistrada;
use Finanzas\Domain\Events\CajaCerrada;
use Finanzas\Domain\ValueObjects\TransactionType;
use Shared\Domain\ValueObjects\Money;
use InvalidArgumentException;

/**
 * Caja - Aggregate Root
 * 
 * Representa una caja registradora para un vendedor en Happy Donut.
 * Maneja el ciclo de vida: apertura -> transacciones -> cierre.
 * 
 * Es un Modelo Rico (Rich Domain Model) que contiene toda la lógica de negocio.
 * 
 * @package Finanzas\Domain\Aggregates
 */
final class Caja
{
    /**
     * Estados posibles de la caja
     */
    private const ESTADO_ABIERTA = 'abierta';
    private const ESTADO_CERRADA = 'cerrada';

    /**
     * Identificador único de la caja (UUID)
     *
     * @var string
     */
    private readonly string $id;

    /**
     * Identificador del vendedor que administra la caja
     *
     * @var string
     */
    private readonly string $vendedor_id;

    /**
     * Monto inicial de la caja al momento de apertura
     *
     * @var Money
     */
    private readonly Money $monto_apertura;

    /**
     * Monto actual en la caja
     *
     * @var Money
     */
    private Money $monto_actual;

    /**
     * Estado de la caja: 'abierta' o 'cerrada'
     *
     * @var string
     */
    private string $estado;

    /**
     * Fecha y hora de apertura
     *
     * @var \DateTime
     */
    private readonly \DateTime $fecha_apertura;

    /**
     * Fecha y hora de cierre (si aplica)
     *
     * @var \DateTime|null
     */
    private ?\DateTime $fecha_cierre = null;

    /**
     * Monto final registrado al cerrar la caja
     *
     * @var Money|null
     */
    private ?Money $monto_cierre = null;

    /**
     * Diferencia entre monto teórico y monto real al cerrar
     *
     * @var Money|null
     */
    private ?Money $diferencia = null;

    /**
     * Lista de eventos de dominio (cambios que ocurrieron)
     *
     * @var array<object>
     */
    private array $eventos_dominio = [];

    /**
     * Número de transacciones registradas
     *
     * @var int
     */
    private int $total_transacciones = 0;

    /**
     * Constructor privado - usar métodos factory
     */
    public function __construct(
        string $id,
        string $vendedor_id,
        Money $monto_apertura,
        \DateTime $fecha_apertura,
        ?Money $monto_actual = null,
        ?string $estado = null,
        ?\DateTime $fecha_cierre = null,
        ?Money $diferencia = null
    ) {
        $this->id = $id;
        $this->vendedor_id = $vendedor_id;
        $this->monto_apertura = $monto_apertura;
        $this->fecha_apertura = $fecha_apertura;
        
        // Si no se pasan (caja nueva), toman los valores por defecto de apertura
        $this->monto_actual = $monto_actual ?? $monto_apertura;
        $this->estado = $estado ?? self::ESTADO_ABIERTA;
        $this->fecha_cierre = $fecha_cierre;
        $this->diferencia = $diferencia;
    }

    /**
     * Crear (abrir) una nueva Caja
     *
     * @param string $id ID único (UUID)
     * @param string $vendedor_id ID del vendedor
     * @param Money $monto_apertura Monto inicial de la caja
     * @param \DateTime|null $fecha_apertura Fecha de apertura (por defecto: ahora)
     * @return self
     */
    public static function abrir(
        string $id,
        string $vendedor_id,
        Money $monto_apertura,
        ?\DateTime $fecha_apertura = null
    ): self {
        $fecha = $fecha_apertura ?? new \DateTime();
        
        $caja = new self($id, $vendedor_id, $monto_apertura, $fecha);
        
        // Registrar evento de dominio
        $caja->registrarEvento(new CajaAbierta(
            cajaId: $id,
            vendedorId: $vendedor_id,
            montoApertura: $monto_apertura,
            fechaApertura: $fecha
        ));

        return $caja;
    }

    /**
     * Registrar un ingreso en la caja (venta)
     *
     * @param Money $monto Monto a ingresar
     * @param string $descripcion Descripción de la transacción
     * @return void
     * @throws InvalidArgumentException si la caja está cerrada
     */
    public function registrarIngreso(Money $monto, string $descripcion): void
    {
        $this->validarCajaAbierta();
        $this->validarMontoPositivo($monto);

        // Sumar el monto al total actual
        $this->monto_actual = $this->monto_actual->add($monto);
        $this->total_transacciones++;

        // Registrar evento
        $this->registrarEvento(new TransaccionRegistrada(
            cajaId: $this->id,
            tipo: TransactionType::ingresoVenta(),
            monto: $monto,
            descripcion: $descripcion,
            montoActual: $this->monto_actual,
            fechaTransaccion: new \DateTime()
        ));
    }

    /**
     * Registrar un egreso en la caja
     *
     * @param Money $monto Monto a egresar (puede ser negativo)
     * @param string $descripcion Descripción del gasto
     * @return void
     * @throws InvalidArgumentException si la caja está cerrada o monto es negativo
     */
    public function registrarEgreso(Money $monto, string $descripcion): void
    {
        $this->validarCajaAbierta();
        $this->validarMontoPositivo($monto);

        // Convertir a negativo para restar
        $monto_negativo = $monto->negate();

        // Restar el monto
        $this->monto_actual = $this->monto_actual->add($monto_negativo);
        $this->total_transacciones++;

        // Registrar evento
        $this->registrarEvento(new TransaccionRegistrada(
            cajaId: $this->id,
            tipo: TransactionType::egresoOperativo(),
            monto: $monto_negativo,
            descripcion: $descripcion,
            montoActual: $this->monto_actual,
            fechaTransaccion: new \DateTime()
        ));
    }

    /**
     * Arquear y cerrar la caja
     *
     * @param Money $montoFinalReal Monto final contado físicamente
     * @return void
     * @throws InvalidArgumentException si la caja ya está cerrada
     */
    public function arquearYCerrar(Money $montoFinalReal): void
    {
        $this->validarCajaAbierta();

        // Registrar valores de cierre
        $this->estado = self::ESTADO_CERRADA;
        $this->fecha_cierre = new \DateTime();
        $this->monto_cierre = $montoFinalReal;

        // Calcular diferencia (monto real - monto teórico)
        $this->diferencia = $montoFinalReal->subtract($this->monto_actual);

        // Registrar evento
        $this->registrarEvento(new CajaCerrada(
            cajaId: $this->id,
            vendedorId: $this->vendedor_id,
            montoTeoricoFinal: $this->monto_actual,
            montoRealFinal: $montoFinalReal,
            diferencia: $this->diferencia,
            fechaCierre: $this->fecha_cierre,
            totalTransacciones: $this->total_transacciones
        ));
    }

    /**
     * Obtener el ID de la caja
     *
     * @return string
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * Obtener el ID del vendedor
     *
     * @return string
     */
    public function getVendedorId(): string
    {
        return $this->vendedor_id;
    }

    /**
     * Obtener monto de apertura
     *
     * @return Money
     */
    public function getMontoApertura(): Money
    {
        return $this->monto_apertura;
    }

    /**
     * Obtener monto actual
     *
     * @return Money
     */
    public function getMontoActual(): Money
    {
        return $this->monto_actual;
    }

    /**
     * Obtener estado
     *
     * @return string
     */
    public function getEstado(): string
    {
        return $this->estado;
    }

    /**
     * Verificar si la caja está abierta
     *
     * @return bool
     */
    public function estaAbierta(): bool
    {
        return $this->estado === self::ESTADO_ABIERTA;
    }

    /**
     * Verificar si la caja está cerrada
     *
     * @return bool
     */
    public function estaCerrada(): bool
    {
        return $this->estado === self::ESTADO_CERRADA;
    }

    /**
     * Obtener fecha de apertura
     *
     * @return \DateTime
     */
    public function getFechaApertura(): \DateTime
    {
        return $this->fecha_apertura;
    }

    /**
     * Obtener fecha de cierre
     *
     * @return \DateTime|null
     */
    public function getFechaCierre(): ?\DateTime
    {
        return $this->fecha_cierre;
    }

    /**
     * Obtener monto de cierre
     *
     * @return Money|null
     */
    public function getMontoFinalCierre(): ?Money
    {
        return $this->monto_cierre;
    }

    /**
     * Obtener diferencia al cierre
     *
     * @return Money|null
     */
    public function getDiferencia(): ?Money
    {
        return $this->diferencia;
    }

    /**
     * Verificar si hay faltante (diferencia negativa)
     *
     * @return bool
     */
    public function hayFaltante(): bool
    {
        return $this->diferencia !== null && $this->diferencia->isNegative();
    }

    /**
     * Verificar si hay sobrante (diferencia positiva)
     *
     * @return bool
     */
    public function haySobrante(): bool
    {
        return $this->diferencia !== null && $this->diferencia->isPositive();
    }

    /**
     * Obtener total de transacciones
     *
     * @return int
     */
    public function getTotalTransacciones(): int
    {
        return $this->total_transacciones;
    }

    /**
     * Obtener eventos de dominio registrados
     *
     * @return array<object>
     */
    public function getEventosDominio(): array
    {
        return $this->eventos_dominio;
    }

    /**
     * Limpiar eventos después de procesarlos
     *
     * @return void
     */
    public function limpiarEventos(): void
    {
        $this->eventos_dominio = [];
    }

    /**
     * Registrar un evento de dominio
     *
     * @param object $evento
     * @return void
     */
    private function registrarEvento(object $evento): void
    {
        $this->eventos_dominio[] = $evento;
    }

    /**
     * Validar que la caja esté abierta
     *
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarCajaAbierta(): void
    {
        if (!$this->estaAbierta()) {
            throw new InvalidArgumentException(
                'No se pueden registrar transacciones en una caja cerrada. ' .
                "Estado actual: {$this->estado}"
            );
        }
    }

    /**
     * Validar que un monto sea positivo
     *
     * @param Money $monto
     * @return void
     * @throws InvalidArgumentException
     */
    private function validarMontoPositivo(Money $monto): void
    {
        if (!$monto->isPositive()) {
            throw new InvalidArgumentException(
                'El monto debe ser positivo. Monto: ' . $monto->toString()
            );
        }
    }

    /**
     * Obtener resumen de la caja
     *
     * @return array
     */
    public function getResumen(): array
    {
        return [
            'id' => $this->id,
            'vendedor_id' => $this->vendedor_id,
            'estado' => $this->estado,
            'monto_apertura' => $this->monto_apertura->toString(),
            'monto_actual' => $this->monto_actual->toString(),
            'monto_cierre' => $this->monto_cierre?->toString(),
            'diferencia' => $this->diferencia?->toString(),
            'fecha_apertura' => $this->fecha_apertura->format('Y-m-d H:i:s'),
            'fecha_cierre' => $this->fecha_cierre?->format('Y-m-d H:i:s'),
            'total_transacciones' => $this->total_transacciones,
            'hay_faltante' => $this->hayFaltante(),
            'hay_sobrante' => $this->haySobrante(),
        ];
    }
}
