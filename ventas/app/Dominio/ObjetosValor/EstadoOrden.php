<?php

declare(strict_types=1);

namespace App\Dominio\ObjetosValor;

/**
 * Representa los estados posibles de una Orden de Venta.
 */
enum EstadoOrden: string
{
    case PENDIENTE = 'pendiente';     // Orden creada, esperando pago
    case PAGADA = 'pagada';           // Cliente pagó
    case PREPARANDO = 'preparando';   // En cocina
    case ENTREGADA = 'entregada';     // Cliente recibió su pedido
    case CANCELADA = 'cancelada';     // Orden anulada

    public function puedeSerPagada(): bool
    {
        return $this === self::PENDIENTE;
    }

    public function puedeSerCancelada(): bool
    {
        return $this === self::PENDIENTE || $this === self::PAGADA;
    }
}