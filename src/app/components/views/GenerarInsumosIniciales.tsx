import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Database, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export function GenerarInsumosIniciales() {
  const [generado, setGenerado] = useState(false);

  const generarInsumos = () => {
    const insumosIniciales = [
      // Categoría: Vasos
      {
        id: 1,
        categoria: "Vasos",
        nombre: "Frappe 16oz",
        unidadMedida: "und",
        cantidad: 150,
        estado: "Disponible",
      },
      {
        id: 2,
        categoria: "Vasos",
        nombre: "Frappe 10oz",
        unidadMedida: "und",
        cantidad: 200,
        estado: "Disponible",
      },
      // Categoría: Bebidas
      {
        id: 3,
        categoria: "Bebidas",
        nombre: "Cafe",
        unidadMedida: "gr",
        cantidad: 5000,
        estado: "Disponible",
      },
      {
        id: 4,
        categoria: "Bebidas",
        nombre: "Te",
        unidadMedida: "und",
        cantidad: 50,
        estado: "Disponible",
      },
      {
        id: 5,
        categoria: "Bebidas",
        nombre: "Manzanilla",
        unidadMedida: "und",
        cantidad: 40,
        estado: "Disponible",
      },
      {
        id: 6,
        categoria: "Bebidas",
        nombre: "Anis",
        unidadMedida: "und",
        cantidad: 35,
        estado: "Disponible",
      },
      {
        id: 7,
        categoria: "Bebidas",
        nombre: "Agua",
        unidadMedida: "ml",
        cantidad: 30000,
        estado: "Disponible",
      },
      {
        id: 8,
        categoria: "Bebidas",
        nombre: "Gaseosa",
        unidadMedida: "ml",
        cantidad: 25000,
        estado: "Disponible",
      },
    ];

    // Guardar en localStorage
    localStorage.setItem("insumos", JSON.stringify(insumosIniciales));

    setGenerado(true);
    toast.success("Insumos generados exitosamente. Recarga la página para ver los cambios.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Generar Insumos Iniciales</h1>
        <p className="text-muted-foreground">
          Herramienta para generar los insumos iniciales en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>📦 Insumos a Generar</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div>
              <p className="font-medium text-orange-500 mb-2">Categoría: Vasos</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Frappe 16oz - 150 und</li>
                <li>Frappe 10oz - 200 und</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-orange-500 mb-2">Categoría: Bebidas</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Cafe - 5000 gr (5 kg)</li>
                <li>Te - 50 und</li>
                <li>Manzanilla - 40 und</li>
                <li>Anis - 35 und</li>
                <li>Agua - 30000 ml (30 litros)</li>
                <li>Gaseosa - 25000 ml (25 litros)</li>
              </ul>
            </div>
          </div>

          {!generado ? (
            <Button onClick={generarInsumos} size="lg" className="w-full">
              <Database className="mr-2 h-5 w-5" />
              Generar Insumos
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  ¡Insumos generados exitosamente!
                </p>
                <p className="text-sm text-green-700">
                  Recarga la página para ver los insumos en el módulo de Inventario → Insumos.
                </p>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm">
            <p className="font-medium text-amber-900 mb-1">⚠️ Nota importante:</p>
            <p className="text-amber-700">
              Esto sobrescribirá todos los insumos existentes en el localStorage. Todos los
              insumos comenzarán con cantidad 0 y estado "Disponible".
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-1">💡 Después de generar:</p>
            <p className="text-blue-700">
              1. Recarga la página (F5)<br />
              2. Ve a Inventario → Insumos<br />
              3. Usa "Generar Nota de Entrada" para agregar cantidades iniciales
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
