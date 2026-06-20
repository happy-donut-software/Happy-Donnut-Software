<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * DTO principal para la creación de un pedido.
 * Contiene quién compra y qué cosas está comprando.
 */
readonly class CrearOrdenDTO
{
    /**
     * @param string $clienteId
     * @param ItemOrdenDTO[] $items
     */
    public function __construct(
        public string $clienteId,
        public array $items
    ) {
    }
}