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

    public function ejecutar(string $ordenId, float $montoRecibido, string $metodoPago = 'EFECTIVO', string $tipoComprobante = 'NOTA_PEDIDO'): OrdenVenta
    {
        // 1. Buscamos la orden
        $orden = $this->repositorio->buscarPorId($ordenId);

        if ($orden === null) {
            throw new DomainException("La orden especificada no existe.");
        }

        // 2. Delegamos la lógica de negocio al Agregado
        // Él verificará si está PENDIENTE antes de cambiar a PAGADA.
        $orden->registrarPago($montoRecibido, $metodoPago, $tipoComprobante);

        // Persistimos el pago y el hecho de dominio en una sola transacción.
        $this->repositorio->guardarPagoYEvento($orden, [
            'id' => 'evt_' . bin2hex(random_bytes(16)),
            'nombre' => 'VentaFinalizada.v1',
            'ocurrido_en' => (new \DateTimeImmutable())->format('Y-m-d H:i:s'),
            'payload' => [
                'venta_id' => $orden->obtenerId(),
                'cliente_id' => $orden->obtenerClienteId(),
                'total' => $orden->calcularTotal(),
                'metodo_pago' => $orden->obtenerMetodoPago(),
                'tipo_comprobante' => $orden->obtenerTipoComprobante(),
                'lineas' => array_map(static fn ($linea): array => [
                    'producto_id' => $linea->obtenerProductoId(),
                    'cantidad' => $linea->obtenerCantidad(),
                ], $orden->obtenerLineas()),
            ],
        ]);

        // =========================================================
        // ¡MAGIA DE MICROSERVICIOS (Próximamente)!
        // Aquí es donde dispararemos un Evento a RabbitMQ que diga:
        // "¡OrdenPagada! Inventario, descuenta estas donas de tu stock"
        // =========================================================

        return $orden;
    }
}