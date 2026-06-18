<?php

declare(strict_types=1);

namespace App\Dominio\Agregados;

use App\Dominio\Entidades\MovimientoCaja;
use App\Dominio\ObjetosValor\EstadoTurno;
use App\Dominio\ObjetosValor\Monto;
use App\Dominio\ObjetosValor\TipoMovimiento;
use DateTimeImmutable;
use DomainException;

/**
 * Raíz del Agregado (Aggregate Root) para el control de finanzas de la tienda.
 * Es el único punto de entrada para modificar el estado del dinero durante un turno.
 */
class TurnoCaja
{
    /** @var MovimientoCaja[] */
    private array $movimientos = [];

    private ?DateTimeImmutable $fechaCierre = null;

    public function __construct(
        private readonly string $id,
        private readonly string $cajeroId,
        private readonly Monto $montoApertura,
        private readonly DateTimeImmutable $fechaInicio,
        private EstadoTurno $estado = EstadoTurno::ABIERTO
    ) {
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerCajeroId(): string
    {
        return $this->cajeroId;
    }

    public function obtenerEstado(): EstadoTurno
    {
        return $this->estado;
    }

    public function obtenerMontoApertura(): Monto
    {
        return $this->montoApertura;
    }

    public function obtenerFechaInicio(): DateTimeImmutable
    {
        return $this->fechaInicio;
    }

    public function obtenerFechaCierre(): ?DateTimeImmutable
    {
        return $this->fechaCierre;
    }

    /**
     * @return MovimientoCaja[]
     */
    public function obtenerMovimientos(): array
    {
        return $this->movimientos;
    }

    /**
     * Regla de Negocio 1 (Protección): Solo se pueden registrar movimientos
     * de dinero si el turno está oficialmente abierto.
     */
    public function registrarMovimiento(MovimientoCaja $movimiento): void
    {
        if ($this->estado->estaCerrado()) {
            throw new DomainException("No se pueden registrar movimientos en un turno de caja cerrado.");
        }

        $this->movimientos[] = $movimiento;
    }

    /**
     * Regla de Negocio 2 (Matemática): El saldo esperado es la base de apertura
     * más todas las entradas, menos todas las salidas registradas.
     */
    public function calcularSaldoEsperado(): Monto
    {
        $saldo = $this->montoApertura;

        foreach ($this->movimientos as $movimiento) {
            if ($movimiento->esEntrada()) {
                $saldo = $saldo->sumar($movimiento->obtenerMonto());
            } elseif ($movimiento->esSalida()) {
                $saldo = $saldo->restar($movimiento->obtenerMonto());
            }
        }

        return $saldo;
    }

    /**
     * Regla de Negocio 3 (Arqueo/Cuadre): Cierra la caja comparando la realidad 
     * física (billetes y monedas) con la matemática del sistema.
     */
    public function cerrarTurno(Monto $dineroFisicoReal, DateTimeImmutable $fechaCierre): void
    {
        if ($this->estado->estaCerrado()) {
            throw new DomainException("Este turno de caja ya fue cerrado previamente.");
        }

        $saldoEsperado = $this->calcularSaldoEsperado();

        // Validamos si hay diferencias (cuadre imperfecto)
        if (!$dineroFisicoReal->esIgualA($saldoEsperado)) {
            $this->registrarDiscrepanciaDeArqueo($saldoEsperado, $dineroFisicoReal, $fechaCierre);
        }

        $this->estado = EstadoTurno::CERRADO;
        $this->fechaCierre = $fechaCierre;
    }

    /**
     * Lógica interna para manejar sobrantes o faltantes al momento de cuadrar.
     */
    private function registrarDiscrepanciaDeArqueo(
        Monto $saldoEsperado, 
        Monto $dineroFisicoReal, 
        DateTimeImmutable $fechaArqueo
    ): void {
        // ID autogenerado o provisto por un servicio de UUIDs en la capa de aplicación
        $movimientoId = uniqid('arqueo_'); 

        if ($dineroFisicoReal->obtenerValor() > $saldoEsperado->obtenerValor()) {
            // Hay más plata de la que debería (Sobrante)
            $diferencia = $dineroFisicoReal->restar($saldoEsperado);
            $movimiento = new MovimientoCaja(
                $movimientoId,
                $diferencia,
                TipoMovimiento::SOBRANTE_ARQUEO,
                $fechaArqueo,
                "Sobrante detectado en el arqueo de cierre"
            );
        } else {
            // Falta plata en el cajón (Faltante)
            $diferencia = $saldoEsperado->restar($dineroFisicoReal);
            $movimiento = new MovimientoCaja(
                $movimientoId,
                $diferencia,
                TipoMovimiento::FALTANTE_ARQUEO,
                $fechaArqueo,
                "Faltante detectado en el arqueo de cierre"
            );
        }

        // Lo agregamos directamente saltándonos la regla de caja cerrada 
        // porque el cierre es justo lo que está ocurriendo ahora.
        $this->movimientos[] = $movimiento;
    }
}