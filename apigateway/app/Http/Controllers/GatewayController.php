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
    protected const PRODUCT_URL = 'http://product-service:8000';
    protected const INVENTORY_URL = 'http://inventory-service:8000';
    protected const ORDER_URL = 'http://order-service:8000';
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
                    return $http->post($url, $request->all());
                case 'put':
                    return $http->put($url, $request->all());
                case 'delete':
                    return $http->delete($url, $request->all());
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

    public function getProducts(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . '/api/v1/products', 'get');
        return $response;
    }

    public function getProduct(Request $request, $id)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . "/api/v1/products/{$id}", 'get');
        return $response;
    }

    public function createProduct(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . '/api/v1/products', 'post');
        return $response;
    }

    public function verificarEstadoApertura(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . '/api/apertura/verificar-estado', 'get');
        return $response;
    }

    public function abrirCaja(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . '/api/apertura', 'post');
        return $response;
    }

    public function getEstadoActualApertura(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::INVENTORY_URL . '/api/apertura/actual', 'get');
        return $response;
    }

    // ===================================================================
    //  MÉTODOS DE PRODUCT SERVICE
    // ===================================================================

    public function getAvailableProducts(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/products/available', 'get');
        return $response;
    }

    public function searchProducts(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/products/search', 'get');
        return $response;
    }

    public function getCategories(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::PRODUCT_URL . '/api/v1/categories', 'get');
        return $response;
    }

    // ===================================================================
    //  MÉTODOS DE ORDER SERVICE
    // ===================================================================

    public function getOrders(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . '/api/v1/orders', 'get');
        return $response;
    }

    public function createOrder(Request $request)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . '/api/v1/orders', 'post');
        return $response;
    }

    public function getOrder(Request $request, $id)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . "/api/v1/orders/{$id}", 'get');
        return $response;
    }

    public function cancelOrder(Request $request, $id)
    {
        $response = $this->makeServiceRequest($request, self::ORDER_URL . "/api/v1/orders/{$id}", 'delete');
        return $response;
    }

    // ===================================================================
    //  MÉTODOS DE AUTH
    // ===================================================================

    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }
}