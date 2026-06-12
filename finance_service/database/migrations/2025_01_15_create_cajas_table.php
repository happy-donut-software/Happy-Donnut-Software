<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Crea la tabla 'cajas' para almacenar las cajas de vendedores.
     * La tabla mapea la entidad de dominio Caja a la base de datos.
     *
     * Estructura:
     * - id: UUID como clave primaria
     * - vendedor_id: Identificador del vendedor
     * - monto_apertura: Monto inicial en PEN (2 decimales)
     * - monto_actual: Monto actual acumulado en PEN (2 decimales)
     * - estado: 'abierta' o 'cerrada'
     * - monto_cierre_real: Monto contado físicamente al cerrar (nullable)
     * - diferencia: Diferencia al cerrar (nullable)
     * - fecha_apertura: Timestamp de apertura
     * - fecha_cierre: Timestamp de cierre (nullable)
     * - timestamps: created_at, updated_at para auditoría
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('cajas', function (Blueprint $table) {
            // Identificadores
            $table->uuid('id')->primary();
            $table->string('vendedor_id', 100);

            // Montos en PEN con precisión de 2 decimales
            $table->decimal('monto_apertura', 10, 2);
            $table->decimal('monto_actual', 10, 2);

            // Información de estado
            $table->enum('estado', ['abierta', 'cerrada'])->default('abierta');

            // Información de cierre (opcional)
            $table->decimal('monto_cierre_real', 10, 2)->nullable();
            $table->decimal('diferencia', 10, 2)->nullable();
            $table->timestamp('fecha_apertura')->useCurrent();
            $table->timestamp('fecha_cierre')->nullable();

            // Auditoría
            $table->timestamps();

            // Índices para búsquedas comunes
            $table->index('vendedor_id');
            $table->index('estado');
            $table->index('fecha_apertura');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Elimina la tabla 'cajas'.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('cajas');
    }
};
