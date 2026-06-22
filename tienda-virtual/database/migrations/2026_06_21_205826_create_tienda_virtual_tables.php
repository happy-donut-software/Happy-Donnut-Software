<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla de la Raíz del Agregado (El carrito)
        Schema::create('carritos_compras', function (Blueprint $table) {
            $table->string('id')->primary(); // Ej: cart_12345
            $table->string('cliente_id');
            $table->decimal('total_estimado', 10, 2)->default(0);
            $table->timestamps();
        });

        // 2. Tabla de las Entidades Hijas (Los productos dentro del carrito)
        Schema::create('items_carrito', function (Blueprint $table) {
            $table->id(); // ID incremental básico
            $table->string('carrito_id'); // Llave foránea
            $table->string('producto_id');
            $table->string('nombre_producto');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->timestamps();

            // Relación: Si la sesión del carrito se borra, sus ítems también
            $table->foreign('carrito_id')
                  ->references('id')
                  ->on('carritos_compras')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items_carrito');
        Schema::dropIfExists('carritos_compras');
    }
};