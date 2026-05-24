<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdministrativoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear persona para el administrador
        DB::table('personas')->insert([
            'persona_id' => 999,
            'nombre' => 'Admin',
            'apellido' => 'Sistema',
            'dni' => '12345678',
            'telefono' => '999999999',
            'email' => 'admin@happydonuts.com',
            'estado' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        $personaId = 999;

        // Crear administrativo
        DB::table('administrativos')->insert([
            'administrativo_id' => 999,
            'persona_id' => $personaId,
            'nombre' => 'Admin',
            'apellido' => 'Sistema',
            'dni' => '12345678',
            'telefono' => '999999999',
            'email' => 'admin@happydonuts.com',
            'password' => Hash::make('admin123'),
            'user_code' => 'ADMIN001',
            'estado' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear usuario para login
        DB::table('usuarios')->insert([
            'usuario_id' => 999,
            'persona_id' => $personaId,
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'role' => 'administrador',
            'estado' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Administrador predefinido creado exitosamente:');
        $this->command->info('Usuario: admin');
        $this->command->info('Contraseña: admin123');
        $this->command->info('Rol: administrador');
    }
}
