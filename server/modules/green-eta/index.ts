import { Express } from 'express';
import { BaseModule } from "../base/module.interface";
import { ModuleConfig } from "../../config/modules";
import { greenEtaRoutes } from "./green-eta.routes";

export class GreenETAModule extends BaseModule {
  config: ModuleConfig = {
    id: "green_eta",
    name: "Green ETA",
    description: "Sistema de otimização sustentável com redução de pegada de carbono",
    enabled: true,
    dependencies: ["shipping", "warehouses", "orders"],
    routes: ["/api/green-eta"],
    tables: ["carbon_metrics", "eco_routes", "sustainability_reports"],
    permissions: ["green_eta.read", "green_eta.optimize", "green_eta.report"]
  };

  async register(app: Express): Promise<void> {
    app.use("/api/green-eta", greenEtaRoutes);
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }
}

export const greenETAModule = new GreenETAModule();