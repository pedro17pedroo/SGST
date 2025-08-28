import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="min-h-screen bg-background" data-testid="reports-page">
      <Header title="Relatórios" breadcrumbs={["Relatórios"]} />
      
      <div className="p-6">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Módulo de Relatórios
          </h3>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento
          </p>
        </Card>
      </div>
    </div>
  );
}
