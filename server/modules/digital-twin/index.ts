import { Express } from 'express';
import { BaseModule } from "../base/module.interface";
import { ModuleConfig } from "../../config/modules";
import { digitalTwinRoutes } from "./digital-twin.routes";

export class DigitalTwinModule extends BaseModule {
  config: ModuleConfig = {
    id: "digital_twin",
    name: "Digital Twin Operacional",
    description: "Sistema de visualização 3D/2D do armazém com simulação e análise em tempo real",
    enabled: true,
    dependencies: ["warehouses", "rtls_hybrid"],
    routes: ["/api/digital-twin"],
    tables: ["warehouse_zones", "warehouse_layout", "digital_twin_simulations", "real_time_visualization"],
    permissions: ["digital_twin.read", "digital_twin.write", "digital_twin.simulate"]
  };

  async register(app: Express): Promise<void> {
    app.use("/api/digital-twin", digitalTwinRoutes);
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }
}

export const digitalTwinModule = new DigitalTwinModule();