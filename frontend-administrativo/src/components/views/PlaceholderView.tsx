import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Construction } from "lucide-react";

interface PlaceholderViewProps {
  title: string;
  description: string;
}

export function PlaceholderView({ title, description }: PlaceholderViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Esta sección está en construcción.<br />
            Pronto estará disponible con todas sus funcionalidades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
