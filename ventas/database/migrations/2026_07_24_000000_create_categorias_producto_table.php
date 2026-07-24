<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias_producto', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('slug')->unique();
            $table->text('descripcion')->nullable();
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        Schema::table('productos_venta', function (Blueprint $table): void {
            $table->foreignId('categoria_id')->nullable()->after('nombre')->constrained('categorias_producto')->nullOnDelete();
            $table->text('descripcion')->nullable()->after('categoria_id');
            $table->string('imagen_url')->nullable()->after('precio');
        });
    }

    public function down(): void
    {
        Schema::table('productos_venta', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('categoria_id');
            $table->dropColumn(['descripcion', 'imagen_url']);
        });
        Schema::dropIfExists('categorias_producto');
    }
};
