<?php

declare(strict_types=1);

namespace App\Dominio\Eventos;

/**
 * Evento de dominio emitido cuando una orden de venta fue pagada exitosamente.
 */
readonly class OrdenPagada
{
    /**
     * @param array<int, array{producto_id: string, cantidad: int}> $items
     */
    public function __construct(
        public string $ordenId,
        public string $clienteId,
        public float $total,
        public array $items,
        public string $ocurridoEn
    ) {
    }

    public function aArray(): array
    {
        return [
            'evento' => 'ventas.orden.pagada',
            'orden_id' => $this->ordenId,
            'cliente_id' => $this->clienteId,
            'total' => $this->total,
            'items' => $this->items,
            'ocurrido_en' => $this->ocurridoEn,
        ];
    }
}