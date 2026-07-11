<?php

return [
    'rabbitmq' => [
        'host' => env('RABBITMQ_HOST', 'rabbitmq'),
        'port' => env('RABBITMQ_PORT', 5672),
        'user' => env('RABBITMQ_USER', 'guest'),
        'password' => env('RABBITMQ_PASS', 'guest'),
        'exchange' => env('RABBITMQ_EXCHANGE', 'happydonut.events'),
        'queue' => env('RABBITMQ_QUEUE_INVENTARIO', 'inventario.orden.pagada'),
        'routing_key' => env('RABBITMQ_ROUTING_KEY_ORDEN_PAGADA', 'ventas.orden.pagada'),
    ],
];