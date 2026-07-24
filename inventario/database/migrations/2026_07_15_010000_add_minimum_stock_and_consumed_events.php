<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('productos_inventario', fn (Blueprint $table) => $table->unsignedInteger('stock_minimo')->default(0));
        Schema::create('eventos_consumidos', function (Blueprint $table) { $table->string('id')->primary(); $table->timestamp('procesado_en'); $table->timestamps(); });
    }
    public function down(): void { Schema::dropIfExists('eventos_consumidos'); Schema::table('productos_inventario', fn (Blueprint $table) => $table->dropColumn('stock_minimo')); }
};