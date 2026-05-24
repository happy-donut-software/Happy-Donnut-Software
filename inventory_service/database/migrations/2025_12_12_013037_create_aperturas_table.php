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
        Schema::create('aperturas', function (Blueprint $table) {
            $table->id('id_apertura');
            $table->decimal('fondo_inicial', 10, 2);
            $table->string('responsable_caja');
            $table->text('observaciones')->nullable();
            $table->date('fecha');
            $table->time('hora');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aperturas');
    }
};
