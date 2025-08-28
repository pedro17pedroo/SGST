import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-background" data-testid="shipping-page">
      <Header title="Expedição" breadcrumbs={["Expedição"]} />
      
      <div className="p-6">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Módulo de Expedição
          </h3>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento
          </p>
        </Card>
      </div>
    </div>
  );
}
