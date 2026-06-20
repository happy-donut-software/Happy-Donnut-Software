<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Dominio\Agregados\CarritoCompras;
use App\Dominio\Puertos\CarritoRepositoryInterface;

/**
 * Caso de Uso: Devuelve el carrito actual para mostrarlo en pantalla.
 */
class ObtenerCarritoUseCase
{
    public function __construct(
        private readonly CarritoRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(string $clienteId): CarritoCompras
    {
        $carrito = $this->repositorio->buscarPorClienteId($clienteId);

        // Si el cliente entra a "Mi Carrito" pero no ha agregado nada,
        // devolvemos un carrito vacío en memoria para no romper la interfaz gráfica.
        if ($carrito === null) {
            return new CarritoCompras(uniqid('cart_tmp_'), $clienteId);
        }

        return $carrito;
    }
}