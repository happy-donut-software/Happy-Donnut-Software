# ✅ Checklist de Migración a Backend - HappyDonuts

Este documento es una lista de verificación para guiar el proceso de migración de localStorage a Backend API.

---

## 🎯 Fase 1: Preparación (Antes de empezar)

### **Frontend**
- [x] Estructura de servicios creada (`/src/app/services/`)
- [x] Configuración de API lista (`/src/app/config/api.config.ts`)
- [x] Capa de abstracción implementada (`storageNew.ts`)
- [x] Documentación completa generada
- [ ] Equipo frontend ha leído `GUIA_INSTALACION.md`
- [ ] Equipo frontend ha leído `GUIA_MIGRACION_BACKEND.md`

### **Backend**
- [ ] Equipo backend ha leído `ENDPOINTS_BACKEND.md`
- [ ] Base de datos diseñada y creada
- [ ] Framework backend seleccionado (Express, FastAPI, Laravel, etc.)
- [ ] CORS configurado
- [ ] JWT implementado
- [ ] Ambiente de desarrollo configurado

---

## 🗄️ Fase 2: Base de Datos

### **Tablas a Crear**
- [ ] `usuarios` - Usuarios del sistema
- [ ] `productos` - Productos de la tienda
- [ ] `insumos` - Insumos/materias primas
- [ ] `categorias` - Categorías de productos
- [ ] `clientes` - Clientes y proveedores
- [ ] `promociones` - Promociones/combos
- [ ] `comprobantes` - Ventas/comprobantes
- [ ] `comprobante_items` - Items de comprobantes
- [ ] `notas_entrada` - Notas de entrada de inventario
- [ ] `notas_salida` - Notas de salida de inventario
- [ ] `apertura_caja` - Aperturas de caja
- [ ] `movimientos_caja` - Movimientos de caja
- [ ] `cierre_caja` - Cierres de caja

### **Relaciones**
- [ ] Productos → Categorías (many-to-one)
- [ ] Productos → Insumos (many-to-many, para recetas)
- [ ] Comprobantes → Cliente (many-to-one)
- [ ] Comprobantes → Items (one-to-many)
- [ ] Promociones → Productos (many-to-many)

---

## 🌐 Fase 3: Implementación de Endpoints Backend

### **Autenticación** (3 endpoints)
- [ ] POST `/auth/login`
- [ ] POST `/auth/logout`
- [ ] GET `/auth/validate`

### **Productos** (5 endpoints)
- [ ] GET `/productos`
- [ ] GET `/productos/:id`
- [ ] POST `/productos`
- [ ] PUT `/productos/:id`
- [ ] DELETE `/productos/:id`

### **Insumos** (5 endpoints)
- [ ] GET `/insumos`
- [ ] GET `/insumos/:id`
- [ ] POST `/insumos`
- [ ] PUT `/insumos/:id`
- [ ] DELETE `/insumos/:id`

### **Clientes** (6 endpoints)
- [ ] GET `/clientes`
- [ ] GET `/clientes/:id`
- [ ] GET `/clientes/search?q=`
- [ ] POST `/clientes`
- [ ] PUT `/clientes/:id`
- [ ] DELETE `/clientes/:id`

### **Promociones** (5 endpoints)
- [ ] GET `/promociones`
- [ ] GET `/promociones/:id`
- [ ] POST `/promociones`
- [ ] PUT `/promociones/:id`
- [ ] DELETE `/promociones/:id`

### **Comprobantes** (3 endpoints)
- [ ] GET `/comprobantes`
- [ ] GET `/comprobantes/:id`
- [ ] POST `/comprobantes`

### **Notas de Entrada** (4 endpoints)
- [ ] GET `/notas-entrada`
- [ ] GET `/notas-entrada/:id`
- [ ] POST `/notas-entrada`
- [ ] DELETE `/notas-entrada/:id`

### **Notas de Salida** (4 endpoints)
- [ ] GET `/notas-salida`
- [ ] GET `/notas-salida/:id`
- [ ] POST `/notas-salida`
- [ ] DELETE `/notas-salida/:id`

### **Categorías** (4 endpoints)
- [ ] GET `/categorias`
- [ ] POST `/categorias`
- [ ] PUT `/categorias/:id`
- [ ] DELETE `/categorias/:id`

