import { 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  ShoppingBag,
  Settings,
  Phone,
  LogOut,
  ChevronDown,
  Home,
  Wallet,
  Tag
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userRole: "Administrador" | "Empleado";
}

export function AppSidebar({ currentView, onNavigate, onLogout, userRole }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground text-xl">🍩</span>
          </div>
          <div>
            <h2 className="text-sidebar-foreground">HappyDonuts</h2>
            <p className="text-xs text-muted-foreground">Sistema Administrativo</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => onNavigate('dashboard')}
                isActive={currentView === 'dashboard'}
              >
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* VENTAS */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ShoppingCart />
                      <span>Ventas</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('comprobantes')}
                          isActive={currentView === 'comprobantes'}
                        >
                          Comprobantes
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('nuevo-comprobante')}
                          isActive={currentView === 'nuevo-comprobante'}
                        >
                          Nuevo Comprobante
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* INVENTARIO - Solo Administrador */}
              {userRole === "Administrador" && (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Package />
                        <span>Inventario</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('productos')}
                            isActive={currentView === 'productos'}
                          >
                            Mostrar Productos
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('categorias')}
                            isActive={currentView === 'categorias'}
                          >
                            Categorías
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('notas-entrada')}
                            isActive={currentView === 'notas-entrada'}
                          >
                            Notas de Entrada
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('nueva-nota-entrada')}
                            isActive={currentView === 'nueva-nota-entrada'}
                          >
                            Generar Nota de Entrada
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('notas-salida')}
                            isActive={currentView === 'notas-salida'}
                          >
                            Notas de Salida
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('nueva-nota-salida')}
                            isActive={currentView === 'nueva-nota-salida'}
                          >
                            Generar Nota de Salida
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Inventario - Solo para Empleado (Solo lectura de productos) */}
              {userRole === "Empleado" && (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Package />
                        <span>Inventario</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('productos')}
                            isActive={currentView === 'productos'}
                          >
                            Ver Productos
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('notas-salida')}
                            isActive={currentView === 'notas-salida'}
                          >
                            Notas de Salida
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('nueva-nota-salida')}
                            isActive={currentView === 'nueva-nota-salida'}
                          >
                            Generar Nota de Salida
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* CLIENTES Y PROVEEDORES - Solo Administrador */}
              {userRole === "Administrador" && (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Users />
                        <span>Clientes y Proveedores</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('clientes-proveedores')}
                            isActive={currentView === 'clientes-proveedores'}
                          >
                            Mostrar Todos
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* COMPRAS - Solo Administrador */}
              {userRole === "Administrador" && (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <ShoppingBag />
                        <span>Compras</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('compras')}
                            isActive={currentView === 'compras'}
                          >
                            Mostrar Todas
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('nueva-compra')}
                            isActive={currentView === 'nueva-compra'}
                          >
                            Nueva Compra
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* PROMOCIONES - Solo Administrador */}
              {userRole === "Administrador" && (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Tag />
                        <span>Promociones</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('promociones')}
                            isActive={currentView === 'promociones'}
                          >
                            Mostrar Promociones
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            onClick={() => onNavigate('nueva-promocion')}
                            isActive={currentView === 'nueva-promocion'}
                          >
                            Nueva Promoción
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* CAJA */}
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Wallet />
                      <span>Caja</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('apertura-caja')}
                          isActive={currentView === 'apertura-caja'}
                        >
                          Apertura de Caja
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('movimientos-caja')}
                          isActive={currentView === 'movimientos-caja'}
                        >
                          Movimientos del Día
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('registrar-egreso')}
                          isActive={currentView === 'registrar-egreso'}
                        >
                          Registrar Egreso
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('cierre-caja')}
                          isActive={currentView === 'cierre-caja'}
                        >
                          Cierre de Caja
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('historial-cierres')}
                          isActive={currentView === 'historial-cierres'}
                        >
                          Historial de Cierres
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* CONFIGURACIÓN - Solo Administrador */}
              {userRole === "Administrador" && (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Settings />
                        <span>Configuración</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('datos-empresa')}
                          isActive={currentView === 'datos-empresa'}
                        >
                          Datos de la Empresa
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('usuarios')}
                          isActive={currentView === 'usuarios'}
                        >
                          Usuarios del Sistema
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onNavigate('locales')}
                          isActive={currentView === 'locales'}
                        >
                          Locales
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              )}

              {/* SOPORTE */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onNavigate('soporte')}
                  isActive={currentView === 'soporte'}
                >
                  <Phone />
                  <span>Soporte</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} className="w-full">
              <LogOut />
              <span>Salir</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}