<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id('id_categoria'); // Clave primaria
            $table->string('nombre')->nullable();
            $table->bigInteger('cantidad')->nullable(); // Sugerencia: Esto suele ser calculado, no guardado, pero lo dejo como en tu diagrama
            $table->boolean('estado')->default(true); // Asumo true por defecto
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
