import { Router } from "express";
import { GreenETAController } from "./green-eta.controller";

export const greenEtaRoutes = Router();

// Carbon footprint tracking
greenEtaRoutes.get('/carbon/:shipmentId', GreenETAController.getCarbonMetrics);
greenEtaRoutes.post('/carbon/calculate', GreenETAController.calculateCarbonFootprint);

// Eco-friendly route optimization
greenEtaRoutes.get('/routes/optimize/:orderId', GreenETAController.optimizeEcoRoute);
greenEtaRoutes.post('/routes/consolidate', GreenETAController.consolidateShipments);

// Sustainability reporting
greenEtaRoutes.get('/reports/sustainability', GreenETAController.getSustainabilityReport);
greenEtaRoutes.get('/reports/carbon-savings', GreenETAController.getCarbonSavingsReport);

// Green recommendations
greenEtaRoutes.get('/recommendations/:warehouseId', GreenETAController.getGreenRecommendations);
greenEtaRoutes.post('/optimize/warehouse', GreenETAController.optimizeWarehouseSustainability);

// ETA predictions with green factors
greenEtaRoutes.get('/eta/green/:shipmentId', GreenETAController.getGreenETA);
greenEtaRoutes.post('/eta/optimize', GreenETAController.optimizeGreenDelivery);