import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ShoppingCart, Coins, FileText, Wallet, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Badge } from "../ui/badge";

const salesData = [
  { name: "Lun", ventas: 0 },
  { name: "Mar", ventas: 0 },
  { name: "Mié", ventas: 0 },
  { name: "Jue", ventas: 0 },
  { name: "Vie", ventas: 0 },
  { name: "Sáb", ventas: 0 },
  { name: "Dom", ventas: 0 },
];

const productData = [
  { name: "Sin datos", cantidad: 0 },
];

// Simular datos de caja (esto debería venir de un contexto global o localStorage)
const getCajaStatus = () => {
  // Aquí verificamos si hay una caja abierta en el sistema
  const cajaAbierta = localStorage.getItem("cajaAbierta");
  return cajaAbierta === "true";
};

// Simular producto más vendido (esto debería calcularse desde las ventas reales)
const getProductoMasVendido = () => {
  // Por ahora retornamos un mensaje por defecto
  return {
    nombre: "Sin ventas hoy",
    cantidad: 0
  };
};

// Obtener total de ventas del día
const getVentasDelDia = () => {
  // Esto debería calcularse desde los comprobantes del día
  return {
    total: 0,
    cantidad: 0
  };
};

export function Dashboard() {
  const cajaAbierta = getCajaStatus();
  const productoMasVendido = getProductoMasVendido();
  const ventasDelDia = getVentasDelDia();

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del negocio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ventas del Día</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">S/ {ventasDelDia.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{ventasDelDia.cantidad} comprobantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Comprobantes Emitidos</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{ventasDelDia.cantidad}</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Producto Más Vendido Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg truncate">{productoMasVendido.nombre}</div>
            <p className="text-xs text-muted-foreground">
              {productoMasVendido.cantidad > 0 ? `${productoMasVendido.cantidad} unidades` : "Sin ventas"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Caja del Día</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge 
                variant={cajaAbierta ? "default" : "secondary"}
                className={cajaAbierta ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}
              >
                {cajaAbierta ? "ABIERTA" : "CERRADA"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {cajaAbierta ? "Operando normalmente" : "Debe abrir caja para operar"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`S/ ${value}`, "Ventas"]}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                />
                <Line type="monotone" dataKey="ventas" stroke="#ff8c00" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-4">
              💡 Los datos se actualizarán automáticamente con las ventas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} unidades`, "Vendido"]}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                />
                <Bar dataKey="cantidad" fill="#ffd700" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-4">
              💡 Los datos se actualizarán automáticamente con las ventas registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg mb-2">No hay actividad reciente</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Las acciones realizadas en el sistema (ventas, compras, movimientos de inventario) aparecerán aquí automáticamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍩</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Régimen Tributario</p>
                <p className="font-medium">RUS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Comprobante</p>
                <p className="font-medium">Boletas de Venta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sistema de Pago</p>
                <p className="font-medium">Efectivo, YAPE, PLIN</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}