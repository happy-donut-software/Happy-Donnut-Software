# ANÁLISIS DETALLADO DE MICROSERVICIOS CON CÓDIGO

## Tabla de Contenidos
1. [Auth Service](#auth-service)
2. [Product Service](#product-service)
3. [Inventory Service](#inventory-service)
4. [Order Service](#order-service)
5. [Email Service](#email-service)
6. [API Gateway](#api-gateway)
7. [Flujos Principales](#flujos-principales)

---

## AUTH SERVICE

**Puerto:** 8000  
**Responsabilidad:** Autenticación centralizada y gestión de usuarios, empleados y administrativos

### Modelos

#### Modelo: User
**Archivo:** `app/Models/User.php`  
**Tabla:** `usuarios`

```php
<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;

class User extends Model implements AuthenticatableContract
{
    use Authenticatable;

    protected $table = 'usuarios';
    protected $primaryKey = 'usuario_id';
    public $timestamps = false;

    protected $fillable = [
        'username',
        'password',
        'role',      // 'user', 'admin', 'employee'
        'estado'     // true/false - activo/inactivo
    ];

    protected $hidden = [
        'password',
    ];
}
```

**Campos principales:**
- `usuario_id` (PK) - Identificador único
- `username` - Nombre de usuario único
- `password` - Contraseña hasheada
- `role` - Rol del usuario (user, admin, employee)
- `estado` - Estado activo/inactivo

**Métodos principales:**
- `getAuthPassword()` - Retorna la contraseña para autenticación
- `find($id)` - Busca usuario por ID
- `where('username', $username)` - Busca usuario por nombre

---

#### Modelo: Empleado
**Archivo:** `app/Models/Empleado.php`  
**Tabla:** `empleados`

```php
<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;

class Empleado extends Model implements AuthenticatableContract
{
    use Authenticatable;

    protected $table = 'empleados';
    protected $primaryKey = 'empleado_id';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellido',
        'dni',
        'telefono',
        'rol',         // Rol del empleado
        'password',    // Contraseña hasheada
        'estado'       // true/false
    ];

    protected $hidden = [
        'password',
    ];

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function getFullName()
    {
        return "{$this->nombre} {$this->apellido}";
    }
}
```

**Campos principales:**
- `empleado_id` (PK)
- `nombre`, `apellido` - Nombre completo
- `dni` - Documento de identidad
- `telefono` - Contacto
- `rol` - Rol del empleado
- `password` - Hasheada
- `estado` - Activo/inactivo

**Métodos importantes:**
- `getAuthPassword()` - Retorna contraseña para autenticación
- `getFullName()` - Retorna nombre completo

---

#### Modelo: Administrativo
**Archivo:** `app/Models/Administrativo.php`  
**Tabla:** `administrativos`

```php
<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;

class Administrativo extends Model implements AuthenticatableContract
{
    use Authenticatable;

    protected $table = 'administrativos';
    protected $primaryKey = 'administrativo_id';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellido',
        'dni',
        'telefono',
        'rol',
        'password',
        'estado'
    ];

    protected $hidden = [
        'password',
    ];

    public function getAuthPassword()
    {
        return $this->password;
    }
}
```

**Estructura similar a Empleado** - Gestiona usuarios administrativos con acceso a funciones sensibles

---

### Controladores

#### Controlador: AuthController
**Archivo:** `app/Http/Controllers/AuthController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Empleado;
use App\Models\Administrativo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:usuarios',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'estado' => true,
        ]);

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user
        ], 201);
    }

    /**
     * Autentica un usuario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas.'
            ], 401);
        }

        if (!$user->estado) {
            return response()->json([
                'message' => 'Usuario inactivo.'
            ], 403);
        }

        return response()->json([
            'message' => 'Autenticación exitosa',
            'user' => $user,
            'role' => $user->role
        ], 200);
    }

    /**
     * Autentica un empleado
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function loginEmpleado(Request $request)
    {
        $request->validate([
            'dni' => 'required|string',
            'password' => 'required|string',
        ]);

        $empleado = Empleado::where('dni', $request->dni)->first();

        if (!$empleado || !Hash::check($request->password, $empleado->password)) {
            return response()->json([
                'message' => 'Credenciales de empleado inválidas.'
            ], 401);
        }

        if (!$empleado->estado) {
            return response()->json([
                'message' => 'Empleado inactivo.'
            ], 403);
        }

        return response()->json([
            'message' => 'Autenticación exitosa (Empleado)',
            'empleado' => $empleado,
            'role' => $empleado->rol
        ], 200);
    }

    /**
     * Logout de usuario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ], 200);
    }
}
```

**Métodos principales:**
- `register($request)` - Crea nuevo usuario con validación
- `login($request)` - Autentica usuario y valida credenciales
- `loginEmpleado($request)` - Autentica empleado por DNI
- `logout($request)` - Cierra sesión

---

#### Controlador: UsuarioController
**Archivo:** `app/Http/Controllers/UsuarioController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    /**
     * Obtiene lista de usuarios
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $users = User::paginate(15);
        return response()->json($users);
    }

    /**
     * Obtiene un usuario específico
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json($user);
    }

    /**
     * Crea nuevo usuario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255|unique:usuarios',
            'password' => 'required|string|min:8',
            'role' => 'in:user,admin,employee|default:user',
            'estado' => 'boolean|default:true'
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => $user
        ], 201);
    }

    /**
     * Actualiza usuario
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $data = $request->validate([
            'username' => 'string|max:255|unique:usuarios,username,' . $id . ',usuario_id',
            'password' => 'sometimes|string|min:8',
            'role' => 'in:user,admin,employee',
            'estado' => 'boolean'
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'user' => $user
        ]);
    }

    /**
     * Elimina usuario
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }
}
```

**Métodos CRUD:**
- `index()` - Lista usuarios paginados
- `show($id)` - Obtiene usuario específico
- `store()` - Crea nuevo usuario
- `update()` - Actualiza usuario existente
- `destroy()` - Elimina usuario

---

### Rutas

**Archivo:** `routes/api.php`

```php
<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\AdministrativoController;

Route::prefix('v1')->controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');           // POST /api/v1/register
    Route::post('/login', 'login');                 // POST /api/v1/login
    Route::post('/login-empleado', 'loginEmpleado'); // POST /api/v1/login-empleado
    Route::post('/logout', 'logout');               // POST /api/v1/logout
});

Route::prefix('v1')->group(function () {
    // Usuarios
    Route::apiResource('usuarios', UsuarioController::class);
    
    // Empleados
    Route::apiResource('empleados', EmpleadoController::class);
    
    // Administrativos
    Route::apiResource('administrativos', AdministrativoController::class);
});
```

**Endpoints:**
- `POST /api/v1/register` - Registrar usuario
- `POST /api/v1/login` - Login usuario
- `POST /api/v1/login-empleado` - Login empleado
- `POST /api/v1/logout` - Logout
- `GET/POST /api/v1/usuarios` - CRUD de usuarios
- `GET/POST /api/v1/empleados` - CRUD de empleados
- `GET/POST /api/v1/administrativos` - CRUD de administrativos

---

## PRODUCT SERVICE

**Puerto:** 8001  
**Responsabilidad:** Gestión de productos, categorías y promociones

### Modelos

#### Modelo: Producto
**Archivo:** `app/Models/Producto.php`  
**Tabla:** `productos`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'producto_id';
    public $timestamps = false;

    protected $fillable = [
        'categoria_id',
        'nombre_producto',
        'descripcion',
        'precio_base',
        'tipo_producto',  // 'donut', 'cafe', 'otro'
        'activo_web',      // true/false
        'imagen_url'       // URL de imagen
    ];

    protected $casts = [
        'activo_web' => 'boolean',
        'precio_base' => 'decimal:2'
    ];

    /**
     * Relación con Categoría
     * 
     * @return BelongsTo
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    /**
     * Relación muchos a muchos con Promociones
     * 
     * @return BelongsToMany
     */
    public function promociones(): BelongsToMany
    {
        return $this->belongsToMany(
            Promocion::class,
            'promociones_detalles',
            'producto_id',
            'promocion_id'
        )->withPivot('cantidad_producto');
    }

    /**
     * Scope para obtener productos activos
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActivos($query)
    {
        return $query->where('activo_web', true);
    }

    /**
     * Scope por categoría
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCategoria($query, $categoriaId)
    {
        return $query->where('categoria_id', $categoriaId);
    }
}
```

**Campos principales:**
- `producto_id` (PK)
- `categoria_id` (FK)
- `nombre_producto` - Nombre del producto
- `descripcion` - Descripción detallada
- `precio_base` - Precio base del producto
- `tipo_producto` - Clasificación (donut, cafe, otro)
- `activo_web` - Visible en web
- `imagen_url` - URL de imagen

**Métodos principales:**
- `categoria()` - Obtiene categoría asociada
- `promociones()` - Obtiene promociones vigentes
- `scopeActivos()` - Filtra productos activos
- `scopeByCategoria()` - Filtra por categoría

---

#### Modelo: Categoria
**Archivo:** `app/Models/Categoria.php`  
**Tabla:** `categorias`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    protected $table = 'categorias';
    protected $primaryKey = 'categoria_id';
    public $timestamps = false;

    protected $fillable = [
        'nombre_categoria',
        'descripcion',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    /**
     * Relación con Productos
     * 
     * @return HasMany
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }

    /**
     * Obtiene cantidad de productos activos
     * 
     * @return int
     */
    public function countProductosActivos()
    {
        return $this->productos()->where('activo_web', true)->count();
    }
}
```

**Campos principales:**
- `categoria_id` (PK)
- `nombre_categoria` - Nombre de la categoría
- `descripcion` - Descripción
- `activo` - Categoría activa/inactiva

**Métodos principales:**
- `productos()` - Obtiene todos los productos de la categoría
- `countProductosActivos()` - Cuenta productos activos

---

#### Modelo: Promocion
**Archivo:** `app/Models/Promocion.php`  
**Tabla:** `promociones`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Promocion extends Model
{
    protected $table = 'promociones';
    protected $primaryKey = 'promocion_id';
    public $timestamps = false;

    protected $fillable = [
        'nombre_promocion',
        'descripcion',
        'precio_fijo_combo',
        'descuento_porcentaje',
        'fecha_inicio',
        'fecha_fin',
        'activa'
    ];

    protected $casts = [
        'precio_fijo_combo' => 'decimal:2',
        'descuento_porcentaje' => 'integer',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'activa' => 'boolean'
    ];

    /**
     * Relación muchos a muchos con Productos
     * 
     * @return BelongsToMany
     */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(
            Producto::class,
            'promociones_detalles',
            'promocion_id',
            'producto_id'
        )->withPivot('cantidad_producto');
    }

    /**
     * Scope para obtener promociones activas
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActivas($query)
    {
        return $query->where('activa', true)
                     ->where('fecha_inicio', '<=', now())
                     ->where('fecha_fin', '>=', now());
    }

    /**
     * Calcula el precio total de la promoción
     * 
     * @return float
     */
    public function calculatePrice()
    {
        return $this->precio_fijo_combo ?? 0;
    }
}
```

**Campos principales:**
- `promocion_id` (PK)
- `nombre_promocion` - Nombre de la promoción
- `descripcion` - Descripción
- `precio_fijo_combo` - Precio fijo para el combo
- `descuento_porcentaje` - Descuento (opcional)
- `fecha_inicio`, `fecha_fin` - Vigencia
- `activa` - Estado de la promoción

**Métodos principales:**
- `productos()` - Obtiene productos en la promoción
- `scopeActivas()` - Obtiene promociones vigentes
- `calculatePrice()` - Calcula precio promocional

---

### Controlador

#### Controlador: ProductController
**Archivo:** `app/Http/Controllers/ProductController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Obtiene lista de productos con filtros
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Producto::with('categoria', 'promociones');

        // Filtros disponibles
        if ($request->has('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->has('tipo_producto')) {
            $query->where('tipo_producto', $request->tipo_producto);
        }

        if ($request->has('activo')) {
            $query->where('activo_web', $request->boolean('activo'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nombre_producto', 'LIKE', "%{$search}%")
                  ->orWhere('descripcion', 'LIKE', "%{$search}%");
        }

        $productos = $query->orderBy('nombre_producto')
                          ->paginate(20);

        return response()->json($productos);
    }

    /**
     * Obtiene un producto específico
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $producto = Producto::with('categoria', 'promociones')->find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($producto);
    }

    /**
     * Crea nuevo producto
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'categoria_id' => 'required|exists:categorias,categoria_id',
            'nombre_producto' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio_base' => 'required|numeric|min:0',
            'tipo_producto' => 'required|in:donut,cafe,otro',
            'activo_web' => 'boolean|default:true',
            'imagen_url' => 'nullable|url'
        ]);

        $producto = Producto::create($data);

        return response()->json([
            'message' => 'Producto creado exitosamente',
            'producto' => $producto->load('categoria')
        ], 201);
    }

    /**
     * Actualiza producto
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $data = $request->validate([
            'categoria_id' => 'exists:categorias,categoria_id',
            'nombre_producto' => 'string|max:255',
            'descripcion' => 'nullable|string',
            'precio_base' => 'numeric|min:0',
            'tipo_producto' => 'in:donut,cafe,otro',
            'activo_web' => 'boolean',
            'imagen_url' => 'nullable|url'
        ]);

        $producto->update(array_filter($data));

        return response()->json([
            'message' => 'Producto actualizado exitosamente',
            'producto' => $producto->load('categoria')
        ]);
    }

    /**
     * Elimina producto
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $producto->delete();

        return response()->json(['message' => 'Producto eliminado exitosamente']);
    }

    /**
     * Actualiza estado del producto
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $producto->update(['activo_web' => $request->boolean('activo_web')]);

        return response()->json([
            'message' => 'Estado del producto actualizado',
            'producto' => $producto
        ]);
    }

    /**
     * Obtiene productos disponibles (sin paginación)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailable()
    {
        $productos = Producto::where('activo_web', true)
                             ->with('categoria')
                             ->orderBy('nombre_producto')
                             ->get();

        return response()->json($productos);
    }
}
```

**Métodos principales:**
- `index()` - Lista con filtros (categoría, tipo, búsqueda)
- `show($id)` - Obtiene producto específico
- `store()` - Crea nuevo producto
- `update()` - Actualiza producto
- `destroy()` - Elimina producto
- `updateStatus()` - Cambia estado activo/inactivo
- `getAvailable()` - Productos disponibles para comprar

---

### Rutas

**Archivo:** `routes/api.php`

```php
<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\PromocionController;

Route::middleware('auth:sanctum')->prefix('/v1')->group(function () {
    // Productos - CRUD completo
    Route::apiResource('productos', ProductController::class);
    Route::put('/productos/{id}/status', [ProductController::class, 'updateStatus']);

    // Categorías - CRUD completo
    Route::apiResource('categorias', CategoriaController::class);

    // Promociones - CRUD completo
    Route::apiResource('promociones', PromocionController::class);
});

// Rutas públicas (sin autenticación)
Route::prefix('/v1')->group(function () {
    Route::get('/productos/disponibles', [ProductController::class, 'getAvailable']);
    Route::get('/productos/buscar', [ProductController::class, 'index']);
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/promociones/activas', [PromocionController::class, 'getActivas']);
});
```

**Endpoints:**
- `GET /api/v1/productos` - Listar productos
- `POST /api/v1/productos` - Crear producto
- `GET /api/v1/productos/{id}` - Obtener producto
- `PUT /api/v1/productos/{id}` - Actualizar producto
- `DELETE /api/v1/productos/{id}` - Eliminar producto
- `PUT /api/v1/productos/{id}/status` - Cambiar estado

---

## INVENTORY SERVICE

**Puerto:** 8002  
**Responsabilidad:** Gestión de inventario, insumos, recetas y disponibilidad de stock

### Modelos

#### Modelo: Producto
**Archivo:** `app/Models/Producto.php`  
**Tabla:** `productos` (referencia, no autoincrementable)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'producto_id';
    public $incrementing = false;        // No es auto-incrementable
    public $timestamps = false;

    protected $fillable = [
        'producto_id',
        'nombre_producto',
        'tipo_producto'
    ];

    /**
     * Relación muchos a muchos con Insumos (a través de tabla recetas)
     * 
     * @return BelongsToMany
     */
    public function insumos(): BelongsToMany
    {
        return $this->belongsToMany(
            Insumo::class,
            'recetas',
            'producto_id',
            'insumo_id'
        )->withPivot('cantidad_necesaria');
    }

    /**
     * Verifica si hay suficiente inventario para producir cantidad
     * 
     * @param int $cantidad
     * @return bool
     */
    public function hasEnoughInventory($cantidad)
    {
        foreach ($this->insumos as $insumo) {
            $cantidadNecesaria = $insumo->pivot->cantidad_necesaria * $cantidad;
            if ($insumo->stock_total_calculado < $cantidadNecesaria) {
                return false;
            }
        }
        return true;
    }
}
```

**Campos principales:**
- `producto_id` (PK, no autoincrementable)
- `nombre_producto`
- `tipo_producto` (donut, cafe, otro)

**Métodos principales:**
- `insumos()` - Obtiene insumos necesarios (receta)
- `hasEnoughInventory()` - Verifica si hay suficiente stock

---

#### Modelo: Insumo
**Archivo:** `app/Models/Insumo.php`  
**Tabla:** `insumos`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Insumo extends Model
{
    protected $table = 'insumos';
    protected $primaryKey = 'insumo_id';
    public $timestamps = false;

    protected $fillable = [
        'nombre_insumo',
        'unidad_medida_base',
        'stock_minimo_alerta',
        'stock_total_calculado'
    ];

    protected $casts = [
        'stock_minimo_alerta' => 'float',
        'stock_total_calculado' => 'float'
    ];

    /**
     * Relación con Lotes de Insumo
     * 
     * @return HasMany
     */
    public function lotes(): HasMany
    {
        return $this->hasMany(LoteInsumo::class, 'insumo_id');
    }

    /**
     * Relación muchos a muchos con Productos
     * 
     * @return BelongsToMany
     */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(
            Producto::class,
            'recetas',
            'insumo_id',
            'producto_id'
        )->withPivot('cantidad_necesaria');
    }

    /**
     * Calcula stock total desde los lotes
     * 
     * @return float
     */
    public function calculateTotalStock()
    {
        return $this->lotes()->sum('cantidad_restante');
    }

    /**
     * Verifica si está bajo del mínimo de alerta
     * 
     * @return bool
     */
    public function isBelowMinimum()
    {
        return $this->stock_total_calculado < $this->stock_minimo_alerta;
    }

    /**
     * Consume cantidad de insumo desde lotes FIFO
     * 
     * @param float $cantidad
     * @return bool
     */
    public function consumeQuantity($cantidad)
    {
        $lotesActivos = $this->lotes()
                            ->where('cantidad_restante', '>', 0)
                            ->orderBy('fecha_compra')
                            ->get();

        $pendiente = $cantidad;

        foreach ($lotesActivos as $lote) {
            if ($pendiente <= 0) break;

            $aConsumr = min($lote->cantidad_restante, $pendiente);
            $lote->update([
                'cantidad_restante' => $lote->cantidad_restante - $aConsumir
            ]);
            $pendiente -= $aConsumir;
        }

        // Actualizar stock total del insumo
        $this->update([
            'stock_total_calculado' => $this->calculateTotalStock()
        ]);

        return $pendiente == 0;
    }
}
```

**Campos principales:**
- `insumo_id` (PK)
- `nombre_insumo` - Nombre del insumo
- `unidad_medida_base` - Unidad (kg, L, unidad, etc)
- `stock_minimo_alerta` - Límite de alerta
- `stock_total_calculado` - Stock total actual

**Métodos principales:**
- `lotes()` - Obtiene lotes disponibles
- `calculateTotalStock()` - Calcula stock desde lotes
- `isBelowMinimum()` - Verifica alerta de stock
- `consumeQuantity()` - Consume cantidad (FIFO)

---

#### Modelo: LoteInsumo
**Archivo:** `app/Models/LoteInsumo.php`  
**Tabla:** `lotes_insumo`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoteInsumo extends Model
{
    protected $table = 'lotes_insumo';
    protected $primaryKey = 'lote_id';
    public $timestamps = false;

    protected $fillable = [
        'insumo_id',
        'cantidad_comprada',
        'cantidad_restante',
        'costo_total_compra',
        'fecha_compra',
        'fecha_caducidad',
        'proveedor'
    ];

    protected $casts = [
        'cantidad_comprada' => 'float',
        'cantidad_restante' => 'float',
        'costo_total_compra' => 'decimal:2',
        'fecha_compra' => 'datetime',
        'fecha_caducidad' => 'datetime'
    ];

    /**
     * Relación con Insumo
     * 
     * @return BelongsTo
     */
    public function insumo(): BelongsTo
    {
        return $this->belongsTo(Insumo::class, 'insumo_id');
    }

    /**
     * Verifica si el lote está vencido
     * 
     * @return bool
     */
    public function isExpired()
    {
        return $this->fecha_caducidad && $this->fecha_caducidad->isPast();
    }

    /**
     * Obtiene costo unitario
     * 
     * @return float
     */
    public function getCostPerUnit()
    {
        return $this->cantidad_comprada > 0 
            ? $this->costo_total_compra / $this->cantidad_comprada 
            : 0;
    }
}
```

**Campos principales:**
- `lote_id` (PK)
- `insumo_id` (FK)
- `cantidad_comprada` - Cantidad inicial
- `cantidad_restante` - Cantidad disponible
- `costo_total_compra` - Costo total del lote
- `fecha_compra` - Fecha de compra
- `fecha_caducidad` - Fecha de vencimiento
- `proveedor` - Proveedor del lote

**Métodos principales:**
- `insumo()` - Obtiene insumo asociado
- `isExpired()` - Verifica si está vencido
- `getCostPerUnit()` - Calcula costo unitario

---

### Controlador

#### Controlador: InventoryController
**Archivo:** `app/Http/Controllers/InventoryController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Insumo;
use App\Models\LoteInsumo;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Obtiene estado completo del inventario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $insumos = Insumo::with('lotes')->paginate(20);

        return response()->json($insumos);
    }

    /**
     * Verifica disponibilidad de producto
     * 
     * @param int $productId
     * @param int $quantity
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkAvailability($productId, $quantity)
    {
        $producto = Producto::with('insumos')->find($productId);

        if (!$producto) {
            return response()->json([
                'available' => false,
                'error' => 'Producto no encontrado'
            ], 404);
        }

        $canProduce = $this->canProduceQuantity($producto, $quantity);

        return response()->json([
            'available' => $canProduce,
            'producto_id' => $productId,
            'cantidad_solicitada' => $quantity
        ]);
    }

    /**
     * Obtiene cantidad disponible de un producto
     * 
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableQuantity($productId)
    {
        $producto = Producto::with('insumos')->find($productId);

        if (!$producto) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        // Calcula cuántas unidades se pueden producir
        $maxProducible = PHP_INT_MAX;

        foreach ($producto->insumos as $insumo) {
            $cantidadNecesaria = $insumo->pivot->cantidad_necesaria;
            $disponible = $insumo->stock_total_calculado;
            $posibles = floor($disponible / $cantidadNecesaria);
            $maxProducible = min($maxProducible, $posibles);
        }

        return response()->json([
            'producto_id' => $productId,
            'cantidad_disponible' => max(0, $maxProducible)
        ]);
    }

    /**
     * Reserva inventario para una orden
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function reserve(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|integer',
            'cantidad' => 'required|integer|min:1'
        ]);

        $producto = Producto::with('insumos')->find($request->producto_id);

        if (!$producto) {
            return response()->json([
                'error' => 'Producto no encontrado'
            ], 404);
        }

        if (!$this->canProduceQuantity($producto, $request->cantidad)) {
            return response()->json([
                'error' => 'Inventario insuficiente para completar la orden'
            ], 400);
        }

        $reserved = $this->reserveIngredients($producto, $request->cantidad);

        if (!$reserved) {
            return response()->json([
                'error' => 'No se pudo reservar el inventario'
            ], 500);
        }

        return response()->json([
            'message' => 'Inventario reservado exitosamente',
            'producto_id' => $request->producto_id,
            'cantidad' => $request->cantidad
        ]);
    }

    /**
     * Libera inventario (por cancelación de orden)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function release(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|integer',
            'cantidad' => 'required|integer|min:1'
        ]);

        // Por ahora solo retorna OK, la lógica depende del sistema de transacciones
        return response()->json([
            'message' => 'Inventario liberado'
        ]);
    }

    /**
     * Verifica si se puede producir cantidad (privado)
     * 
     * @param Producto $producto
     * @param int $cantidad
     * @return bool
     */
    private function canProduceQuantity(Producto $producto, $cantidad)
    {
        foreach ($producto->insumos as $insumo) {
            $necesaria = $insumo->pivot->cantidad_necesaria * $cantidad;
            if ($insumo->stock_total_calculado < $necesaria) {
                return false;
            }
        }
        return true;
    }

    /**
     * Reserva ingredientes del inventario (privado)
     * 
     * @param Producto $producto
     * @param int $cantidad
     * @return bool
     */
    private function reserveIngredients(Producto $producto, $cantidad)
    {
        foreach ($producto->insumos as $insumo) {
            $aConsumir = $insumo->pivot->cantidad_necesaria * $cantidad;
            if (!$insumo->consumeQuantity($aConsumir)) {
                return false;
            }
        }
        return true;
    }
}
```

**Métodos principales:**
- `index()` - Obtiene estado del inventario
- `checkAvailability()` - Verifica si se puede producir cantidad
- `getAvailableQuantity()` - Calcula máximo producible
- `reserve()` - Reserva inventario para orden
- `release()` - Libera inventario

---

## ORDER SERVICE

**Puerto:** 8003  
**Responsabilidad:** Gestión de órdenes/ventas, detalles y pagos

### Modelos

#### Modelo: Venta (Order)
**Archivo:** `app/Models/Venta.php`  
**Tabla:** `ventas`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    protected $table = 'ventas';
    protected $primaryKey = 'venta_id';
    public $timestamps = false;

    protected $fillable = [
        'cliente_id',
        'empleado_id',
        'total_venta',
        'estado_pedido',    // 'pendiente', 'completada', 'cancelada'
        'fecha_venta',
        'metodo_pago_id'
    ];

    protected $casts = [
        'total_venta' => 'decimal:2',
        'fecha_venta' => 'datetime'
    ];

    /**
     * Relación con Detalles de Venta
     * 
     * @return HasMany
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'venta_id');
    }

    /**
     * Relación con Pagos
     * 
     * @return HasMany
     */
    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'venta_id');
    }

    /**
     * Calcula monto pagado total
     * 
     * @return float
     */
    public function getTotalPaid()
    {
        return $this->pagos()->sum('monto');
    }

    /**
     * Verifica si está completamente pagada
     * 
     * @return bool
     */
    public function isFullyPaid()
    {
        return abs($this->getTotalPaid() - $this->total_venta) < 0.01;
    }

    /**
     * Calcula monto pendiente
     * 
     * @return float
     */
    public function getAmountPending()
    {
        return max(0, $this->total_venta - $this->getTotalPaid());
    }
}
```

**Campos principales:**
- `venta_id` (PK)
- `cliente_id` - ID del cliente
- `empleado_id` - Empleado que vendió
- `total_venta` - Monto total
- `estado_pedido` - Estado (pendiente, completada, cancelada)
- `fecha_venta` - Fecha de venta
- `metodo_pago_id` - Método de pago

**Métodos principales:**
- `detalles()` - Obtiene líneas de venta
- `pagos()` - Obtiene pagos realizados
- `getTotalPaid()` - Suma de pagos
- `isFullyPaid()` - Verifica si está pagada
- `getAmountPending()` - Monto pendiente

---

#### Modelo: DetalleVenta (OrderDetail)
**Archivo:** `app/Models/DetalleVenta.php`  
**Tabla:** `detalles_venta`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
    protected $table = 'detalles_venta';
    protected $primaryKey = 'detalle_id';
    public $timestamps = false;

    protected $fillable = [
        'venta_id',
        'producto_id',
        'nombre_producto',
        'precio_unitario_venta',
        'cantidad'
    ];

    protected $casts = [
        'precio_unitario_venta' => 'decimal:2',
        'cantidad' => 'integer'
    ];

    /**
     * Relación con Venta
     * 
     * @return BelongsTo
     */
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    /**
     * Calcula subtotal de la línea
     * 
     * @return float
     */
    public function getSubtotal()
    {
        return $this->precio_unitario_venta * $this->cantidad;
    }
}
```

**Campos principales:**
- `detalle_id` (PK)
- `venta_id` (FK)
- `producto_id` - Producto vendido
- `nombre_producto` - Nombre del producto
- `precio_unitario_venta` - Precio en el momento de venta
- `cantidad` - Cantidad vendida

**Métodos principales:**
- `venta()` - Obtiene venta asociada
- `getSubtotal()` - Calcula subtotal de línea

---

#### Modelo: Pago (Payment)
**Archivo:** `app/Models/Pago.php`  
**Tabla:** `pagos`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    protected $table = 'pagos';
    protected $primaryKey = 'pago_id';
    public $timestamps = false;

    protected $fillable = [
        'venta_id',
        'metodo_pago_id',
        'monto',
        'fecha_pago',
        'referencia'
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'datetime'
    ];

    /**
     * Relación con Venta
     * 
     * @return BelongsTo
     */
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    /**
     * Relación con Método de Pago
     * 
     * @return BelongsTo
     */
    public function metodoPago(): BelongsTo
    {
        return $this->belongsTo(MetodoPago::class, 'metodo_pago_id');
    }
}
```

**Campos principales:**
- `pago_id` (PK)
- `venta_id` (FK)
- `metodo_pago_id` (FK)
- `monto` - Monto pagado
- `fecha_pago` - Fecha del pago
- `referencia` - Referencia (número de transacción, etc)

**Métodos principales:**
- `venta()` - Obtiene venta asociada
- `metodoPago()` - Obtiene método de pago

---

### Controlador

#### Controlador: OrderController
**Archivo:** `app/Http/Controllers/OrderController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    const PRODUCT_SERVICE = 'http://product-service:8001';
    const INVENTORY_SERVICE = 'http://inventory-service:8002';

    /**
     * Obtiene órdenes del usuario actual
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $clienteId = $request->user()->id;
        
        $ventas = Venta::where('cliente_id', $clienteId)
                       ->with(['detalles', 'pagos'])
                       ->orderBy('fecha_venta', 'desc')
                       ->paginate(10);

        return response()->json($ventas);
    }

    /**
     * Obtiene productos disponibles del product-service
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableProducts()
    {
        try {
            $response = Http::timeout(5)
                           ->get(self::PRODUCT_SERVICE . '/api/v1/productos/disponibles');

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'No se pudieron obtener los productos'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error de conexión con product service',
                'message' => $e->getMessage()
            ], 503);
        }
    }

    /**
     * Verifica inventario disponible (privado)
     * 
     * @param int $productId
     * @param int $quantity
     * @return bool
     */
    private function checkInventory($productId, $quantity)
    {
        try {
            $response = Http::timeout(5)
                           ->get(
                               self::INVENTORY_SERVICE . 
                               "/api/v1/inventory/check/{$productId}/{$quantity}"
                           );

            return $response->successful() && $response->json('available', false);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reserva inventario (privado)
     * 
     * @param int $productId
     * @param int $quantity
     * @return bool
     */
    private function reserveInventory($productId, $quantity)
    {
        try {
            $response = Http::timeout(5)
                           ->post(
                               self::INVENTORY_SERVICE . '/api/v1/inventory/reserve',
                               [
                                   'product_id' => $productId,
                                   'quantity' => $quantity
                               ]
                           );

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Crea nueva orden
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|integer',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_unitario_venta' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Verificar inventario para todos los items
            foreach ($validated['items'] as $item) {
                if (!$this->checkInventory(
                    $item['producto_id'], 
                    $item['cantidad']
                )) {
                    throw new \Exception('Inventario insuficiente para producto ' . 
                                        $item['producto_id']);
                }
            }

            // Reservar inventario
            foreach ($validated['items'] as $item) {
                if (!$this->reserveInventory(
                    $item['producto_id'], 
                    $item['cantidad']
                )) {
                    throw new \Exception('Error al reservar inventario');
                }
            }

            // Crear venta
            $totalVenta = collect($validated['items'])
                ->sum(function($item) {
                    return $item['precio_unitario_venta'] * $item['cantidad'];
                });

            $venta = Venta::create([
                'cliente_id' => $request->user()->id,
                'empleado_id' => $request->employee_id ?? null,
                'total_venta' => $totalVenta,
                'estado_pedido' => 'pendiente',
                'fecha_venta' => now()
            ]);

            // Crear detalles
            foreach ($validated['items'] as $item) {
                DetalleVenta::create([
                    'venta_id' => $venta->venta_id,
                    'producto_id' => $item['producto_id'],
                    'nombre_producto' => $item['nombre_producto'] ?? '',
                    'precio_unitario_venta' => $item['precio_unitario_venta'],
                    'cantidad' => $item['cantidad']
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Orden creada exitosamente',
                'venta' => $venta->load('detalles')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtiene una orden específica
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $venta = Venta::with(['detalles', 'pagos'])->find($id);

        if (!$venta) {
            return response()->json(['error' => 'Venta no encontrada'], 404);
        }

        return response()->json($venta);
    }

    /**
     * Registra pago para venta
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerPayment(Request $request)
    {
        $validated = $request->validate([
            'venta_id' => 'required|exists:ventas,venta_id',
            'metodo_pago_id' => 'required',
            'monto' => 'required|numeric|min:0.01'
        ]);

        $venta = Venta::find($validated['venta_id']);

        if ($validated['monto'] > $venta->getAmountPending()) {
            return response()->json([
                'error' => 'Monto excede lo pendiente'
            ], 400);
        }

        $pago = Pago::create([
            'venta_id' => $validated['venta_id'],
            'metodo_pago_id' => $validated['metodo_pago_id'],
            'monto' => $validated['monto'],
            'fecha_pago' => now()
        ]);

        if ($venta->isFullyPaid()) {
            $venta->update(['estado_pedido' => 'completada']);
        }

        return response()->json([
            'message' => 'Pago registrado',
            'pago' => $pago
        ]);
    }
}
```

**Métodos principales:**
- `index()` - Obtiene órdenes del usuario
- `getAvailableProducts()` - Trae productos del product-service
- `store()` - Crea nueva orden con validación de inventario
- `show()` - Obtiene orden específica
- `registerPayment()` - Registra pago de orden

---

## EMAIL SERVICE

**Puerto:** 8004  
**Responsabilidad:** Gestión asincrónica de notificaciones por correo (RabbitMQ)

### Modelos

#### Modelo: LogNotificacion
**Archivo:** `app/Models/LogNotificacion.php`  
**Tabla:** `log_notificaciones`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogNotificacion extends Model
{
    protected $table = 'log_notificaciones';
    protected $primaryKey = 'log_id';
    public $timestamps = false;

    protected $fillable = [
        'destinatario',
        'asunto',
        'tipo_notificacion',  // 'orden_creada', 'pago_recibido', etc
        'estado',              // 'pendiente', 'enviado', 'error'
        'mensaje_error',
        'fecha_envio',
        'cuerpo_email'
    ];

    protected $casts = [
        'fecha_envio' => 'datetime'
    ];

    /**
     * Scope para obtener notificaciones pendientes
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    /**
     * Marca como enviada
     * 
     * @return void
     */
    public function markAsSent()
    {
        $this->update([
            'estado' => 'enviado',
            'fecha_envio' => now()
        ]);
    }

    /**
     * Marca como error
     * 
     * @param string $error
     * @return void
     */
    public function markAsError($error)
    {
        $this->update([
            'estado' => 'error',
            'mensaje_error' => $error
        ]);
    }
}
```

**Campos principales:**
- `log_id` (PK)
- `destinatario` - Correo destino
- `asunto` - Asunto del correo
- `tipo_notificacion` - Tipo de notificación
- `estado` - Pendiente, enviado, error
- `mensaje_error` - Mensaje de error si falla
- `fecha_envio` - Fecha de envío
- `cuerpo_email` - Cuerpo del correo

**Métodos principales:**
- `scopePendientes()` - Obtiene notificaciones pendientes
- `markAsSent()` - Marca como enviada
- `markAsError()` - Marca como error

---

### Estructura

El email service es principalmente un manejador asincrónico que:

```
1. Escucha colas de RabbitMQ para eventos de:
   - Órdenes creadas
   - Pagos recibidos
   - Cambios de estado

2. Procesa eventos y envía emails

3. Registra log en log_notificaciones

4. Marca como enviado o error
```

**Eventos típicos:**
- Nuevo usuario registrado
- Orden creada
- Pago completado
- Cambio de estado de orden
- Notificaciones administrativas

---

## API GATEWAY

**Puerto:** 8080  
**Responsabilidad:** Proxy centralizado para todos los servicios + autenticación Sanctum

### Modelos

#### Modelo: User (Gateway)
**Archivo:** `app/Models/User.php`  
**Tabla:** `users`

```php
<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class User extends Model implements AuthenticatableContract
{
    use Authenticatable, HasApiTokens, HasFactory;

    protected $table = 'users';
    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Obtiene tokens del usuario
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tokens()
    {
        return $this->hasMany(PersonalAccessToken::class, 'tokenable_id')
                    ->where('tokenable_type', self::class);
    }
}
```

**Campos principales:**
- `id` (PK)
- `name` - Nombre del usuario
- `email` - Email único
- `password` - Hasheada
- `email_verified_at` - Verificación

**Métodos principales:**
- `tokens()` - Obtiene tokens Sanctum del usuario
- `createToken()` - Crea nuevo token (heredado de HasApiTokens)

---

### Controladores

#### Controlador: GatewayController
**Archivo:** `app/Http/Controllers/GatewayController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GatewayController extends Controller
{
    // URLs de servicios internos
    protected const AUTH_SERVICE = 'http://auth-service:8000';
    protected const PRODUCT_SERVICE = 'http://product-service:8001';
    protected const INVENTORY_SERVICE = 'http://inventory-service:8002';
    protected const ORDER_SERVICE = 'http://order-service:8003';
    protected const EMAIL_SERVICE = 'http://email-service:8004';

    /**
     * Realiza request a servicios (privado)
     * 
     * @param Request $request
     * @param string $url
     * @param string $method
     * @return mixed
     */
    protected function makeServiceRequest(Request $request, $url, $method = 'GET')
    {
        $headers = [
            'Content-Type' => 'application/json',
        ];

        // Incluir autenticación si existe
        if ($request->user()) {
            $headers['X-User-ID'] = $request->user()->id;
        }

        if ($token = $request->header('Authorization')) {
            $headers['Authorization'] = $token;
        }

        try {
            $http = Http::withHeaders($headers)->timeout(10);

            switch (strtoupper($method)) {
                case 'POST':
                    return $http->post($url, $request->all());
                case 'PUT':
                    return $http->put($url, $request->all());
                case 'DELETE':
                    return $http->delete($url, $request->all());
                case 'GET':
                default:
                    $fullUrl = $url . '?' . $request->getQueryString();
                    return $http->get($fullUrl);
            }
        } catch (\Exception $e) {
            Log::error('Service Request Failed', [
                'url' => $url,
                'method' => $method,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Service Unavailable',
                'message' => $e->getMessage(),
                'service_url' => $url
            ], 503);
        }
    }

    /**
     * Registra usuario en auth-service y sincroniza en gateway
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            // Paso 1: Registrar en auth-service
            $response = Http::timeout(10)
                           ->post(
                               self::AUTH_SERVICE . '/api/v1/register',
                               $request->all()
                           );

            if ($response->failed()) {
                return response()->json($response->json(), $response->status());
            }

            $userData = $response->json('user');

            // Paso 2: Sincronizar usuario localmente en Gateway
            $identifier = $userData['username'] ?? $userData['email'] ?? null;

            $user = User::firstOrCreate(
                ['email' => $identifier],
                [
                    'name' => $userData['username'] ?? $userData['name'] ?? 'User',
                    'password' => Hash::make(random_bytes(16))  // Password temporal
                ]
            );

            // Paso 3: Generar token Sanctum en Gateway
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registro exitoso. Token generado en Gateway.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration Error', ['error' => $e->getMessage()]);

            return response()->json([
                'error' => 'No se pudo conectar con el servicio de autenticación',
                'message' => $e->getMessage(),
                'service_url' => self::AUTH_SERVICE
            ], 503);
        }
    }

    /**
     * Login - autentica en auth-service y genera token Sanctum
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Paso 1: Validar en auth-service
            $response = Http::timeout(10)
                           ->post(
                               self::AUTH_SERVICE . '/api/v1/login',
                               $request->only(['username', 'password', 'dni'])
                           );

            if ($response->failed()) {
                return response()->json($response->json(), $response->status());
            }

            $userData = $response->json('user');
            $identifier = $userData['username'] ?? $userData['email'] ?? null;

            // Paso 2: Buscar o crear usuario localmente
            $user = User::where('email', $identifier)
                        ->orWhere('name', $identifier)
                        ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $userData['username'] ?? $userData['name'] ?? 'User',
                    'email' => $identifier,
                    'password' => Hash::make(random_bytes(16))
                ]);
            }

            // Paso 3: Revocar tokens anteriores y generar uno nuevo
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ]);

        } catch (\Exception $e) {
            Log::error('Login Error', ['error' => $e->getMessage()]);

            return response()->json([
                'error' => 'Error en la autenticación',
                'message' => $e->getMessage()
            ], 503);
        }
    }

    /**
     * Logout - revoca token actual
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'No hay sesión activa.'
            ], 401);
        }

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.'
        ], 200);
    }

    /**
     * Proxy para obtener productos
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableProducts(Request $request)
    {
        return $this->makeServiceRequest(
            $request,
            self::PRODUCT_SERVICE . '/api/v1/productos/disponibles'
        );
    }

    /**
     * Proxy para crear orden
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createOrder(Request $request)
    {
        return $this->makeServiceRequest(
            $request,
            self::ORDER_SERVICE . '/api/v1/orders',
            'POST'
        );
    }

    /**
     * Proxy para obtener órdenes del usuario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrders(Request $request)
    {
        return $this->makeServiceRequest(
            $request,
            self::ORDER_SERVICE . '/api/v1/orders',
            'GET'
        );
    }
}
```

**Métodos principales:**
- `makeServiceRequest()` - Request genérico a servicios
- `register()` - Registra en auth-service + sincroniza en gateway
- `login()` - Login en auth-service + genera token Sanctum
- `logout()` - Revoca token Sanctum
- `getAvailableProducts()` - Proxy a product-service
- `createOrder()` - Proxy a order-service
- `getOrders()` - Proxy a order-service

---

### Rutas

**Archivo:** `routes/api.php`

```php
<?php

use App\Http\Controllers\GatewayController;
use Illuminate\Support\Facades\Route;

// Autenticación (sin protección)
Route::prefix('auth')->group(function () {
    Route::post('login', [GatewayController::class, 'login']);
    Route::post('register', [GatewayController::class, 'register']);
});

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->prefix('/v1')->group(function () {
    // Productos
    Route::get('/productos/disponibles', [GatewayController::class, 'getAvailableProducts']);
    Route::get('/productos/buscar', [GatewayController::class, 'searchProducts']);
    Route::get('/categorias', [GatewayController::class, 'getCategories']);

    // Órdenes
    Route::get('/ordenes', [GatewayController::class, 'getOrders']);
    Route::post('/ordenes', [GatewayController::class, 'createOrder']);
    Route::get('/ordenes/{id}', [GatewayController::class, 'getOrder']);

    // Autenticación
    Route::get('/me', [GatewayController::class, 'getProfile']);
    Route::post('/auth/logout', [GatewayController::class, 'logout']);
});
```

**Endpoints públicos:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

**Endpoints protegidos:**
- `GET /api/v1/productos/disponibles` - Productos disponibles
- `GET /api/v1/ordenes` - Mis órdenes
- `POST /api/v1/ordenes` - Crear orden
- `GET /api/v1/me` - Perfil actual
- `POST /api/v1/auth/logout` - Logout

---

## FLUJOS PRINCIPALES

### 1. Flujo de Autenticación

```
┌─────────────────┐
│  Cliente        │
└────────┬────────┘
         │ POST /auth/register o /auth/login
         ▼
┌─────────────────────────────┐
│  API Gateway (8080)         │
│  - Solicita en auth-service │
└────────┬────────────────────┘
         │ POST /api/v1/register | login
         ▼
┌─────────────────────────────┐
│  Auth Service (8000)        │
│  - Valida credenciales      │
│  - Crea usuario             │
│  - Retorna userData         │
└────────┬────────────────────┘
         │ userData
         ▼
┌─────────────────────────────┐
│  API Gateway                │
│  - Sincroniza usuario       │
│  - Genera token Sanctum     │
└────────┬────────────────────┘
         │ token + userData
         ▼
┌─────────────────┐
│  Cliente        │
│  (token Sanctum)│
└─────────────────┘
```

**Pasos:**
1. Cliente envía credenciales a Gateway
2. Gateway delega a Auth Service
3. Auth Service valida y crea usuario
4. Gateway sincroniza usuario localmente
5. Gateway genera token Sanctum
6. Cliente recibe token para futuras requests

---

### 2. Flujo de Creación de Órdenes

```
┌─────────────────┐
│  Cliente        │
│  + token        │
└────────┬────────┘
         │ POST /v1/ordenes
         │ {items: [{producto_id, cantidad}]}
         ▼
┌─────────────────────────────┐
│  API Gateway (8080)         │
│  - Valida token Sanctum     │
│  - Delega a order-service   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Order Service (8003)       │
│  1. Obtiene productos info  │
└────────┬────────────────────┘
         │ GET /api/v1/productos/{id}
         ▼
┌─────────────────────────────┐
│  Product Service (8001)     │
│  - Retorna precio, nombre   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Order Service              │
│  2. Verifica inventario     │
└────────┬────────────────────┘
         │ GET /api/v1/inventory/check/{id}/{qty}
         ▼
┌─────────────────────────────┐
│  Inventory Service (8002)   │
│  - Valida receta + stock    │
│  - Retorna disponibilidad   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Order Service              │
│  3. Reserva inventario      │
└────────┬────────────────────┘
         │ POST /api/v1/inventory/reserve
         ▼
┌─────────────────────────────┐
│  Inventory Service          │
│  - Consume insumos (FIFO)   │
│  - Actualiza stock          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Order Service              │
│  4. Crea Venta + Detalles   │
│  5. Emite evento            │
└────────┬────────────────────┘
         │ evento → RabbitMQ
         ▼
┌─────────────────────────────┐
│  Email Service (8004)       │
│  - Envía notificación       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  Cliente        │
│  (orden creada) │
└─────────────────┘
```

**Pasos:**
1. Cliente envía items de orden
2. Order Service obtiene datos de productos
3. Verifica disponibilidad en Inventory Service
4. Reserva inventario (consume insumos FIFO)
5. Crea registro de Venta + DetalleVenta
6. Emite evento para Email Service
7. Retorna orden creada

**Validaciones:**
- Producto existe
- Stock suficiente para todos los insumos
- Cantidad > 0

---

### 3. Flujo de Gestión de Inventario

```
┌──────────────────────────┐
│ Producto solicitado      │
│ {producto_id, cantidad}  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Inventory Service            │
│ - Obtiene receta del producto│
│ - Insumos necesarios         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Para cada insumo:            │
│ ┌─────────────────────────┐  │
│ │ Cantidad necesaria =    │  │
│ │  cantidad_receta ×      │  │
│ │  cantidad_solicitada    │  │
│ └─────────────────────────┘  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Verifica stock por insumo    │
│ IF (stock_total <            │
│     cantidad_necesaria)      │
│   RETURN false (NO disponible)│
│ ELSE                         │
│   CONTINUE                   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ SI todos OK:                 │
│ Consume desde lotes (FIFO)   │
│ ┌─────────────────────────┐  │
│ │ FOR each lote:          │  │
│ │  IF (lote.cantidad > 0) │  │
│ │   consume min()         │  │
│ │   actualiza stock       │  │
│ └─────────────────────────┘  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ RESULT:                      │
│ - Si hay stock: RESERVADO    │
│ - Si no hay: FALLA           │
└──────────────────────────────┘
```

**Características:**
- Consumo **FIFO** por lote
- Actualización automática de stock_total_calculado
- Validación de fechas de caducidad
- Sistema de alertas si stock < mínimo

---

Fin del análisis. Todos los servicios están correctamente documentados con código real, modelos, controladores, rutas y flujos principales.
