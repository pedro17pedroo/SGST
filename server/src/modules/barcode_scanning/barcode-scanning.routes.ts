import { Router } from 'express';
import { BarcodeScanningController } from './barcode-scanning.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Rota de teste simples sem autenticação
router.get('/test', (req, res) => {
  res.json({ message: 'Barcode scanning routes working!', timestamp: new Date().toISOString() });
});

// Rotas públicas para escaneamento de códigos de barras (sem autenticação)
router.get('/scan', BarcodeScanningController.createBarcodeScan);
router.post('/scan/public', BarcodeScanningController.createBarcodeScan);
router.get('/product/:barcode', BarcodeScanningController.findProductByBarcode);

// Rotas protegidas para escaneamento de códigos de barras (requerem autenticação)
router.get('/scans', requireAuth, BarcodeScanningController.getBarcodeScans);
router.post('/scan', requireAuth, requireRole(['admin', 'manager', 'operator']), BarcodeScanningController.createBarcodeScan);
router.get('/scans/product/:productId', requireAuth, BarcodeScanningController.getBarcodeScansByProduct);
router.get('/product/:barcode/protected', requireAuth, BarcodeScanningController.findProductByBarcode);

// Rotas para rastreamento de localização em tempo real
router.put('/scans/:scanId/location', requireAuth, requireRole(['admin', 'manager', 'operator']), BarcodeScanningController.updateScanLocation);
router.get('/products/:productId/last-location', requireAuth, BarcodeScanningController.getLastProductLocation);

export { router as barcodeScanningRoutes };