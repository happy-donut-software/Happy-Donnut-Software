<?php

namespace App\Core\Infrastructure\Adapters;

use App\Core\Domain\Models\Insumo;
use App\Core\Domain\Models\Lote;
use App\Core\Domain\Ports\InventarioRepositoryInterface;
use App\Models\Insumo as InsumoModel;
use App\Models\LoteInsumo;

final class EloquentInventarioRepository implements InventarioRepositoryInterface
{
    public function obtenerInsumoConLotesActivos(int $insumoId): ?Insumo
    {
        $insumoModel = InsumoModel::with(['lotes' => function ($query) {
            $query->where('cantidad_restante', '>', 0)
                  ->orderBy('fecha_caducidad', 'asc');
        }])->find($insumoId);

        if (!$insumoModel) {
            return null;
        }

        $lotes = array_map(fn($loteModel) => $this->mapLote($loteModel), $insumoModel->lotes->all());

        return new Insumo(
            $insumoModel->insumo_id,
            $insumoModel->nombre_insumo,
            $insumoModel->unidad_medida_base,
            $lotes
        );
    }

    /**
     * @param Lote[] $lotes
     */
    public function guardarLotes(array $lotes): void
    {
        foreach ($lotes as $lote) {
            if ($lote->id() === null) {
                continue;
            }

            LoteInsumo::where('lote_id', $lote->id())
                ->update(['cantidad_restante' => $lote->cantidadRestante()]);
        }
    }

    private function mapLote(LoteInsumo $loteModel): Lote
    {
        return new Lote(
            $loteModel->lote_id,
            (float) $loteModel->cantidad_restante,
            new \DateTimeImmutable($loteModel->fecha_caducidad),
        );
    }
}
