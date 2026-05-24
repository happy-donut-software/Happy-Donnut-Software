# 📗 Guía de Migración a Backend API - Sistema HappyDonuts

## 🎯 Objetivo

Esta guía explica paso a paso cómo migrar el sistema de **localStorage** (almacenamiento en navegador) a **Backend API** (servidor con base de datos).

---

## 📊 Estado Actual vs. Estado Futuro

### **Estado Actual (LocalStorage)**

```
Usuario → Componente React → storage.ts → localStorage (Navegador)
                                              ↓
                                         Datos guardados solo en el navegador
```

**Ventajas:**
- ✅ No necesita backend
- ✅ Rápido para desarrollo

**Desventajas:**
- ❌ Datos se pierden si se limpia el caché
- ❌ No se comparten entre dispositivos
- ❌ No hay respaldo
- ❌ Límite de 5-10MB de almacenamiento

---

### **Estado Futuro (Backend API)**

```
Usuario → Componente React → storageNew.ts → api.ts → Backend API → Base de Datos
                                                           ↓
                                                    Datos persistentes y compartidos
```

**Ventajas:**
- ✅ Datos persistentes en base de datos
- ✅ Compartidos entre dispositivos
- ✅ Respaldo automático
- ✅ Sin límite de almacenamiento
- ✅ Múltiples usuarios simultáneos
- ✅ Seguridad mejorada

---

## 🏗️ Arquitectura Preparada para la Migración

El proyecto ya está **reestructurado y listo** para la migración. Estos son los archivos clave:

```
/src/app/
├── config/
│   └── api.config.ts          # ⚙️ Configuración (cambiar USE_BACKEND aquí)
│
├── services/
│   ├── api.ts                 # 🌐 Cliente HTTP para backend
│   └── localStorage.ts        # 💾 Servicio de almacenamiento local
│
└── lib/
    ├── storage.ts             # 🔴 ANTIGUO - Mantener para compatibilidad
    └── storageNew.ts          # 🆕 NUEVO - Capa de abstracción
```

---

## 🔄 Proceso de Migración

### **Fase 1: Preparación del Backend** ⏱️ (1-2 semanas)

El equipo de backend debe:

1. **Crear la base de datos** con las siguientes tablas:
   - `productos`
   - `insumos`
   - `clientes` (con campo `cantidad_compras` INT DEFAULT 0)
   - `promociones`
   - `comprobantes`
   - `notas_entrada`
   - `notas_salida`
   - `categorias`
   - `usuarios`
   - `apertura_caja`
   - `cierre_caja`
   - `movimientos_caja`

2. **Implementar los endpoints** listados en `ENDPOINTS_BACKEND.md`

3. **Configurar CORS** para permitir peticiones desde el frontend:
```javascript
// Ejemplo en Express.js
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true
}));
```

4. **Implementar autenticación JWT**:
```javascript
// POST /api/auth/login
{
  "usuario": "admin",
  "password": "admin123"
}
// Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": "admin",
  "rol": "Administrador"
}
```

5. **Implementar lógica de negocio importante**:

   **Al crear un comprobante (POST `/api/comprobantes`):**
   ```javascript
   // 1. Reducir stock de productos vendidos
   // 2. Si el producto es "Preparado", reducir insumos según la receta
   // 3. Registrar ingreso en movimientos de caja
   // 4. Generar nota de salida automática
   // 5. Incrementar contador de compras del cliente
   
   if (comprobante.cliente && comprobante.cliente.numeroDocumento) {
     await db.query(`
       UPDATE clientes 
       SET cantidad_compras = cantidad_compras + 1 
       WHERE numero_documento = ?
     `, [comprobante.cliente.numeroDocumento]);
   }
   ```

   **Al crear nota de entrada (POST `/api/notas-entrada`):**
   - Incrementar stock de insumos listados

   **Al crear nota de salida (POST `/api/notas-salida`):**
   - Reducir stock de productos/insumos listados

---

### **Fase 2: Configuración del Frontend** ⏱️ (5 minutos)

Una vez que el backend esté listo:

#### **Paso 1: Actualizar la configuración**

Edita `/src/app/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  // ⬇️ Cambiar de false a true
  USE_BACKEND: true,

  // ⬇️ Actualizar con la URL real de tu backend
  API_BASE_URL: 'http://localhost:3000/api',
  
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

#### **Paso 2: Configurar variables de entorno (opcional)**

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_BACKEND=true
```

Luego actualiza `api.config.ts`:

