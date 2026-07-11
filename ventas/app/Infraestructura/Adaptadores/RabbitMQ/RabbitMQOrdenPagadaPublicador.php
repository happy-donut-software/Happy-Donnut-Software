<?php

declare(strict_types=1);

namespace App\Infraestructura\Adaptadores\RabbitMQ;

use App\Dominio\Eventos\OrdenPagada;
use App\Dominio\Puertos\OrdenPagadaPublicadorInterface;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

/**
 * Adaptador de salida que publica eventos OrdenPagada en RabbitMQ.
 */
class RabbitMQOrdenPagadaPublicador implements OrdenPagadaPublicadorInterface
{
    public function publicar(OrdenPagada $evento): void
    {
        $host = config('messaging.rabbitmq.host', 'rabbitmq');
        $port = (int) config('messaging.rabbitmq.port', 5672);
        $user = config('messaging.rabbitmq.user', 'guest');
        $password = config('messaging.rabbitmq.password', 'guest');
        $exchange = config('messaging.rabbitmq.exchange', 'happydonut.events');
        $routingKey = config('messaging.rabbitmq.routing_key', 'ventas.orden.pagada');

        $conexion = new AMQPStreamConnection($host, $port, $user, $password);
        $canal = $conexion->channel();

        $canal->exchange_declare($exchange, 'topic', false, true, false);

        $mensaje = new AMQPMessage(
            json_encode($evento->aArray(), JSON_THROW_ON_ERROR),
            ['content_type' => 'application/json', 'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
        );

        $canal->basic_publish($mensaje, $exchange, $routingKey);
        $canal->close();
        $conexion->close();
    }
}