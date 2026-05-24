import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import logoImage from "figma:asset/59d28967ce75ac74e6d8777b6505de4c2ba7cb58.png";
import { toast } from "sonner@2.0.3";

interface LoginProps {
  onLogin: (usuario: string, rol: "Administrador" | "Empleado") => void;
}

// Usuarios del sistema
const USUARIOS = [
  { usuario: "admin", contraseña: "admin123", rol: "Administrador" as const },
  { usuario: "empleado", contraseña: "emp123", rol: "Empleado" as const }
];

export function Login({ onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuario.trim()) {
      toast.error("Ingresa tu usuario");
      return;
    }
    
    if (!contraseña.trim()) {
      toast.error("Ingresa tu contraseña");
      return;
    }

    setIsLoading(true);

    // Simular tiempo de autenticación
    setTimeout(() => {
      const usuarioEncontrado = USUARIOS.find(
        u => u.usuario === usuario.toLowerCase() && u.contraseña === contraseña
      );

      if (usuarioEncontrado) {
        toast.success(`Bienvenido, ${usuarioEncontrado.rol}`);
        onLogin(usuarioEncontrado.usuario, usuarioEncontrado.rol);
      } else {
        toast.error("Usuario o contraseña incorrectos");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/20 shadow-lg p-6">
            <img src={logoImage} alt="HappyDonuts Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-muted-foreground">Sistema Administrativo</p>
        </div>

        {/* Formulario de login */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                className="bg-input-background"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-input-background"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2025 HappyDonuts. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
