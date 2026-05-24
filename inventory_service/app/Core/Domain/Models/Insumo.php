<?php

namespace App\Core\Domain\Models;

final class Insumo
{
    private int $insumoId;
    private string $nombre;
    private string $unidadMedida;
    /** @var Lote[] */
    private array $lotes;

    public function __construct(int $insumoId, string $nombre, string $unidadMedida, array $lotes = [])
    {
        $this->insumoId = $insumoId;
        $this->nombre = trim($nombre);
        $this->unidadMedida = trim($unidadMedida);
        $this->lotes = $this->ordenarLotes($lotes);
    }

    public function id(): int
    {
        return $this->insumoId;
    }

    public function nombre(): string
    {
        return $this->nombre;
    }

    public function unidadMedida(): string
    {
        return $this->unidadMedida;
    }

    /** @return Lote[] */
    public function lotes(): array
    {
        return $this->lotes;
    }

    public function stockTotalDisponible(): float
    {
        return array_reduce($this->lotes, fn($total, Lote $lote) => $total + $lote->cantidadRestante(), 0.0);
    }

    public function consumirStock(float $cantidadRequerida): void
    {
        if ($cantidadRequerida <= 0) {
            return;
        }

        $cantidadRequerida = round($cantidadRequerida, 2);

        if ($cantidadRequerida > $this->stockTotalDisponible()) {
            throw new \DomainException('Stock insuficiente para consumir la cantidad requerida.');
        }

        foreach ($this->lotes as $lote) {
            if ($cantidadRequerida <= 0) {
                break;
            }

            $consumido = $lote->consumir($cantidadRequerida);
            $cantidadRequerida = round($cantidadRequerida - $consumido, 2);
        }

        if ($cantidadRequerida > 0) {
            throw new \DomainException('No fue posible consumir el stock requerido en los lotes disponibles.');
        }
    }

    /** @return Lote[] */
    public function lotesAfectados(): array
    {
        return array_filter($this->lotes, fn(Lote $lote) => $lote->estaAgotado() || $lote->cantidadRestante() >= 0);
    }

    private function ordenarLotes(array $lotes): array
    {
        usort($lotes, function (Lote $a, Lote $b) {
            return $a->fechaVencimiento() <=> $b->fechaVencimiento();
        });

        return $lotes;
    }
}
