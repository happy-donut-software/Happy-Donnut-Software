import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import logoImage from "figma:asset/59d28967ce75ac74e6d8777b6505de4c2ba7cb58.png";
import { toast } from "sonner";

// IMPORTAMOS LA NUEVA CONFIGURACIÓN
import { API_CONFIG, buildURL } from "../../src/config/api.config"; 

interface LoginProps {
  onLogin: (usuario: string, rol: "Administrador" | "Empleado") => void;
}

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
      // 1. Construimos la URL dinámica usando nuestro helper
      const url = buildURL(API_CONFIG.services.usuarios, API_CONFIG.endpoints.auth.login);
      
      console.log('Intentando login en:', url);
      
      // 2. Hacemos la petición
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Importante para que Laravel devuelva JSON en caso de error de validación
        },
        body: JSON.stringify({
          email: usuario,
          password: contraseña
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Guardar token y perfil del usuario
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
          // Opcional: guardar los datos del usuario para mostrarlos en el Dashboard
          if (data.usuario) {
            localStorage.setItem('user_profile', JSON.stringify(data.usuario));
          }
        }
        
        // Usamos el nombre real del backend si viene, sino el correo
        const nombreMostrar = data.usuario?.nombre || usuario;
        toast.success(`Bienvenido, ${nombreMostrar}`);
        
        // 4. Adaptamos el rol del backend ("admin", "cajero") al que espera tu prop onLogin
        const rolAsignado = data.usuario?.rol === 'admin' ? "Administrador" : "Empleado";
        onLogin(usuario, rolAsignado);

      } else {
        // Mostramos el error exacto que envía Laravel (o uno genérico)
        toast.error(data.message || data.error || "Usuario o contraseña incorrectos");
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
          © 2026 HappyDonuts. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}