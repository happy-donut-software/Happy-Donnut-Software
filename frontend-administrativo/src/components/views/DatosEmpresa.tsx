import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Building2, Save, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface DatosEmpresaType {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  logoUrl: string;
  regimen: "RUS";
  actividadEconomica: string;
}

const datosIniciales: DatosEmpresaType = {
  ruc: "20123456789",
  razonSocial: "HAPPY DONUTS E.I.R.L.",
  nombreComercial: "HappyDonuts",
  direccion: "Av. Principal 123, Lima, Perú",
  telefono: "01-234-5678",
  email: "contacto@happydonuts.pe",
  web: "www.happydonuts.pe",
  logoUrl: "",
  regimen: "RUS",
  actividadEconomica: "Venta de donas y bebidas"
};

export default function DatosEmpresa() {
  const [datos, setDatos] = useState<DatosEmpresaType>(datosIniciales);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (!datos.ruc.trim()) {
      toast.error("El RUC es obligatorio");
      return;
    }
    if (!datos.razonSocial.trim()) {
      toast.error("La razón social es obligatoria");
      return;
    }
    if (datos.ruc.length !== 11) {
      toast.error("El RUC debe tener 11 dígitos");
      return;
    }

    setIsEditing(false);
    toast.success("Datos de la empresa actualizados exitosamente");
  };

  const handleCancel = () => {
    setDatos(datosIniciales);
    setIsEditing(false);
  };

  const updateDato = (field: keyof DatosEmpresaType, value: string) => {
    setDatos({ ...datos, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Datos de la Empresa</h1>
          <p className="text-muted-foreground">
            Configuración de la información de tu empresa
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Editar Información
          </Button>
        )}
      </div>

      {/* Tarjeta Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RUC y Razón Social */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                value={datos.ruc}
                onChange={(e) => updateDato("ruc", e.target.value)}
                disabled={!isEditing}
                placeholder="20123456789"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                id="razonSocial"
                value={datos.razonSocial}
                onChange={(e) => updateDato("razonSocial", e.target.value)}
                disabled={!isEditing}
                placeholder="HAPPY DONUTS E.I.R.L."
              />
            </div>
          </div>

          {/* Nombre Comercial y Régimen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreComercial">Nombre Comercial</Label>
              <Input
                id="nombreComercial"
                value={datos.nombreComercial}
                onChange={(e) => updateDato("nombreComercial", e.target.value)}
                disabled={!isEditing}
                placeholder="HappyDonuts"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regimen">Régimen Tributario</Label>
              <Input
                id="regimen"
                value="RUS - Régimen Único Simplificado"
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este sistema está configurado exclusivamente para empresas bajo el Régimen Único Simplificado (RUS)
              </p>
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección Fiscal</Label>
            <Textarea
              id="direccion"
              value={datos.direccion}
              onChange={(e) => updateDato("direccion", e.target.value)}
              disabled={!isEditing}
              placeholder="Av. Principal 123, Lima, Perú"
              rows={2}
            />
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={datos.telefono}
                onChange={(e) => updateDato("telefono", e.target.value)}
                disabled={!isEditing}
                placeholder="01-234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={datos.email}
                onChange={(e) => updateDato("email", e.target.value)}
                disabled={!isEditing}
                placeholder="contacto@happydonuts.pe"
              />
            </div>
          </div>

          {/* Web y Actividad Económica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="web">Sitio Web</Label>
              <Input
                id="web"
                value={datos.web}
                onChange={(e) => updateDato("web", e.target.value)}
                disabled={!isEditing}
                placeholder="www.happydonuts.pe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actividadEconomica">Actividad Económica</Label>
              <Input
                id="actividadEconomica"
                value={datos.actividadEconomica}
                onChange={(e) => updateDato("actividadEconomica", e.target.value)}
                disabled={!isEditing}
                placeholder="Venta de donas y bebidas"
              />
            </div>
          </div>

          {/* Logo (solo visual, sin funcionalidad real) */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="logo">Logo de la Empresa</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Logo
                </Button>
                <span className="text-sm text-muted-foreground">
                  Formatos aceptados: PNG, JPG (máx. 2MB)
                </span>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          {isEditing && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <p>• Los datos de la empresa aparecerán en todos los comprobantes emitidos.</p>
            <p>• El RUC debe ser válido y estar activo en SUNAT.</p>
            <p>• Este sistema está diseñado exclusivamente para empresas bajo el Régimen Único Simplificado (RUS).</p>
            <p>• Bajo el régimen RUS, solo se emiten boletas de venta sin IGV desglosado.</p>
            <p>• Verifica que todos los datos sean correctos antes de guardar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
