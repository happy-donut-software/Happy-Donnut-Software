<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones (Crea las tablas).
     */
    public function up(): void
    {
        Schema::create('ordenes_venta', function (Blueprint $table) {
            $table->string('id')->primary(); 
            $table->string('cliente_id')->nullable(); // ✓ Cambiado a nullable para ventas rápidas de mostrador
            $table->string('tipo_comprobante')->default('NOTA_PEDIDO'); // BOLETA, NOTA_PEDIDO
            $table->timestamp('fecha_creacion');
            $table->string('estado'); // pendiente, pagada, cancelada
            $table->decimal('total', 10, 2);
            $table->decimal('monto_recibido', 10, 2)->nullable(); // Para el cálculo del vuelto
            $table->decimal('vuelto', 10, 2)->nullable(); // Para el cálculo del vuelto
            $table->string('metodo_pago')->nullable(); // EFECTIVO, YAPE, PLIN
            $table->timestamps();
        });

        // 2. Tabla de las Entidades Hijas (Los ítems comprados en la orden)
        Schema::create('lineas_orden', function (Blueprint $table) {
            // Usamos string() porque generamos IDs con uniqid('lin_')
            $table->string('id')->primary(); 
            
            $table->string('orden_venta_id'); // Llave Foránea hacia la tabla madre
            $table->string('producto_id');
            $table->string('nombre_producto');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            
            $table->timestamps();

            // Relación estricta a nivel de Base de Datos: 
            // Si borras una orden_venta, se borran sus líneas automáticamente.
            $table->foreign('orden_venta_id')
                  ->references('id')
                  ->on('ordenes_venta')
                  ->onDelete('cascade');
        });
    }

    /**
     * Revierte las migraciones (Elimina las tablas).
     */
    public function down(): void
    {
        // El orden es CRÍTICO: Primero borramos las hijas (lineas), luego la madre (ordenes)
        // para no violar las reglas de las llaves foráneas.
        Schema::dropIfExists('lineas_orden');
        Schema::dropIfExists('ordenes_venta');
    }
};