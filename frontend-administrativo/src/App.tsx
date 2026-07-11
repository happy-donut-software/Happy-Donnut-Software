import { useState, useEffect } from "react"; // 👈 Aseguramos que useEffect esté importado arriba
import { Dashboard } from "./components/views/Dashboard";
import { Comprobantes } from "./components/views/Comprobantes";
import { NuevoComprobante } from "./components/views/NuevoComprobante";
import { ProductosSimple } from "./components/views/ProductosSimple";
import { Compras } from "./components/views/Compras";
import { NuevaCompra } from "./components/views/NuevaCompra";
import { Promociones } from "./components/views/Promociones";
import { NuevaPromocion } from "./components/views/NuevaPromocion";
import NotasEntrada from "./components/views/NotasEntrada";
import NuevaNotaEntrada from "./components/views/NuevaNotaEntrada";
import NotasSalida from "./components/views/NotasSalida";
import NuevaNotaSalida from "./components/views/NuevaNotaSalida";
import { ClientesProveedores } from "./components/views/ClientesProveedores";
import { Categorias } from "./components/views/Categorias";
import { AperturaCaja } from "./components/views/AperturaCaja";
import { MovimientosCaja } from "./components/views/MovimientosCaja";
import { RegistrarEgreso } from "./components/views/RegistrarEgreso";
import { CierreCaja } from "./components/views/CierreCaja";
import { HistorialCierres } from "./components/views/HistorialCierres";
import DatosEmpresa from "./components/views/DatosEmpresa";
import Usuarios from "./components/views/Usuarios";
import Locales from "./components/views/Locales";
import { Soporte } from "./components/views/Soporte";
import { PlaceholderView } from "./components/views/PlaceholderView";
import { Login } from "./components/views/Login";
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

// Importamos la configuración y helper globales
import { API_CONFIG, buildURL } from "./src/config/api.config"; 

export default function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [userRole, setUserRole] = useState<"Administrador" | "Empleado">("Empleado");
  
  // Estados de carga e inicio de validación
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Efecto principal de validación de Sesión (/me)
  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setShowLogin(true);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const url = buildURL(API_CONFIG.services.usuarios, API_CONFIG.endpoints.auth.me);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('user_profile', JSON.stringify(data.usuario));
          
          // Asignamos la información a los estados originales del Dashboard
          setCurrentUser(data.usuario.nombre);
          const rolVisual = data.usuario.rol === 'admin' ? "Administrador" : "Empleado";
          setUserRole(rolVisual);
          
          // ¡Paso clave! Apagamos el login para dar paso al backend
          setShowLogin(false);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_profile');
          setShowLogin(true);
        }
      } catch (error) {
        console.error("Error verificando sesión", error);
        setShowLogin(true);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verificarSesion();
  }, []);

  const handleLogin = (usuario: string, rol: "Administrador" | "Empleado") => {    setCurrentUser(usuario);
    setUserRole(rol);
    setShowLogin(false);  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
    
    setShowLogin(true);
    setCurrentView("dashboard");
    setShowLogoutDialog(false);
    setCurrentUser("");
    setUserRole("Empleado");
  };

  const renderView = () => {
    const isAdmin = userRole === "Administrador";
    
    switch (currentView) {
      case "dashboard": return <Dashboard />;
      case "comprobantes": return <Comprobantes />;
      case "nuevo-comprobante": return <NuevoComprobante />;
      case "productos": return <ProductosSimple />;
      case "categorias": return isAdmin ? <Categorias /> : <Dashboard />;
      case "notas-entrada": return isAdmin ? <NotasEntrada /> : <Dashboard />;
      case "nueva-nota-entrada": return isAdmin ? <NuevaNotaEntrada /> : <Dashboard />;
      case "notas-salida": return <NotasSalida />;
      case "nueva-nota-salida": return <NuevaNotaSalida />;
      case "clientes-proveedores": return isAdmin ? <ClientesProveedores /> : <Dashboard />;
      case "compras": return isAdmin ? <Compras /> : <Dashboard />;
      case "nueva-compra": return isAdmin ? <NuevaCompra /> : <Dashboard />;
      case "promociones": return isAdmin ? <Promociones /> : <Dashboard />;
      case "nueva-promocion": return isAdmin ? <NuevaPromocion /> : <Dashboard />;
      case "apertura-caja": return <AperturaCaja />;
      case "movimientos-caja": return <MovimientosCaja />;
      case "registrar-egreso": return <RegistrarEgreso />;
      case "cierre-caja": return <CierreCaja />;
      case "historial-cierres": return <HistorialCierres />;
      case "datos-empresa": return isAdmin ? <DatosEmpresa /> : <Dashboard />;
      case "usuarios": return isAdmin ? <Usuarios /> : <Dashboard />;
      case "locales": return isAdmin ? <Locales /> : <Dashboard />;
      case "soporte": return <Soporte />;
      default: return <Dashboard />;
    }
  };

  // 1. PRIMER CONTROL: Si la app está verificando la firma con el Backend, congelamos la interfaz
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Cargando sistema Happy Donut...
      </div>
    );
  }

  // 2. SEGUNDO CONTROL: Si ya terminó de cargar y determinó que debe mostrar el Login
  if (showLogin) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // 3. RENDERIZADO FINAL: El sistema completo para usuarios con token verificado
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