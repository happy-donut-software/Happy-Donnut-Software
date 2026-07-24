<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos_dominio', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nombre');
            $table->string('agregado_id')->index();
            $table->json('payload');
            $table->timestamp('ocurrido_en');
            $table->timestamp('publicado_en')->nullable()->index();
            $table->unsignedInteger('intentos')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos_dominio');
    }
};