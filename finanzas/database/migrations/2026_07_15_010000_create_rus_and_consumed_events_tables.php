<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('acumulados_rus', function (Blueprint $table) {
            $table->string('periodo')->primary(); $table->decimal('total', 12, 2)->default(0);
            $table->decimal('limite', 12, 2)->default(5000); $table->string('estado')->default('NORMAL'); $table->timestamps();
        });
        Schema::create('eventos_consumidos', function (Blueprint $table) {
            $table->string('id')->primary(); $table->timestamp('procesado_en'); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('eventos_consumidos'); Schema::dropIfExists('acumulados_rus'); }
};