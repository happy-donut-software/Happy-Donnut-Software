import { useState } from "react";
import { Dashboard } from "./components/views/Dashboard";
import { Comprobantes } from "./components/views/Comprobantes";
import { NuevoComprobante } from "./components/views/NuevoComprobante";
import { Productos } from "./components/views/Productos";
import { Promociones } from "./components/views/Promociones";
import { NuevaPromocion } from "./components/views/NuevaPromocion";
import NotasEntrada from "./components/views/NotasEntrada";
import NuevaNotaEntrada from "./components/views/NuevaNotaEntrada";
import NotasSalida from "./components/views/NotasSalida";
import NuevaNotaSalida from "./components/views/NuevaNotaSalida";
import { Clientes } from "./components/views/Clientes";
import { Categorias } from "./components/views/Categorias";
import { Insumos } from "./components/views/Insumos";
import { AperturaCaja } from "./components/views/AperturaCaja";
import { MovimientosCaja } from "./components/views/MovimientosCaja";
import { RegistrarEgreso } from "./components/views/RegistrarEgreso";
import { CierreCaja } from "./components/views/CierreCaja";
import { HistorialCierres } from "./components/views/HistorialCierres";
import DatosEmpresa from "./components/views/DatosEmpresa";
import Usuarios from "./components/views/Usuarios";
import { Soporte } from "./components/views/Soporte";
import { PlaceholderView } from "./components/views/PlaceholderView";
import { Login } from "./components/views/Login";
import { ResetCategorias } from "./components/views/ResetCategorias";
import { GenerarInsumosIniciales } from "./components/views/GenerarInsumosIniciales";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";

export default function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [userRole, setUserRole] = useState<"Administrador" | "Empleado">("Empleado");

  const handleLogin = (usuario: string, rol: "Administrador" | "Empleado") => {
    setCurrentUser(usuario);
    setUserRole(rol);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogin(true);
    setCurrentView("dashboard");
    setShowLogoutDialog(false);
    setCurrentUser("");
    setUserRole("Empleado");
  };

  const renderView = () => {
    // Verificar permisos según el rol
    const isAdmin = userRole === "Administrador";
    
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      
      // VENTAS - Ambos roles
      case "comprobantes":
        return <Comprobantes />;
      case "nuevo-comprobante":
        return <NuevoComprobante />;
      
      // INVENTARIO - Admin (edición) / Empleado (solo lectura)
      case "productos":
        return <Productos userRole={userRole} />;
      case "categorias":
        return isAdmin ? <Categorias /> : <Dashboard />;
      case "insumos":
        return <Insumos userRole={userRole} />;
      
      // NOTAS DE ENTRADA - Solo Admin
      case "notas-entrada":
        return isAdmin ? <NotasEntrada /> : <Dashboard />;
      case "nueva-nota-entrada":
        return isAdmin ? <NuevaNotaEntrada /> : <Dashboard />;
      
      // NOTAS DE SALIDA - Ambos roles
      case "notas-salida":
        return <NotasSalida />;
      case "nueva-nota-salida":
        return <NuevaNotaSalida />;
      
      // CLIENTES - Solo Admin
      case "clientes":
        return isAdmin ? <Clientes /> : <Dashboard />;
      
      // PROMOCIONES - Admin (edición) / Empleado (solo lectura)
      case "promociones":
        return <Promociones userRole={userRole} />;
      case "nueva-promocion":
        return isAdmin ? <NuevaPromocion /> : <Dashboard />;
      
      // CAJA - Ambos roles
      case "apertura-caja":
        return <AperturaCaja />;
      case "movimientos-caja":
        return <MovimientosCaja />;
      case "registrar-egreso":
        return <RegistrarEgreso />;
      case "cierre-caja":
        return <CierreCaja />;
      case "historial-cierres":
        return <HistorialCierres />;
      
      // CONFIGURACIÓN - Solo Admin
      case "datos-empresa":
        return isAdmin ? <DatosEmpresa /> : <Dashboard />;
      case "usuarios":
        return isAdmin ? <Usuarios /> : <Dashboard />;

      // SOPORTE - Ambos roles
      case "soporte":
        return <Soporte />;

      // TEMPORAL: Reset Categorías
      case "reset-categorias":
        return <ResetCategorias />;

      // TEMPORAL: Generar Insumos Iniciales
      case "generar-insumos":
        return <GenerarInsumosIniciales />;

      default:
        return <Dashboard />;
    }
  };

  // Mostrar la pantalla de login
  if (showLogin) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Mostrar el sistema completo
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar 
          currentView={currentView} 
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          userRole={userRole}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="border-b bg-card sticky top-0 z-10">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg">HappyDonuts - Sistema Administrativo</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm">{currentUser}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {renderView()}
          </div>
        </main>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar Sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas salir del sistema? Se perderán los cambios no guardados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Salir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </SidebarProvider>
  );
}