```typescript
export const API_CONFIG = {
  USE_BACKEND: process.env.VITE_USE_BACKEND === 'true',
  API_BASE_URL: process.env.VITE_API_URL || 'http://localhost:3000/api',
  // ...
};
```

---

### **Fase 3: Migración de Componentes** ⏱️ (2-3 días)

#### **Opción A: Migración Rápida (Recomendada)**

Reemplaza todas las importaciones de `storage.ts` por `storageNew.ts`:

**Antes:**
```typescript
import { getProductos, addProducto } from '../lib/storage';
```

**Después:**
```typescript
import { ProductosService } from '../lib/storageNew';
```

**Actualizar el uso:**

**Antes (síncrono):**
```typescript
const productos = getProductos();
```

**Después (asíncrono):**
```typescript
const [productos, setProductos] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadProductos() {
    setLoading(true);
    try {
      const data = await ProductosService.getAll();
      setProductos(data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }
  loadProductos();
}, []);
```

---

#### **Opción B: Migración Gradual por Módulo**

Migra un módulo a la vez:

1. **Día 1:** Productos e Insumos
2. **Día 2:** Clientes y Promociones
3. **Día 3:** Comprobantes y Caja
4. **Día 4:** Notas de Entrada/Salida
5. **Día 5:** Usuarios y Dashboard

Para cada módulo:
- Cambiar importación a `storageNew.ts`
- Convertir funciones síncronas a asíncronas
- Agregar estados de carga
- Agregar manejo de errores

---

### **Fase 4: Actualizar Componentes para Async/Await** ⏱️ (1-2 días)

Todos los componentes que usan datos necesitan manejar estados asíncronos:

#### **Ejemplo Completo: Componente Productos.tsx**

```typescript
import { useState, useEffect } from 'react';
import { ProductosService, type Producto } from '../lib/storageNew';
import { toast } from 'sonner';

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductosService.getAll();
      setProductos(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ProductosService.delete(id);
      toast.success('Producto eliminado');
      await loadProductos(); // Recargar la lista
    } catch (err) {
      toast.error('Error al eliminar producto');
    }
  };

  const handleCreate = async (producto: Omit<Producto, 'id'>) => {
    try {
      await ProductosService.create(producto);
      toast.success('Producto creado');
      await loadProductos();
    } catch (err) {
      toast.error('Error al crear producto');
    }
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          <p className="font-medium">Error al cargar datos</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadProductos}
            className="mt-2 text-sm underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Renderizar la tabla normal
  return (
    <div className="p-6">
      {/* Tu tabla de productos aquí */}
    </div>
  );
}
```

---

### **Fase 5: Implementar Autenticación Real** ⏱️ (1 día)

Actualiza el componente `Login.tsx`:

**Antes:**
```typescript
const handleLogin = (usuario: string, rol: "Administrador" | "Empleado") => {
  setCurrentUser(usuario);
  setUserRole(rol);
  setShowLogin(false);
};
```

**Después:**
```typescript
import { AuthService } from './lib/storageNew';

const handleLogin = async (usuario: string, password: string) => {
  try {
    const response = await AuthService.login(usuario, password);
    
    // Guardar token en localStorage
    localStorage.setItem('authToken', response.token);
    
    // Actualizar estado de la app
    setCurrentUser(response.usuario);
    setUserRole(response.rol);
    setShowLogin(false);
    
    toast.success('Inicio de sesión exitoso');
  } catch (error) {
    toast.error('Usuario o contraseña incorrectos');
  }
};
```

---

## 🔒 Manejo de Errores y Seguridad

### **Tipos de Errores a Manejar**

```typescript
try {
  const data = await ProductosService.getAll();
  setProductos(data);
} catch (error) {
  if (error instanceof APIError) {
    // Error de la API
    if (error.status === 401) {
      // Token expirado, redirigir al login
      toast.error('Sesión expirada');
      setShowLogin(true);
    } else if (error.status === 404) {
      toast.error('Recurso no encontrado');
    } else if (error.status === 500) {
      toast.error('Error del servidor');
    } else {
      toast.error(error.message);
    }
  } else {
    // Error de red o conexión
    toast.error('Error de conexión. Verifica tu internet.');
  }
}
```

### **Validación de Token**

Agregar en `App.tsx`:

```typescript
useEffect(() => {
  async function validateSession() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowLogin(true);
      return;
    }

    try {
      const { valid } = await AuthService.validateToken();
      if (!valid) {
        localStorage.removeItem('authToken');
        setShowLogin(true);
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      setShowLogin(true);
    }
  }

  validateSession();
}, []);
```

