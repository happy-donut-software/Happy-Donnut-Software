<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla para la Raíz del Agregado de Inventario
        Schema::create('productos_inventario', function (Blueprint $table) {
            // Usamos string porque nuestros IDs (si recuerdas) serán alfanuméricos como "prod_donachoco"
            $table->string('id')->primary(); 
            
            $table->string('nombre');
            
            // El stock debe coincidir con nuestro Objeto de Valor (integer, no puede ser negativo)
            $table->integer('stock_disponible')->default(0); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos_inventario');
    }
};