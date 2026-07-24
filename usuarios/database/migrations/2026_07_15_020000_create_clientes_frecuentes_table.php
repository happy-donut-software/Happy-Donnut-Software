<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('clientes_frecuentes',function(Blueprint $table){$table->string('id')->primary();$table->string('nombre')->index();$table->string('telefono')->index();$table->string('direccion')->nullable();$table->timestamps();}); } public function down(): void { Schema::dropIfExists('clientes_frecuentes'); } };