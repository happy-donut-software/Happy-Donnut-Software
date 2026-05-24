import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { RefreshCw, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export function ResetCategorias() {
  const [reseted, setReseted] = useState(false);

  const resetearCategorias = () => {
    // Definir las nuevas categorías
    const categoriasIniciales = [
      {
        id: 1,
        tipo: "Producto",
        nombre: "Donas",
        descripcion: "Donas de diversos sabores y estilos",
        itemsCount: 0,
        estado: "Activa",
      },
      {
        id: 2,
        tipo: "Producto",
        nombre: "Frapes",
        descripcion: "Frapes, bebidas frías y batidos",
        itemsCount: 0,
        estado: "Activa",
      },
      {
        id: 3,
        tipo: "Insumo",
        nombre: "Vasos",
        descripcion: "Vasos y envases para bebidas",
        itemsCount: 0,
        estado: "Activa",
      },
      {
        id: 4,
        tipo: "Insumo",
        nombre: "Bebidas",
        descripcion: "Insumos para bebidas: café, leche, agua, etc.",
        itemsCount: 0,
        estado: "Activa",
      },
    ];

    // Guardar en localStorage
    localStorage.setItem("categorias", JSON.stringify(categoriasIniciales));

    setReseted(true);
    toast.success("Categorías reseteadas exitosamente. Recarga la página para ver los cambios.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Resetear Categorías</h1>
        <p className="text-muted-foreground">
          Herramienta temporal para resetear las categorías a los nuevos valores predeterminados
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>⚠️ Atención</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Este proceso reseteará las categorías en el localStorage a los siguientes valores:
          </p>

          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div>
              <p className="font-medium text-primary mb-2">Categorías de Producto:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Donas</li>
                <li>Frapes</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-orange-500 mb-2">Categorías de Insumo:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Vasos</li>
                <li>Bebidas</li>
              </ul>
            </div>
          </div>

          {!reseted ? (
            <Button onClick={resetearCategorias} size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Resetear Categorías
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  ¡Categorías reseteadas exitosamente!
                </p>
                <p className="text-sm text-green-700">
                  Recarga la página para ver los cambios en el módulo de Categorías.
                </p>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm">
            <p className="font-medium text-amber-900 mb-1">Nota:</p>
            <p className="text-amber-700">
              Este componente es temporal y debe ser eliminado después de resetear las
              categorías.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