---

## 🧪 Pruebas de Integración

### **Checklist de Pruebas**

Antes de pasar a producción, verifica:

#### **Módulo Productos**
- [ ] Cargar lista de productos
- [ ] Crear nuevo producto
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Búsqueda de productos

#### **Módulo Ventas**
- [ ] Crear comprobante de venta
- [ ] Actualizar stock al vender
- [ ] Registrar venta en caja
- [ ] Generar número de serie/número

#### **Módulo Caja**
- [ ] Apertura de caja
- [ ] Registrar ingresos
- [ ] Registrar egresos
- [ ] Cierre de caja
- [ ] Ver historial de cierres

#### **Autenticación**
- [ ] Login correcto
- [ ] Login con credenciales incorrectas
- [ ] Logout
- [ ] Validación de token expirado
- [ ] Restricción por roles

---

## 📊 Migración de Datos Existentes

Si ya tienes datos en localStorage y quieres migrarlos al backend:

### **Script de Exportación**

Ejecuta esto en la consola del navegador (F12):

```javascript
// Exportar todos los datos de localStorage
const exportData = () => {
  const data = {};
  const keys = [
    'productos',
    'insumos',
    'clientes',
    'promociones',
    'comprobantes',
    'notas_entrada',
    'notas_salida',
    'categorias',
    'usuarios',
  ];

  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      data[key] = JSON.parse(value);
    }
  });

  // Descargar como JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${new Date().toISOString()}.json`;
  a.click();
};

exportData();
```

### **Script de Importación (Backend)**

El equipo de backend puede usar este JSON para poblar la base de datos inicial.

---

## 🚀 Despliegue en Producción

### **Configuración por Ambiente**

Actualiza `api.config.ts` para usar ambientes:

```typescript
export const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.happydonuts.com/api',
  },
  production: {
    API_BASE_URL: 'https://api.happydonuts.com/api',
  },
};

export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENTS[env] || ENVIRONMENTS.development;
}
```

### **Variables de Entorno para Producción**

```env
# .env.production
VITE_API_URL=https://api.happydonuts.com/api
VITE_USE_BACKEND=true
NODE_ENV=production
```

---

## ⚠️ Problemas Comunes y Soluciones

### **Error CORS**

**Problema:**
```
Access to fetch at 'http://localhost:3000/api/productos' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solución (Backend):**
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://happydonuts.com'],
  credentials: true
}));
```

---

### **Token Expirado**

**Problema:** El usuario es deslogueado constantemente.

**Solución:** Implementar refresh token:

```typescript
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const { token } = await response.json();
  localStorage.setItem('authToken', token);
}
```

---

### **Requests Lentos**

**Problema:** La aplicación es lenta al cargar datos.

**Soluciones:**

1. **Paginación:**
```typescript
const ProductosService = {
  getAll: (page = 1, limit = 50) => 
    fetchAPI<Producto[]>(`/productos?page=${page}&limit=${limit}`),
};
```

2. **Caché:**
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['productos'],
  queryFn: ProductosService.getAll,
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

3. **Debouncing en búsquedas:**
```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const results = await ClientesService.search(query);
  setResults(results);
}, 300);
```

---

## 📝 Checklist Final de Migración

- [ ] Backend API funcionando y testeado
- [ ] Endpoints implementados según `ENDPOINTS_BACKEND.md`
- [ ] CORS configurado correctamente
- [ ] Autenticación JWT implementada
- [ ] `USE_BACKEND = true` en `api.config.ts`
- [ ] `API_BASE_URL` actualizada
- [ ] Componentes migrados a async/await
- [ ] Estados de carga implementados
- [ ] Manejo de errores implementado
- [ ] Pruebas de integración completadas
- [ ] Datos migrados de localStorage (si aplica)
- [ ] Documentación actualizada
- [ ] Equipo capacitado en la nueva arquitectura

---

## 🎓 Recursos de Aprendizaje

- **Async/Await en JavaScript:** https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/async_function
- **Fetch API:** https://developer.mozilla.org/es/docs/Web/API/Fetch_API
- **React useState:** https://react.dev/reference/react/useState
- **React useEffect:** https://react.dev/reference/react/useEffect
- **JWT Authentication:** https://jwt.io/introduction

---

**Última actualización:** Mayo 2026  
**Versión del documento:** 1.0  
**Tiempo estimado de migración completa:** 1-2 semanas
