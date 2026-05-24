# ⚡ Inicio Rápido - HappyDonuts

## 🚀 Instalación en 3 Pasos

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Iniciar Servidor

```bash
npm run dev
```

### 3️⃣ Abrir en Navegador

Abre: **http://localhost:3000**

---

## 👥 Credenciales de Acceso

### 👔 Administrador (acceso completo)
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### 👤 Empleado (acceso limitado)
- **Usuario:** `empleado`
- **Contraseña:** `emp123`

---

## 📱 Módulos Disponibles

| Módulo | Administrador | Empleado |
|--------|---------------|----------|
| 🏠 Dashboard | ✅ | ✅ |
| 🛒 Ventas | ✅ | ✅ |
| 📦 Inventario | ✅ | 👁️ (solo lectura) |
| 📥 Notas de Entrada | ✅ | ❌ |
| 📤 Notas de Salida | ✅ | ✅ |
| 👥 Clientes/Proveedores | ✅ | ❌ |
| 🛍️ Compras | ✅ | ❌ |
| 🎁 Promociones | ✅ | ❌ |
| 💰 Caja | ✅ | ✅ |
| ⚙️ Configuración | ✅ | ❌ |
| 📞 Soporte | ✅ | ✅ |

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor
npm run build            # Build de producción
npm run preview          # Preview del build

# Utilidades
npm run type-check       # Verificar tipos TypeScript
npm run clean            # Limpiar node_modules y build
npm run reset            # Limpiar y reinstalar todo
```

---

## 📚 Documentación

¿Primera vez? Lee esto:

1. **[README.md](README.md)** - Visión general del proyecto
2. **[SETUP.md](docs/SETUP.md)** - Instalación detallada
3. **[ESTRUCTURA.md](docs/ESTRUCTURA.md)** - Entender la arquitectura

¿Vas a desarrollar? Lee esto:

4. **[API-REFERENCE.md](docs/API-REFERENCE.md)** - Cómo usar los servicios
5. **[BACKEND-INTEGRATION.md](docs/BACKEND-INTEGRATION.md)** - Conectar con backend

---

## 🔄 Flujo de Trabajo Típico

### Abrir Caja (Administrador/Empleado)

1. Login con tus credenciales
2. Ir a **Caja** → **Apertura de Caja**
3. Ingresar fondo inicial
4. Clic en **Abrir Caja**

### Realizar una Venta (Administrador/Empleado)

1. Asegúrate que la caja esté abierta
2. Ir a **Ventas** → **Nuevo Comprobante**
3. Agregar productos
4. Seleccionar método de pago
5. Clic en **Generar Comprobante**

### Crear una Nota de Entrada (Solo Administrador)

1. Ir a **Inventario** → **Notas de Entrada**
2. Clic en **Nueva Nota**
3. Seleccionar motivo
4. Agregar productos/insumos
5. Guardar

### Cerrar Caja (Administrador/Empleado)

1. Ir a **Caja** → **Cierre de Caja**
2. Ingresar montos contados
3. Verificar diferencias
4. Clic en **Cerrar Caja**

---

## 💡 Tips Rápidos

- 💾 **Datos persistentes**: Todo se guarda automáticamente en localStorage
- 🔄 **Recarga segura**: Puedes recargar la página sin perder datos
- 🚫 **Sin backend**: Funciona 100% en el navegador (no necesita internet)
- 🔐 **Roles**: El sistema controla los permisos automáticamente

---

## ⚠️ Solución Rápida de Problemas

### Puerto 3000 ocupado

```bash
PORT=3001 npm run dev
```

### Error de dependencias

```bash
rm -rf node_modules
npm install
```

### Estilos no cargan

```bash
rm -rf node_modules/.cache
npm install
npm run dev
```

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa la **[documentación completa](docs/)**
2. Consulta **[REORGANIZACION-COMPLETADA.md](REORGANIZACION-COMPLETADA.md)** para entender los cambios
3. Lee los comentarios en el código fuente

---

## 🎯 Siguientes Pasos

Una vez que el sistema funcione:

1. ✅ Explora todos los módulos
2. ✅ Prueba crear productos, ventas y movimientos de caja
3. ✅ Lee la arquitectura en [ESTRUCTURA.md](docs/ESTRUCTURA.md)
4. ✅ Si vas a desarrollar, lee [API-REFERENCE.md](docs/API-REFERENCE.md)

---

**¡Listo para empezar!** 🍩

Para más información: **[README.md](README.md)**
