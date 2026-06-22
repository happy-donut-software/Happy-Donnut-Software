<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla de la Raíz del Agregado (El Turno de Caja general)
        Schema::create('turnos_caja', function (Blueprint $table) {
            $table->string('id')->primary(); // Ej: turno_64a...
            $table->string('cajero_id');
            $table->decimal('monto_apertura', 10, 2);
            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_cierre')->nullable();
            $table->string('estado'); // abierto, cerrado
            $table->timestamps();
        });

        // 2. Tabla de Entidades Hijas (Los movimientos individuales de dinero)
        Schema::create('movimientos_caja', function (Blueprint $table) {
            $table->string('id')->primary(); // Ej: mov_78b...
            $table->string('turno_caja_id'); // Llave foránea exacta a tu Repositorio
            $table->decimal('monto', 10, 2);
            $table->string('tipo'); // venta, apertura, faltante_arqueo, etc.
            $table->timestamp('fecha_hora');
            $table->text('descripcion')->nullable();
            $table->timestamps();

            // Relación estricta: Si se borra un turno (por error o limpieza), se borran sus movimientos
            $table->foreign('turno_caja_id')
                  ->references('id')
                  ->on('turnos_caja')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // Importante: Eliminar primero las hijas y luego los padres
        Schema::dropIfExists('movimientos_caja');
        Schema::dropIfExists('turnos_caja');
    }
};