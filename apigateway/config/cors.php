<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'], // Asegúrate de incluir la ruta de la cookie
    'allowed_methods' => ['*'],
    
    // CAMBIO AQUÍ: Quita '*' y pon tu dominio real
    'allowed_origins' => [
        'http://localhost:3000', 
        'https://happydonut.online', 
        'https://www.happydonut.online'
    ],
    
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Esto obliga a no usar '*' arriba
];