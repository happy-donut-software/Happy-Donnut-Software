<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use DomainException;

/**
 * Caso de Uso: Procesar el pago de un pedido existente.
 */
class PagarOrdenUseCase
{
    public function __construct(
        private readonly OrdenRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(string $ordenId): OrdenVenta
    {
        // 1. Buscamos la orden
        $orden = $this->repositorio->buscarPorId($ordenId);

        if ($orden === null) {
            throw new DomainException("La orden especificada no existe.");
        }

        // 2. Delegamos la lógica de negocio al Agregado
        // Él verificará si está PENDIENTE antes de cambiar a PAGADA.
        $orden->marcarComoPagada();

        // 3. Guardamos los cambios
        $this->repositorio->guardar($orden);

        // =========================================================
        // ¡MAGIA DE MICROSERVICIOS (Próximamente)!
        // Aquí es donde dispararemos un Evento a RabbitMQ que diga:
        // "¡OrdenPagada! Inventario, descuenta estas donas de tu stock"
        // =========================================================

        return $orden;
    }
}