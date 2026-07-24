<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('productos_venta',function(Blueprint $table){$table->string('id')->primary();$table->string('nombre');$table->decimal('precio',10,2);$table->boolean('activo')->default(true);$table->timestamps();}); } public function down(): void { Schema::dropIfExists('productos_venta'); } };