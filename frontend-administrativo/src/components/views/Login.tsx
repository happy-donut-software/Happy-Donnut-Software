import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import logoImage from "figma:asset/59d28967ce75ac74e6d8777b6505de4c2ba7cb58.png";
import { toast } from "sonner";

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuario.trim()) {
      toast.error("Ingresa tu correo");
      return;
    }
    
    if (!contraseña.trim()) {
      toast.error("Ingresa tu contraseña");
      return;
    }

    setIsLoading(true);

    try {
      console.log('Intentando login con:', { email: usuario, password: '***' });
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: usuario,
          password: contraseña
        })
      });

      console.log('Respuesta status:', response.status);
      const data = await response.json();
      console.log('Respuesta data:', data);

      if (response.ok) {
        // Guardar token real del auth service
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
          console.log('Token guardado:', data.access_token);
        }
        
        toast.success(`Bienvenido, ${usuario}`);
        console.log('Llamando a onLogin...');
        onLogin(usuario, "Administrador");
      } else {
        toast.error(data.message || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error('Error de login:', error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
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
              <Label htmlFor="usuario">Correo</Label>
              <Input
                id="usuario"
                type="email"
                placeholder="Ingresa tu correo"
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
