import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Mail, Phone, MessageSquare } from "lucide-react";
import { Badge } from "../ui/badge";

const equipoScrum = [
  {
    nombre: "Carlos Leonel Acero Copaja",
    rol: "Development Team",
    email: "carlos.acero@happydonuts.com",
    telefono: "+51 987 123 456",
    color: "bg-blue-600"
  },
  {
    nombre: "Royfrankly Anthony Navarro Quenta",
    rol: "Scrum Master",
    email: "royfrankly.navarro@happydonuts.com",
    telefono: "+51 987 234 567",
    color: "bg-purple-600"
  },
  {
    nombre: "Hassan Aramis Claros Flores",
    rol: "Product Owner",
    email: "hassan.claros@happydonuts.com",
    telefono: "+51 987 345 678",
    color: "bg-orange-600"
  },
  {
    nombre: "Alexander Joel Ccoapaza Quispe",
    rol: "Development Team",
    email: "alexander.ccoapaza@happydonuts.com",
    telefono: "+51 987 456 789",
    color: "bg-blue-600"
  },
  {
    nombre: "Jhon Alexander Arocutipa Quispe",
    rol: "Development Team",
    email: "jhon.arocutipa@happydonuts.com",
    telefono: "+51 987 567 890",
    color: "bg-blue-600"
  },
  {
    nombre: "Jhon Sebastian Mamani Ancco",
    rol: "Development Team",
    email: "jhon.mamani@happydonuts.com",
    telefono: "+51 987 678 901",
    color: "bg-blue-600"
  }
];

export function Soporte() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Soporte Técnico</h1>
        <p className="text-muted-foreground">Equipo de desarrollo y metodología Scrum</p>
      </div>

      {/* Equipo Scrum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Equipo Scrum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipoScrum.map((miembro, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{miembro.nombre}</h4>
                    <Badge className={`${miembro.color} text-white hover:${miembro.color} mt-2`}>
                      {miembro.rol}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <a 
                        href={`mailto:${miembro.email}`} 
                        className="text-primary hover:underline break-all"
                      >
                        {miembro.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`tel:${miembro.telefono.replace(/\s/g, '')}`}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {miembro.telefono}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preguntas Frecuentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Preguntas Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h4>¿Cómo generar un nuevo comprobante?</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Dirígete a Ventas → Nuevo Comprobante, completa la información del cliente y agrega los productos.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4>¿Cómo agregar un nuevo producto?</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Ve a Inventario → Productos → Nuevo Producto y completa los datos requeridos como nombre, categoría y precio.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4>¿Qué es un Scrum Master?</h4>
              <p className="text-sm text-muted-foreground mt-2">
                El Scrum Master es el facilitador del equipo Scrum. Se encarga de asegurar que el equipo siga las prácticas y valores de Scrum, elimina impedimentos, facilita las reuniones y protege al equipo de interrupciones externas. Actúa como líder servicial del equipo.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4>¿Qué es un Product Owner?</h4>
              <p className="text-sm text-muted-foreground mt-2">
                El Product Owner es el responsable de maximizar el valor del producto. Define las características del producto, prioriza el Product Backlog, toma decisiones sobre qué construir y cuándo lanzarlo. Es la voz del cliente y los stakeholders dentro del equipo.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4>¿Qué es el Development Team?</h4>
              <p className="text-sm text-muted-foreground mt-2">
                El Development Team (Equipo de Desarrollo) está compuesto por profesionales que realizan el trabajo de entregar un incremento de producto "Terminado" que potencialmente se pueda poner en producción al final de cada Sprint. Son auto-organizados, multifuncionales y responsables de transformar el Product Backlog en incrementos de funcionalidad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
