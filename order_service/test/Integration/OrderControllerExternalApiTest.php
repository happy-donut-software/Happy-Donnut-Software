<?php

use Illuminate\Support\Facades\Http;

it('returns available products from product service', function () {
    Http::fake([
        'http://product-service:8001/api/v1/products' => Http::response([
            ['id' => 1, 'nombre' => 'Donut', 'precio' => 10.0],
        ], 200),
    ]);

    $response = $this->getJson('/api/v1/products/available');

    $response->assertOk();
    $response->assertJsonCount(1);
    $response->assertJsonFragment(['nombre' => 'Donut']);
});

it('returns categories from product service', function () {
    Http::fake([
        'http://product-service:8001/api/v1/categories' => Http::response([
            ['id' => 5, 'nombre' => 'Bebidas'],
        ], 200),
    ]);

    $response = $this->getJson('/api/v1/categories');

    $response->assertOk();
    $response->assertJsonFragment(['nombre' => 'Bebidas']);
});
