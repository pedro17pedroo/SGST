import { Router } from "express";
import { DigitalTwinController } from "./digital-twin.controller";

export const digitalTwinRoutes = Router();

// TODO: Reativar rotas quando DigitalTwinController for restaurado
// Warehouse zones management
digitalTwinRoutes.get('/zones/:warehouseId', DigitalTwinController.placeholder);
digitalTwinRoutes.post('/zones', DigitalTwinController.placeholder);
digitalTwinRoutes.put('/zones/:id', DigitalTwinController.placeholder);
digitalTwinRoutes.delete('/zones/:id', DigitalTwinController.placeholder);

// Warehouse layout management
digitalTwinRoutes.get('/layouts/:warehouseId', DigitalTwinController.placeholder);
digitalTwinRoutes.post('/layouts', DigitalTwinController.placeholder);
digitalTwinRoutes.put('/layouts/:id', DigitalTwinController.placeholder);
digitalTwinRoutes.delete('/layouts/:id', DigitalTwinController.placeholder);

// Digital twin simulations
digitalTwinRoutes.get('/simulations/:warehouseId', DigitalTwinController.placeholder);
digitalTwinRoutes.post('/simulations', DigitalTwinController.placeholder);
digitalTwinRoutes.get('/simulations/:id/status', DigitalTwinController.placeholder);
digitalTwinRoutes.post('/simulations/:id/run', DigitalTwinController.placeholder);

// Real-time visualization
digitalTwinRoutes.get('/visualization/:warehouseId', DigitalTwinController.placeholder);
digitalTwinRoutes.post('/visualization', DigitalTwinController.placeholder);

// 3D Warehouse viewer
digitalTwinRoutes.get('/viewer/:warehouseId', DigitalTwinController.placeholder);
digitalTwinRoutes.get('/heatmap/:warehouseId', DigitalTwinController.placeholder);