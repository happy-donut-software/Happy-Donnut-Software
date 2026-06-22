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
        // 1. Tabla de la Raíz del Agregado (Orden Principal)
        Schema::create('ordenes_venta', function (Blueprint $table) {
            // Usamos string() porque generamos IDs con uniqid('ord_') en el Caso de Uso
            $table->string('id')->primary(); 
            
            $table->string('cliente_id');
            $table->timestamp('fecha_creacion');
            $table->string('estado'); // pendiente, pagada, cancelada, etc.
            $table->decimal('total', 10, 2); // Decimal para dinero (ej: 999999.99)
            
            $table->timestamps(); // Genera created_at y updated_at
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