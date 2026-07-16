<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

class CrearOrdenDTO
{
    /**
     * @param ItemOrdenDTO[] $items
     */
    public function __construct(
        private readonly ?string $clienteId, 
        private readonly array $items
    ) {
    }

    public function obtenerClienteId(): ?string
    {
        return $this->clienteId;
    }

    /**
     * @return ItemOrdenDTO[]
     */
    public function obtenerItems(): array
    {
        return $this->items;
    }
}