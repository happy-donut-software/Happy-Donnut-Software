<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Exception;
use App\Http\Controllers\AuthController;

class GatewayController extends Controller
{
    // IMPORTANTE: Usar los NOMBRES DE SERVICIO del docker-compose.yml
    // NO los nombres de contenedor (container_name)
    protected const AUTH_URL = 'http://auth-service:8000';
    protected const PRODUCT_URL = 'http://product-service-nginx:80';
    protected const INVENTORY_URL = 'http://inventory-service:8002';
    protected const ORDER_URL = 'http://order-service:8003';
    protected const EMAIL_URL = 'http://email-service:8000';


    /**
     * Función genérica para enviar peticiones a los microservicios.
     */
    protected function makeServiceRequest(Request $request, string $url, string $method = 'get')
    {
        $headers = [];

        if ($request->user()) {
            $headers['X-User-ID'] = $request->user()->id;     
        }

        if ($token = $request->header('Authorization')) {
            $headers['Authorization'] = $token;
        }

        try {
            $http = Http::withHeaders($headers)->timeout(10);

            switch (strtolower($method)) {
                case 'post':
                    // Intentar obtener datos JSON primero
                    $data = $request->json()->all() ?: $request->all();
                    return $http->post($url, $data);
                case 'put':
                    $data = $request->json()->all() ?: $request->all();
                    return $http->put($url, $data);
                case 'delete':
                    $data = $request->json()->all() ?: $request->all();
                    return $http->delete($url, $data);
                case 'get':
                default:
                    $fullUrl = $url . '?' . $request->getQueryString();
                    return $http->get($fullUrl);
            }
        } catch (Exception $e) {
            \Log::error('Service Request Failed', [
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
     * Delega la creación de usuario al Auth Service y genera el Token en el Gateway.
     */
    public function register(Request $request)
    {
        \Log::info('Gateway: Registro iniciado', $request->only(['username']));
        
        try {
            $response = Http::timeout(10)->post(self::AUTH_URL . '/api/v1/register', $request->all());

            if ($response->failed()) {
                \Log::warning('Gateway: Auth service rechazó el registro', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                return response()->json($response->json(), $response->status());
            }

            $user = $response->json('user');
            \Log::info('Gateway: Usuario registrado en auth-service', ['user_id' => $user['id'] ?? null]);
            
            $authController = new AuthController();
            return $authController->registerFromService($request, $user);
            
        } catch (Exception $e) {
            \Log::error('Gateway: Error conectando con auth-service', [
                'error' => $e->getMessage(),
                'url' => self::AUTH_URL . '/api/v1/register'
            ]);
            
            return response()->json([
                'error' => 'No se pudo conectar con el servicio de autenticación',
                'message' => $e->getMessage(),
                'service_url' => self::AUTH_URL
            ], 503);
        }
    }


    public function login(Request $request)
    {
        try {
            $response = Http::timeout(10)->post(self::AUTH_URL . '/api/v1/login', [
                'email' => $request->email,
                'password' => $request->password,
            ]);

            if ($response->failed()) {
                return response()->json($response->json(), $response->status());
            }
            
            $user = $response->json('user');
            $authController = new AuthController();
            return $authController->loginFromService($request, $user);
            
        } catch (Exception $e) {
            \Log::error('Gateway: Error en login', [
                'error' => $e->getMessage(),
                'url' => self::AUTH_URL . '/api/v1/login'
            ]);
            
            return response()->json([
                'error' => 'No se pudo conectar con el servicio de autenticación',
                'message' => $e->getMessage()
            ], 503);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }


    // ===================================================================
    //  MÉTODOS DE INVENTORY SERVICE
    // ===================================================================

    // Productos (Inventory Service)
    public function getInventoryProducts(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . '/api/v1/products', 'get');
        return response()->json($response->json(), $response->status());
    }

    public function getInventoryProduct(Request $request, $id)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . "/api/v1/products/{$id}", 'get');
        return response()->json($response->json(), $response->status());
    }

    public function createInventoryProduct(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . '/api/v1/products', 'post');
        return response()->json($response->json(), $response->status());
    }

    // ===================================================================
    //  MÉTODOS DE PRODUCT SERVICE
    // ===================================================================

    public function getAvailableProducts(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/products/available', 'get');
        return response()->json($response->json(), $response->status());
    }

    public function searchProducts(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/products/search', 'get');
        return response()->json($response->json(), $response->status());
    }

    public function getCategories(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/categories', 'get');
        return response($response->body(), $response->status());
    }

    public function createCategory(Request $request)
    {
        try {
            $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/categories', 'post');
            return response($response->body(), $response->status());
        } catch (Exception $e) {
            \Log::error('Create Category Failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'error' => 'Failed to create category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateCategory(Request $request, $id)
    {
        try {
            $response = $this->makeServiceRequest($request, self::PRODUCT_URL . "/api/v1/categories/{$id}", 'put');
            return response($response->body(), $response->status());
        } catch (Exception $e) {
            \Log::error('Update Category Failed', [
                'error' => $e->getMessage(),
                'category_id' => $id
            ]);
            return response()->json([
                'error' => 'Failed to update category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteCategory(Request $request, $id)
    {
        try {
            $response = $this->makeServiceRequest($request, self::PRODUCT_URL . "/api/v1/categories/{$id}", 'delete');
            return response($response->body(), $response->status());
        } catch (Exception $e) {
            \Log::error('Delete Category Failed', [
                'error' => $e->getMessage(),
                'category_id' => $id
            ]);
            return response()->json([
                'error' => 'Failed to delete category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProduct(Request $request, $id)
    {
        try {
            $response = $this->makeServiceRequest($request, self::PRODUCT_URL . "/api/v1/products/{$id}", 'put');
            return response($response->body(), $response->status());
        } catch (Exception $e) {
            \Log::error('Update Product Failed', [
                'error' => $e->getMessage(),
                'product_id' => $id
            ]);
            return response()->json([
                'error' => 'Failed to update product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteProduct(Request $request, $id)
    {
        try {
            $response = $this->makeServiceRequest($request, self::PRODUCT_URL . "/api/v1/products/{$id}", 'delete');
            return response($response->body(), $response->status());
        } catch (Exception $e) {
            \Log::error('Delete Product Failed', [
                'error' => $e->getMessage(),
                'product_id' => $id
            ]);
            return response()->json([
                'error' => 'Failed to delete product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Productos administrativos completos
    public function getProducts(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/products', 'get');
        return response($response->body(), $response->status());
    }

    public function createProduct(Request $request)
    {
        // Log para depuración
        \Log::info('Gateway Create Product Request:', [
            'all_data' => $request->all(),
            'url' => self::PRODUCT_URL . '/api/v1/products'
        ]);

        try {
            $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/products', 'post');
            
            \Log::info('Gateway Create Product Response:', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return response($response->body(), $response->status());
        } catch (Exception $e) {
            \Log::error('Create Product Failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'error' => 'Failed to create product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getProduct(Request $request, $id)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . "/api/v1/products/{$id}", 'get');
        return response()->json($response->json(), $response->status());
    }

    
    
    // ===================================================================
    //  MÉTODOS DE ORDER SERVICE
    // ===================================================================

    public function getOrders(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . '/api/v1/orders', 'get');
        return response()->json($response->json(), $response->status());
    }

    public function createOrder(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . '/api/v1/orders', 'post');
        return response()->json($response->json(), $response->status());
    }

    public function getOrder(Request $request, $id)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . "/api/v1/orders/{$id}", 'get');
        return response()->json($response->json(), $response->status());
    }

    public function cancelOrder(Request $request, $id)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . "/api/v1/orders/{$id}", 'delete');
        return response()->json($response->json(), $response->status());
    }

    // ===================================================================
    //  MÉTODOS DE AUTH
    // ===================================================================

    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }
}