<?php

namespace Tests\Feature;

use App\Infraestructura\Persistencia\Modelos\CategoriaProductoModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_crea_categoria_y_producto_visible_en_catalogo(): void
    {
        $categoria = $this->postJson('/api/ventas/categorias', [
            'nombre' => 'Donas',
            'descripcion' => 'Donas artesanales.',
        ])->assertCreated()->json('categoria');

        $producto = $this->postJson('/api/ventas/productos', [
            'nombre' => 'Dona Glaseada',
            'descripcion' => 'Glaseado tradicional.',
            'categoria_id' => $categoria['id'],
            'precio' => 4.5,
            'activo' => true,
        ])->assertCreated()->json('producto');

        $this->getJson('/api/ventas/productos')
            ->assertOk()
            ->assertJsonPath('productos.0.id', $producto['id'])
            ->assertJsonPath('productos.0.categoria.slug', 'donas');
    }

    public function test_actualiza_y_desactiva_producto(): void
    {
        $categoria = CategoriaProductoModel::create([
            'nombre' => 'Donas', 'slug' => 'donas', 'descripcion' => null, 'activa' => true,
        ]);
        $producto = $this->postJson('/api/ventas/productos', [
            'nombre' => 'Dona Simple', 'categoria_id' => $categoria->id, 'precio' => 3,
        ])->assertCreated()->json('producto');

        $this->putJson('/api/ventas/productos/' . $producto['id'], ['precio' => 4])
            ->assertOk()->assertJsonPath('producto.precio', 4);
        $this->deleteJson('/api/ventas/productos/' . $producto['id'])->assertOk();
        $this->getJson('/api/ventas/productos')->assertJsonCount(0, 'productos');
        $this->getJson('/api/ventas/productos?incluir_inactivos=1')->assertJsonCount(1, 'productos');
    }

    public function test_no_elimina_categoria_con_productos_activos(): void
    {
        $categoria = CategoriaProductoModel::create([
            'nombre' => 'Donas', 'slug' => 'donas', 'descripcion' => null, 'activa' => true,
        ]);
        $this->postJson('/api/ventas/productos', [
            'nombre' => 'Dona Simple', 'categoria_id' => $categoria->id, 'precio' => 3,
        ])->assertCreated();

        $this->deleteJson('/api/ventas/categorias/' . $categoria->id)->assertStatus(409);
    }
}
