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
        Schema::create('cierres', function (Blueprint $table) {
            $table->id('id_cierre');
            $table->foreignId('id_movimiento')->constrained('movimientos_dias', 'id_movimientos');
            $table->decimal('arqueo', 10, 2);
            $table->text('observaciones')->nullable();
            $table->decimal('efectivo_contado', 10, 2);
            $table->decimal('yape', 10, 2)->default(0);
            $table->decimal('plin', 10, 2)->default(0);
            $table->decimal('total_contado', 10, 2);
            $table->datetime('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cierres');
    }
};
