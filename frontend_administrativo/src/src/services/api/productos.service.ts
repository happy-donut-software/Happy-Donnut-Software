/**
 * HappyDonuts - Servicio de Productos API
 * 
 * Conexión con el API Gateway para gestión de productos
 */

import { API_CONFIG, buildURL, isAPIMode } from '../../config/api.config';
import { productosService, categoriasService } from '../storage/localStorage.service';
import type { Producto, Categoria } from '../../types/inventario.types';

// Tipos para API (backend)
export interface ProductoAPI {
  producto_id?: number;
  id?: number;
  categoria_id: number;
  nombre_producto: string;
  descripcion?: string;
  precio_base: number;
  tipo_producto: 'donut' | 'cafe' | 'otro';
  activo_web: boolean;
  categoria?: {
    categoria_id: number;
    nombre_categoria: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaAPI {
  categoria_id: number;
  nombre_categoria: string;
  descripcion?: string;
  activa: boolean;
}

export interface ProductosResponse {
  data: Producto[];
  message?: string;
  current_page?: number;
  last_page?: number;
  total?: number;
}

export interface ProductoResponse {
  data: Producto;
  message?: string;
}

export interface CategoriasResponse {
  data: Categoria[];
  message?: string;
}

// Helper para convertir de API a formato local
const convertFromAPI = (apiProducto: ProductoAPI): Producto => ({
  id: apiProducto.producto_id || apiProducto.id || Date.now(),
  nombre: apiProducto.nombre_producto,
  categoria: apiProducto.categoria?.nombre_categoria || 'Sin categoría',
  tipo_producto: apiProducto.tipo_producto === 'donut' ? 'Preparado' : 'No Preparado',
  precio: apiProducto.precio_base,
  stock: 0, // Por defecto, se puede ajustar después
  estado: apiProducto.activo_web ? 'Disponible' : 'No Disponible'
});

// Helper para convertir de local a API
const convertToAPI = (producto: Omit<Producto, 'id'>): Omit<ProductoAPI, 'id' | 'created_at' | 'updated_at'> => ({
  categoria_id: 1, // Por defecto, debería obtenerse de la categoría
  nombre_producto: producto.nombre,
  descripcion: '',
  precio_base: producto.precio,
  tipo_producto: 'donut', // Por defecto
  activo_web: producto.estado === 'Disponible'
});

/**
 * Servicio de Productos API
 */
class ProductosService {
  // Eliminadas variables no usadas

  /**
   * Obtener todos los productos
   */
  async getProductos(params?: {
    category_id?: number;
    tipo_producto?: string;
    activo?: boolean;
    page?: number;
  }): Promise<ProductosResponse> {
    if (!isAPIMode()) {
      // Usar localStorage directamente
      const productos = productosService.getAll();
      return { data: productos };
    }

    // Convertir parámetros a string/number para buildURL, filtrando undefined
    const apiParams = params ? {
      ...(params.category_id && { category_id: params.category_id }),
      ...(params.tipo_producto && { tipo_producto: params.tipo_producto }),
      activo: params.activo ? 1 : 0,
      ...(params.page && { page: params.page })
    } : undefined;

    try {
      const url = buildURL('/v1/products', apiParams);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      // Convertir productos de API a formato local
      const productosConvertidos = apiResponse.data?.map(convertFromAPI) || [];
      return { ...apiResponse, data: productosConvertidos };
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto
   */
  async createProducto(producto: Omit<Producto, 'id'>): Promise<ProductoResponse> {
    if (!isAPIMode()) {
      const nuevoProducto = {
        ...producto,
        id: Date.now()
      };
      productosService.add(nuevoProducto);
      return { data: nuevoProducto };
    }

    try {
      const url = buildURL('/v1/products');
      const apiProducto = convertToAPI(producto);
      const headers = {
        ...API_CONFIG.defaultHeaders
      };
      
      // Solo agregar token si existe
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(apiProducto)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      // Convertir respuesta a formato local
      const productoConvertido = convertFromAPI(apiResponse.data);
      return { ...apiResponse, data: productoConvertido };
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProducto(id: number): Promise<ProductoResponse> {
    if (!isAPIMode()) {
      const producto = productosService.getAll().find(p => p.id === id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      return { data: producto };
    }

    try {
      const url = buildURL('/v1/products/:id', { id });
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.defaultHeaders,
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProducto(id: number, producto: Partial<Producto>): Promise<ProductoResponse> {
    if (!isAPIMode()) {
      const productos = productosService.getAll();
      const index = productos.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Producto no encontrado');
      }
      productos[index] = { ...productos[index], ...producto };
      productosService.save(productos);
      return { data: productos[index] };
    }

    try {
      const url = buildURL('/v1/products/:id', { id });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...API_CONFIG.defaultHeaders,
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(producto)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProducto(id: number): Promise<{ message: string }> {
    if (!isAPIMode()) {
      const productos = productosService.getAll();
      const filtered = productos.filter(p => p.id !== id);
      productosService.save(filtered);
      return { message: 'Producto eliminado exitosamente' };
    }

    try {
      const url = buildURL('/v1/products/:id', { id });
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.defaultHeaders,
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  }

  /**
   * Obtener categorías
   */
  async getCategorias(): Promise<CategoriasResponse> {
    if (!isAPIMode()) {
      const categorias = categoriasService.getAll();
      return { data: categorias };
    }

    try {
      const url = buildURL('/v1/categories');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }
  }

  /**
   * Helper para obtener token de autenticación
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

// Exportamos la instancia del servicio
export const productosAPI = new ProductosService();
