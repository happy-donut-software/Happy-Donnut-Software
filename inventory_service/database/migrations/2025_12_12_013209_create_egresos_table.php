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
        Schema::create('egresos', function (Blueprint $table) {
            $table->id('id_egreso');
            $table->foreignId('id_movimiento')->nullable()->constrained('movimientos_dias', 'id_movimientos');
            $table->foreignId('id_insumo')->nullable()->constrained('insumos', 'id_insumo');
            $table->date('fecha');
            $table->time('hora');
            $table->decimal('monto_egreso', 10, 2);
            $table->string('descripcion')->nullable();
            $table->string('categoria_gasto');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('egresos');
    }
};
