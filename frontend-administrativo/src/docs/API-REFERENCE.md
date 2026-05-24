# 📡 Referencia de API - HappyDonuts

Documentación completa de los servicios y funciones disponibles en HappyDonuts.

---

## 📋 Tabla de Contenidos

1. [Servicios Disponibles](#servicios-disponibles)
2. [LocalStorage Service](#localstorage-service)
3. [API Services (Backend Ready)](#api-services-backend-ready)
4. [Uso en Componentes](#uso-en-componentes)
5. [Tipos TypeScript](#tipos-typescript)

---

## 📦 Servicios Disponibles

### Ubicación de Servicios

```
src/services/
├── api/                    # Servicios API (usan localStorage o backend)
│   ├── index.ts           # Export central
│   └── productos.service.ts   # Ejemplo implementado
│
└── storage/               # Servicios de almacenamiento
    └── localStorage.service.ts  # Implementación localStorage
```

---

## 💾 LocalStorage Service

**Archivo**: `src/services/storage/localStorage.service.ts`

Este servicio encapsula toda la lógica de localStorage del sistema.

### Promociones

```typescript
import { promocionesService } from '@/services/storage/localStorage.service';

// Obtener todas las promociones
const promociones = promocionesService.getAll();
// Returns: Promocion[]

// Guardar promociones
promocionesService.save(promociones);

// Agregar nueva promoción
promocionesService.add(nuevaPromocion);

// Actualizar promoción
promocionesService.update(id, promocionActualizada);

// Eliminar promoción
promocionesService.delete(id);

// Obtener solo promociones activas
const activas = promocionesService.getActivas();
```

---

### Compras

```typescript
import { comprasService } from '@/services/storage/localStorage.service';

// Obtener todas las compras
const compras = comprasService.getAll();
// Returns: Compra[]

// Guardar compras
comprasService.save(compras);

// Agregar nueva compra
comprasService.add(nuevaCompra);
```

---

### Insumos

```typescript
import { insumosService } from '@/services/storage/localStorage.service';

// Obtener todos los insumos
const insumos = insumosService.getAll();
// Returns: Insumo[]

// Guardar insumos
insumosService.save(insumos);

// Agregar insumo (genera Nota de Entrada si cantidad > 0)
insumosService.add(nuevoInsumo);

// Agregar insumo SIN generar Nota de Entrada
insumosService.addSinNota(nuevoInsumo);

// Actualizar cantidad de insumo
insumosService.update(id, cantidad);
// cantidad puede ser positiva (añadir) o negativa (restar)

// Buscar insumo por nombre y categoría
const insumo = insumosService.findByNombre(nombre, categoria);
// Returns: Insumo | undefined
```

---

### Productos

```typescript
import { productosService } from '@/services/storage/localStorage.service';

// Obtener todos los productos
const productos = productosService.getAll();
// Returns: Producto[]

// Guardar productos
productosService.save(productos);

// Agregar producto
productosService.add(nuevoProducto);

// Actualizar stock
productosService.update(id, cantidad);

// Buscar producto por nombre
const producto = productosService.findByNombre(nombre);
// Returns: Producto | undefined
```

---

### Categorías

```typescript
import { categoriasService } from '@/services/storage/localStorage.service';

// Obtener todas las categorías
const categorias = categoriasService.getAll();
// Returns: Categoria[]
// Nota: Si no existen, retorna categorías iniciales por defecto

// Guardar categorías
categoriasService.save(categorias);

// Agregar categoría
categoriasService.add(nuevaCategoria);

// Actualizar categoría
categoriasService.update(id, { nombre: 'Nuevo Nombre' });

// Eliminar categoría
categoriasService.delete(id);

// Obtener categorías por tipo
const categoriasProductos = categoriasService.getByTipo('Producto');
const categoriasInsumos = categoriasService.getByTipo('Insumo');
// Returns: Categoria[]
```

---

### Notas de Entrada

```typescript
import { notasEntradaService } from '@/services/storage/localStorage.service';

// Obtener todas las notas
const notas = notasEntradaService.getAll();
// Returns: NotaEntrada[]

// Guardar notas
notasEntradaService.save(notas);

// Agregar nota
notasEntradaService.add(nuevaNota);

// Generar número de nota
const numero = notasEntradaService.generateNumero();
// Returns: string (ej: "NE-202401-0001")
```

---

### Notas de Salida

```typescript
import { notasSalidaService } from '@/services/storage/localStorage.service';

// Obtener todas las notas
const notas = notasSalidaService.getAll();
// Returns: NotaSalida[]

// Guardar notas
notasSalidaService.save(notas);

// Agregar nota
notasSalidaService.add(nuevaNota);

// Generar número de nota
const numero = notasSalidaService.generateNumero();
// Returns: string (ej: "NS-202401-0001")
```

---

### Clientes y Proveedores

```typescript
import { clientesProveedoresService } from '@/services/storage/localStorage.service';

// Obtener todos
const todos = clientesProveedoresService.getAll();
// Returns: ClienteProveedor[]

// Guardar
clientesProveedoresService.save(clientesProveedores);

// Agregar
clientesProveedoresService.add(nuevoClienteProveedor);

// Actualizar
clientesProveedoresService.update(id, clienteProveedorActualizado);

// Eliminar
clientesProveedoresService.delete(id);

// Obtener solo proveedores activos
const proveedores = clientesProveedoresService.getProveedores();
// Returns: ClienteProveedor[]

// Obtener solo clientes activos
const clientes = clientesProveedoresService.getClientes();
// Returns: ClienteProveedor[]
```

---

### Comprobantes

```typescript
import { comprobantesService } from '@/services/storage/localStorage.service';

// Obtener todos
const comprobantes = comprobantesService.getAll();
// Returns: Comprobante[]

// Guardar
comprobantesService.save(comprobantes);

// Agregar
comprobantesService.add(nuevoComprobante);

// Generar número de comprobante
const { serie, numero, correlativo } = comprobantesService.generateNumero('boleta');
// Returns: { serie: 'B001', numero: '000001', correlativo: 'B001-000001' }
```

---

### Caja

```typescript
import { cajaService } from '@/services/storage/localStorage.service';

// Obtener caja abierta
const caja = cajaService.getAbierta();
// Returns: CajaAbierta | null

// Abrir caja
cajaService.setAbierta({
  fecha: '2024-01-15',
  hora: '08:00',
  fondoInicial: 100,
  fondoInicialYape: 0,
  fondoInicialPlin: 0,
  usuario: 'admin'
});

// Cerrar caja
cajaService.cerrar();

// Verificar si caja está abierta
const isOpen = cajaService.isAbierta();
// Returns: boolean

// Movimientos de caja
const movimientos = cajaService.getMovimientos();
cajaService.saveMovimientos(movimientos);
cajaService.addMovimiento(nuevoMovimiento);

// Movimientos del día actual
const movimientosHoy = cajaService.getMovimientosDelDia();

// Limpiar movimientos del día
cajaService.limpiarMovimientosDelDia();

// Historial de cierres
const historial = cajaService.getHistorialCierres();
cajaService.saveHistorialCierres(historial);
cajaService.addCierre(nuevoCierre);
```

---

### Utilidades del Sistema

```typescript
import { systemService, getNextId } from '@/services/storage/localStorage.service';

// Limpiar todos los datos excepto categorías
systemService.limpiarDatosExceptoCategorias();

// Obtener siguiente ID disponible
const nextId = getNextId(arrayDeItems);
// Returns: number
```

---

## 🔌 API Services (Backend Ready)

**Archivo**: `src/services/api/productos.service.ts`

Estos servicios están preparados para trabajar con localStorage o API REST.

### Productos API

```typescript
import { productosAPI } from '@/services/api';

// Obtener todos los productos
const productos = await productosAPI.getAll();
// Returns: Promise<Producto[]>

// Obtener producto por ID
const producto = await productosAPI.getById(1);
// Returns: Promise<Producto | undefined>

// Crear producto
const nuevoProducto = await productosAPI.create({
  id: 1,
  nombre: 'Dona Clásica',
  categoria: 'Donas',
  tipo_producto: 'Preparado',
  precio: 3.50,
  stock: 50,
  estado: 'Disponible'
});
// Returns: Promise<Producto>

// Actualizar stock
await productosAPI.updateStock(1, 10);
// Añade 10 unidades al stock actual
// Returns: Promise<void>

// Actualizar producto completo
const actualizado = await productosAPI.update(1, productoActualizado);
// Returns: Promise<Producto>

// Eliminar producto
await productosAPI.delete(1);
// Returns: Promise<void>

// Buscar por nombre
const producto = await productosAPI.findByNombre('Dona Clásica');
// Returns: Promise<Producto | undefined>
```

### Uso con async/await

```typescript
const MiComponente = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const data = await productosAPI.getAll();
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // ...
};
```

---

## 🎨 Uso en Componentes

### Imports Recomendados

```typescript
// Importar tipos
import type { Producto, Categoria } from '@/types';

// Importar servicios API (recomendado)
import { productosAPI } from '@/services/api';

// Importar servicio de localStorage directamente (si necesitas)
import { productosService } from '@/services/storage/localStorage.service';
```

### Ejemplo Completo: Gestión de Productos

```typescript
import { useState, useEffect } from 'react';
import { productosAPI } from '@/services/api';
import type { Producto } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner@2.0.3';

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await productosAPI.getAll();
      setProductos(data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Crear producto
  const crearProducto = async (producto: Producto) => {
    try {
      await productosAPI.create(producto);
      toast.success('Producto creado');
      cargarProductos(); // Recargar lista
    } catch (error) {
      toast.error('Error al crear producto');
    }
  };

  // Actualizar stock
  const actualizarStock = async (id: number, cantidad: number) => {
    try {
      await productosAPI.updateStock(id, cantidad);
      toast.success('Stock actualizado');
      cargarProductos();
    } catch (error) {
      toast.error('Error al actualizar stock');
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id: number) => {
    try {
      await productosAPI.delete(id);
      toast.success('Producto eliminado');
      cargarProductos();
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  return (
    <div>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div>
          {productos.map(producto => (
            <div key={producto.id}>
              {producto.nombre} - Stock: {producto.stock}
              <Button onClick={() => actualizarStock(producto.id, 10)}>
                +10
              </Button>
              <Button onClick={() => eliminarProducto(producto.id)}>
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Tipos TypeScript

Todos los tipos están disponibles en `/src/types`:

```typescript
import type {
  // Ventas
  Comprobante,
  ItemComprobante,
  MetodoPago,
  TipoComprobante,
  
  // Inventario
  Producto,
  Insumo,
  Categoria,
  NotaEntrada,
  NotaSalida,
  
  // Compras
  Compra,
  DetalleInsumo,
  DetalleProducto,
  
  // Clientes
  ClienteProveedor,
  
  // Promociones
  Promocion,
  ProductoPromocion,
  
  // Caja
  CajaAbierta,
  MovimientoCaja,
  CierreCaja,
  
  // Auth
  UserRole,
  User,
} from '@/types';
```

Ver detalles completos de cada tipo en:
- `/src/types/ventas.types.ts`
- `/src/types/inventario.types.ts`
- `/src/types/compras.types.ts`
- `/src/types/clientes.types.ts`
- `/src/types/promociones.types.ts`
- `/src/types/caja.types.ts`
- `/src/types/auth.types.ts`
- `/src/types/configuracion.types.ts`

---

## 🔧 Configuración

### Cambiar entre localStorage y API

Edita `/src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  useLocalStorage: true,  // true = localStorage, false = API REST
  // ...
};
```

### Variables de Entorno

Configura en `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

---

## 📚 Ejemplos de Uso

### Crear Nota de Entrada con Actualización de Stock

```typescript
import { notasEntradaService, productosService } from '@/services/storage/localStorage.service';
import type { NotaEntrada, ProductoNE } from '@/types';

const crearNotaEntrada = () => {
  const productos: ProductoNE[] = [
    { id: 1, nombre: 'Dona Clásica', cantidad: 50, unidad: 'Unidad' }
  ];

  const nota: NotaEntrada = {
    id: Date.now(),
    numero: notasEntradaService.generateNumero(),
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
    motivo: 'Por Compra',
    productos: productos,
    observaciones: '',
    usuario: 'admin'
  };

  // Guardar nota
  notasEntradaService.add(nota);

  // Actualizar stock de productos
  productos.forEach(p => {
    productosService.update(p.id, p.cantidad);
  });
};
```

---

## 🚀 Mejores Prácticas

1. **Usa servicios API en componentes**: Prefiere `productosAPI` sobre `productosService`
2. **Maneja errores**: Siempre usa try/catch
3. **Muestra feedback**: Usa toast para notificaciones
4. **Recarga datos**: Después de crear/actualizar/eliminar
5. **Tipado fuerte**: Usa TypeScript types siempre

---

Para más información, consulta:
- **[ESTRUCTURA.md](ESTRUCTURA.md)** - Arquitectura del proyecto
- **[BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md)** - Conectar con backend
