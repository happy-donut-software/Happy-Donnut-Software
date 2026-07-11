<?php

declare(strict_types=1);

namespace App\Infraestructura\Adaptadores\RabbitMQ;

use App\Aplicacion\CasosUso\ProcesarOrdenPagadaUseCase;
use PhpAmqpLib\Connection\AMQPStreamConnection;

/**
 * Adaptador de entrada que consume eventos ventas.orden.pagada desde RabbitMQ.
 */
class ConsumidorOrdenPagada
{
    public function __construct(
        private readonly ProcesarOrdenPagadaUseCase $procesarOrdenPagadaUseCase
    ) {
    }

    public function consumir(callable $deberiaContinuar = null): void
    {
        $host = config('messaging.rabbitmq.host', 'rabbitmq');
        $port = (int) config('messaging.rabbitmq.port', 5672);
        $user = config('messaging.rabbitmq.user', 'guest');
        $password = config('messaging.rabbitmq.password', 'guest');
        $exchange = config('messaging.rabbitmq.exchange', 'happydonut.events');
        $queue = config('messaging.rabbitmq.queue', 'inventario.orden.pagada');
        $routingKey = config('messaging.rabbitmq.routing_key', 'ventas.orden.pagada');

        $conexion = new AMQPStreamConnection($host, $port, $user, $password);
        $canal = $conexion->channel();

        $canal->exchange_declare($exchange, 'topic', false, true, false);
        $canal->queue_declare($queue, false, true, false, false);
        $canal->queue_bind($queue, $exchange, $routingKey);

        $callback = function ($mensaje) {
            $payload = json_decode($mensaje->body, true, 512, JSON_THROW_ON_ERROR);
            $this->procesarOrdenPagadaUseCase->ejecutar(
                $payload['orden_id'],
                $payload['items'] ?? []
            );
            $mensaje->ack();
        };

        $canal->basic_qos(null, 1, null);
        $canal->basic_consume($queue, '', false, false, false, false, $callback);

        while ($canal->is_consuming()) {
            if ($deberiaContinuar !== null && !$deberiaContinuar()) {
                break;
            }
            $canal->wait();
        }

        $canal->close();
        $conexion->close();
    }
}