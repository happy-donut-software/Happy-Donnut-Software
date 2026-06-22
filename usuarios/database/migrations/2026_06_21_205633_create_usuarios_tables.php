<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            // Usamos string() porque generamos IDs con uniqid('usr_')
            $table->string('id')->primary(); 
            
            $table->string('nombre');
            
            // El correo es único en todo el sistema
            $table->string('correo')->unique();
            
            $table->string('password'); // Aquí guardaremos el Hash seguro
            $table->string('rol'); // admin, cajero, cliente
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};