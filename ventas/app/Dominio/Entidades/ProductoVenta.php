<?php

declare(strict_types=1);

namespace App\Dominio\Entidades;

use DomainException;

readonly class ProductoVenta
{
    public function __construct(
        public string $id,
        public string $nombre,
        public float $precio,
        public bool $activo = true,
        public ?int $categoriaId = null,
        public ?string $categoriaNombre = null,
        public ?string $categoriaSlug = null,
        public ?string $descripcion = null,
        public ?string $imagenUrl = null,
    ) {
        if (trim($id) === '' || trim($nombre) === '' || $precio <= 0) {
            throw new DomainException('Producto de venta invalido.');
        }
    }
}
