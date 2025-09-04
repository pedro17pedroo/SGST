import { Router } from "express";
import { DigitalTwinController } from "./digital-twin.controller";
import { requireAuth, requireRole } from '../auth/auth.middleware';

export const digitalTwinRoutes = Router();

// Middleware de autenticação para todas as rotas do digital twin
digitalTwinRoutes.use(requireAuth);

// Warehouse zones management
digitalTwinRoutes.get('/zones/:warehouseId', DigitalTwinController.getWarehouseZones);
digitalTwinRoutes.post('/zones', DigitalTwinController.createWarehouseZone);
digitalTwinRoutes.put('/zones/:id', DigitalTwinController.updateWarehouseZone);
digitalTwinRoutes.delete('/zones/:id', DigitalTwinController.deleteWarehouseZone);

// Warehouse layout management
digitalTwinRoutes.get('/layouts/:warehouseId', DigitalTwinController.getWarehouseLayouts);
digitalTwinRoutes.post('/layouts', DigitalTwinController.createWarehouseLayout);
digitalTwinRoutes.put('/layouts/:id', DigitalTwinController.updateWarehouseLayout);
digitalTwinRoutes.delete('/layouts/:id', DigitalTwinController.deleteWarehouseLayout);

// Digital twin simulations
digitalTwinRoutes.get('/simulations/:warehouseId', DigitalTwinController.getSimulations);
digitalTwinRoutes.post('/simulations', DigitalTwinController.createSimulation);
digitalTwinRoutes.get('/simulations/:id/status', DigitalTwinController.getSimulationStatus);
digitalTwinRoutes.post('/simulations/:id/run', DigitalTwinController.runSimulation);

// Real-time visualization
digitalTwinRoutes.get('/visualization/:warehouseId', DigitalTwinController.getRealTimeVisualization);
digitalTwinRoutes.post('/visualization', DigitalTwinController.updateVisualization);

// 3D Warehouse viewer
digitalTwinRoutes.get('/viewer/:warehouseId', DigitalTwinController.getWarehouseViewer);
digitalTwinRoutes.get('/heatmap/:warehouseId', DigitalTwinController.getHeatmapData);