### **Usuarios** (4 endpoints)
- [ ] GET `/usuarios`
- [ ] POST `/usuarios`
- [ ] PUT `/usuarios/:id`
- [ ] DELETE `/usuarios/:id`

### **Caja** (7 endpoints)
- [ ] GET `/caja/apertura/actual`
- [ ] POST `/caja/apertura`
- [ ] GET `/caja/movimientos`
- [ ] POST `/caja/egresos`
- [ ] POST `/caja/cierre`
- [ ] GET `/caja/cierre/historial`

### **Dashboard** (1 endpoint)
- [ ] GET `/dashboard/stats`

**Total: 50+ endpoints**

---

## 🧪 Fase 4: Pruebas de Backend

### **Herramientas**
- [ ] Postman/Insomnia instalado
- [ ] Colección de requests creada

### **Pruebas por Módulo**
- [ ] Autenticación funciona correctamente
- [ ] Productos - CRUD completo
- [ ] Insumos - CRUD completo
- [ ] Clientes - CRUD + búsqueda
- [ ] Promociones - CRUD completo
- [ ] Comprobantes - Creación con reducción de stock
- [ ] Notas de Entrada - Incremento de stock
- [ ] Notas de Salida - Reducción de stock
- [ ] Caja - Apertura, movimientos, cierre
- [ ] Dashboard - Estadísticas correctas

### **Validaciones**
- [ ] Token JWT se valida en todos los endpoints protegidos
- [ ] Roles se validan correctamente
- [ ] Errores devuelven mensajes claros
- [ ] Stock no puede ser negativo
- [ ] No se puede crear apertura de caja duplicada para el mismo día
- [ ] Comprobantes reducen stock correctamente
- [ ] Insumos se reducen según recetas de productos

---

## 💻 Fase 5: Configuración del Frontend

- [ ] Crear archivo `.env` (copiar de `.env.example`)
- [ ] Actualizar `VITE_API_URL` con URL del backend
- [ ] Cambiar `USE_BACKEND` a `true` en `api.config.ts`
- [ ] Verificar que el backend está corriendo

---

## 🔄 Fase 6: Migración de Componentes

### **Componentes a Migrar** (Cambiar imports de `storage.ts` a `storageNew.ts`)

#### **Inventario**
- [ ] `Productos.tsx` - Cambiar a async/await
- [ ] `Insumos.tsx` - Cambiar a async/await
- [ ] `Categorias.tsx` - Cambiar a async/await

#### **Ventas**
- [ ] `NuevoComprobante.tsx` - Cambiar a async/await
- [ ] `Comprobantes.tsx` - Cambiar a async/await

#### **Clientes**
- [ ] `Clientes.tsx` - Cambiar a async/await

#### **Promociones**
- [ ] `Promociones.tsx` - Cambiar a async/await
- [ ] `NuevaPromocion.tsx` - Cambiar a async/await

#### **Notas de Inventario**
- [ ] `NotasEntrada.tsx` - Cambiar a async/await
- [ ] `NuevaNotaEntrada.tsx` - Cambiar a async/await
- [ ] `NotasSalida.tsx` - Cambiar a async/await
- [ ] `NuevaNotaSalida.tsx` - Cambiar a async/await

#### **Caja**
- [ ] `AperturaCaja.tsx` - Cambiar a async/await
- [ ] `MovimientosCaja.tsx` - Cambiar a async/await
- [ ] `RegistrarEgreso.tsx` - Cambiar a async/await
- [ ] `CierreCaja.tsx` - Cambiar a async/await
- [ ] `HistorialCierres.tsx` - Cambiar a async/await

#### **Usuarios**
- [ ] `Usuarios.tsx` - Cambiar a async/await
- [ ] `Login.tsx` - Implementar autenticación real

#### **Dashboard**
- [ ] `Dashboard.tsx` - Cambiar a async/await

### **Estados Asíncronos a Agregar**
Para cada componente migrado:
- [ ] Estado `loading` agregado
- [ ] Estado `error` agregado
- [ ] Indicador de carga visible
- [ ] Mensaje de error visible
- [ ] Botón "Reintentar" en caso de error
- [ ] Toast notifications implementadas

---

