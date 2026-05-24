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
        Schema::create('historial_cierres', function (Blueprint $table) {
            $table->id('id_historial_cierre');
            $table->foreignId('id_cierre')->constrained('cierres', 'id_cierre');
            $table->decimal('total_cierre', 10, 2);
            $table->boolean('cuadrado')->default(false);
            $table->decimal('sobrante', 10, 2)->default(0);
            $table->decimal('faltante', 10, 2)->default(0);
            $table->datetime('fecha');
            $table->string('responsable');
            $table->decimal('fondo_inicial', 10, 2)->default(0);
            $table->decimal('total_ingresos', 10, 2)->default(0);
            $table->decimal('total_egresos', 10, 2)->default(0);
            $table->decimal('esperado', 10, 2)->default(0);
            $table->decimal('contado', 10, 2)->default(0);
            $table->decimal('diferencia', 10, 2)->default(0);
            $table->text('acciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_cierres');
    }
};
