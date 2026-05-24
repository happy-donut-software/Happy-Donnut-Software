<?php

namespace App\Core\Domain\Models;

final class Lote
{
    private ?int $loteId;
    private float $cantidadRestante;
    private \DateTimeImmutable $fechaVencimiento;
    private bool $agotado;

    public function __construct(?int $loteId, float $cantidadRestante, \DateTimeImmutable $fechaVencimiento)
    {
        if ($cantidadRestante < 0) {
            throw new \InvalidArgumentException('La cantidad restante de lote no puede ser negativa.');
        }

        $this->loteId = $loteId;
        $this->cantidadRestante = round($cantidadRestante, 2);
        $this->fechaVencimiento = $fechaVencimiento;
        $this->agotado = $this->cantidadRestante <= 0;
    }

    public function id(): ?int
    {
        return $this->loteId;
    }

    public function cantidadRestante(): float
    {
        return $this->cantidadRestante;
    }

    public function fechaVencimiento(): \DateTimeImmutable
    {
        return $this->fechaVencimiento;
    }

    public function estaAgotado(): bool
    {
        return $this->agotado;
    }

    public function consumir(float $cantidad): float
    {
        if ($cantidad <= 0) {
            return 0.0;
        }

        if ($this->agotado) {
            return 0.0;
        }

        $consumido = min($cantidad, $this->cantidadRestante);
        $this->cantidadRestante = round($this->cantidadRestante - $consumido, 2);
        $this->agotado = $this->cantidadRestante <= 0;

        return $consumido;
    }

    public function marcaAgotado(): void
    {
        $this->cantidadRestante = 0.0;
        $this->agotado = true;
    }

    public function toArray(): array
    {
        return [
            'lote_id' => $this->loteId,
            'cantidad_restante' => $this->cantidadRestante,
            'fecha_vencimiento' => $this->fechaVencimiento->format('Y-m-d H:i:s'),
            'agotado' => $this->agotado,
        ];
    }
}
