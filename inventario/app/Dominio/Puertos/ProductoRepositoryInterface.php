<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Agregados\ProductoInventario;

/**
 * Puerto de Salida.
 * Define cómo la capa de aplicación buscará y guardará los productos,
 * sin importarle si usamos PostgreSQL, MySQL o archivos de texto.
 */
interface ProductoRepositoryInterface
{
    public function buscarPorId(string $id): ?ProductoInventario;
    
    public function guardar(ProductoInventario $producto): void;
}