## 🧪 Fase 7: Pruebas de Integración Frontend-Backend

### **Módulo Productos**
- [ ] Ver lista de productos
- [ ] Crear nuevo producto
- [ ] Editar producto
- [ ] Eliminar producto
- [ ] Búsqueda de productos

### **Módulo Ventas**
- [ ] Crear comprobante
- [ ] Ver historial de ventas
- [ ] Stock se reduce al vender
- [ ] Insumos se reducen según receta

### **Módulo Clientes**
- [ ] Ver lista de clientes
- [ ] Crear cliente
- [ ] Editar cliente
- [ ] Eliminar cliente
- [ ] Búsqueda de clientes en nuevo comprobante

### **Módulo Promociones**
- [ ] Ver promociones
- [ ] Crear promoción
- [ ] Editar promoción
- [ ] Eliminar promoción
- [ ] Agregar promoción en venta

### **Módulo Caja**
- [ ] Apertura de caja
- [ ] Ver movimientos
- [ ] Registrar egreso
- [ ] Cierre de caja
- [ ] Ver historial de cierres

### **Autenticación**
- [ ] Login exitoso
- [ ] Login fallido (credenciales incorrectas)
- [ ] Logout
- [ ] Token expirado redirige al login
- [ ] Roles se respetan (Admin vs Empleado)

### **Dashboard**
- [ ] Estadísticas se cargan correctamente
- [ ] Datos son precisos

---

## 🔒 Fase 8: Seguridad y Optimización

### **Seguridad**
- [ ] Contraseñas hasheadas (bcrypt)
- [ ] SQL Injection protegido
- [ ] XSS protegido
- [ ] CSRF protegido
- [ ] Rate limiting implementado
- [ ] HTTPS en producción

### **Optimización**
- [ ] Índices de base de datos creados
- [ ] Queries optimizadas
- [ ] Paginación implementada (si es necesario)
- [ ] Caché implementado (opcional)
- [ ] Compresión gzip habilitada

---

## 📊 Fase 9: Migración de Datos

Si tienes datos en localStorage que quieres migrar:

- [ ] Exportar datos de localStorage (usar script en `GUIA_MIGRACION_BACKEND.md`)
- [ ] Revisar datos exportados
- [ ] Crear script de importación en backend
- [ ] Importar datos a la base de datos
- [ ] Verificar que los datos se importaron correctamente

---

## 🚀 Fase 10: Despliegue

### **Backend**
- [ ] Servidor de producción configurado
- [ ] Base de datos de producción creada
- [ ] Variables de entorno configuradas
- [ ] SSL/TLS configurado
- [ ] Dominio apuntando al servidor
- [ ] Backups automáticos configurados

### **Frontend**
- [ ] Build de producción generado (`pnpm build`)
- [ ] Variables de entorno de producción configuradas
- [ ] Servidor web configurado (Nginx, Apache, Vercel, etc.)
- [ ] Dominio apuntando al servidor
- [ ] SSL/TLS configurado

### **Pruebas en Producción**
- [ ] Todas las funcionalidades funcionan
- [ ] No hay errores en consola
- [ ] Rendimiento es aceptable
- [ ] Respaldos funcionan

---

## 📚 Fase 11: Documentación y Capacitación

- [ ] Documentación técnica actualizada
- [ ] Manual de usuario creado (opcional)
- [ ] Equipo capacitado en el nuevo sistema
- [ ] Procedimientos de respaldo documentados
- [ ] Procedimientos de recuperación documentados

---

## ✅ Lista de Verificación Final

Antes de considerar la migración completa:

- [ ] Todos los endpoints funcionan correctamente
- [ ] Todos los componentes están migrados
- [ ] Todas las funcionalidades del sistema funcionan
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del servidor
- [ ] Pruebas de integración pasadas
- [ ] Datos migrados (si aplica)
- [ ] Sistema desplegado en producción
- [ ] Equipo capacitado
- [ ] Documentación completa

---

## 📞 Contacto

Si tienes dudas durante el proceso de migración, contacta a:

- **Frontend Lead:** [Nombre]
- **Backend Lead:** [Nombre]
- **Project Manager:** [Nombre]

---

**Última actualización:** Mayo 2026  
**Versión:** 1.0  
**Tiempo estimado total:** 2-3 semanas
