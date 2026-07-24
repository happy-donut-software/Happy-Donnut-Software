<?php

declare(strict_types=1);

namespace App\Dominio\Agregados;

use DomainException;

class AcumuladoRus
{
    public function __construct(
        private readonly string $periodo,
        private float $total = 0.0,
        private readonly float $limite = 5000.0
    ) {
        if (!preg_match('/^\d{4}-\d{2}$/', $periodo)) { throw new DomainException('El periodo RUS debe usar YYYY-MM.'); }
        if ($total < 0 || $limite <= 0) { throw new DomainException('Los montos RUS no son validos.'); }
    }

    public function registrarComprobante(float $monto, string $tipoComprobante): string
    {
        if ($monto <= 0) { throw new DomainException('El monto de venta debe ser mayor a cero.'); }
        if (strtoupper($tipoComprobante) === 'BOLETA') { $this->total = round($this->total + $monto, 2); }
        return $this->obtenerEstado();
    }

    public function obtenerEstado(): string
    {
        if ($this->total > $this->limite) { return 'EXCEDIDO'; }
        if ($this->total >= $this->limite * 0.9) { return 'PROXIMO_AL_LIMITE'; }
        return 'NORMAL';
    }

    public function obtenerPeriodo(): string { return $this->periodo; }
    public function obtenerTotal(): float { return $this->total; }
    public function obtenerLimite(): float { return $this->limite; }
}