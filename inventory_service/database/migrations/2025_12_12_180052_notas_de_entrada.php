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
        Schema::create('notas_de_entradas', function (Blueprint $table) {
            $table->id('id_nota_entrada');
            $table->integer('numero_nota')->nullable();
            $table->date('fecha')->nullable();
            $table->text('motivo')->nullable();
            $table->text('doc_referencia')->nullable();
            
            // Datos desnormalizados (guardan el nombre en texto, no por ID según tu diagrama)
            $table->string('nombre_producto')->nullable();
            $table->integer('cantidad_producto')->nullable(); // Corregido typo 'catidad'
            
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
