<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notas_inventario', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['entrada', 'salida']);
            $table->dateTime('fecha')->default(now());
            $table->text('descripcion')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_inventario');
    }
};
