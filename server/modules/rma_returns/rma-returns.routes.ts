import { Router } from 'express';
import { RMAReturnsController } from './rma-returns.controller.js';

const router = Router();

// RMA (Return Merchandise Authorization) routes
router.post('/rma/create', RMAReturnsController.createRMA);
router.get('/rma', RMAReturnsController.listRMAs);
router.get('/rma/:rmaId', RMAReturnsController.getRMA);
router.put('/rma/:rmaId', RMAReturnsController.updateRMA);
router.post('/rma/:rmaId/approve', RMAReturnsController.approveRMA);
router.post('/rma/:rmaId/reject', RMAReturnsController.rejectRMA);

// Returns processing
router.post('/returns/receive', RMAReturnsController.receiveReturn);
router.post('/returns/:returnId/inspect', RMAReturnsController.inspectReturn);
router.post('/returns/:returnId/process', RMAReturnsController.processReturn);

// Quality control
router.get('/quality-inspections', RMAReturnsController.getQualityInspections);
router.post('/quality-inspections', RMAReturnsController.createQualityInspection);
router.put('/quality-inspections/:inspectionId', RMAReturnsController.updateQualityInspection);

// Return reasons and policies
router.get('/return-reasons', RMAReturnsController.getReturnReasons);
router.post('/return-reasons', RMAReturnsController.createReturnReason);
router.get('/return-policies', RMAReturnsController.getReturnPolicies);
router.post('/return-policies', RMAReturnsController.createReturnPolicy);

export { router as rmaReturnsRoutes };