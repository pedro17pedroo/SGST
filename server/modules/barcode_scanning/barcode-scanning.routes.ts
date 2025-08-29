import { Router } from 'express';
import { BarcodeScanningController } from './barcode-scanning.controller.js';

const router = Router();

// Barcode scanning endpoints
router.get('/barcode-scans', BarcodeScanningController.getBarcodeScans);
router.post('/barcode-scans', BarcodeScanningController.createBarcodeScan);
router.get('/barcode-scans/product/:productId', BarcodeScanningController.getBarcodeScansByProduct);
router.get('/products/barcode/:barcode', BarcodeScanningController.findProductByBarcode);

// Real-time location tracking
router.post('/barcode-scans/:scanId/location', BarcodeScanningController.updateScanLocation);
router.get('/products/:productId/last-location', BarcodeScanningController.getLastProductLocation);

export { router as barcodeScanningRoutes };