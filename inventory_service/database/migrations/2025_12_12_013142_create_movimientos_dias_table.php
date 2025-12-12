<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('movimientos_dias', function (Blueprint $table) {
            $table->id('id_movimientos');
            $table->foreignId('id_apertura')->constrained('aperturas', 'id_apertura');
            $table->decimal('ingresos', 10, 2)->default(0);
            $table->decimal('egresos', 10, 2)->default(0);
            $table->decimal('efectivo', 10, 2)->default(0);
            $table->decimal('saldo_total', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos_dias');
    }
};
