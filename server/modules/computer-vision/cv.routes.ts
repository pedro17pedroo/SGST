import { Router } from 'express';
import { ComputerVisionController } from './cv.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('computer_vision'));

// Rotas de Computer Vision
router.post('/cv/process', ComputerVisionController.processImage);
router.post('/cv/simulate', ComputerVisionController.simulateCountingSession);
router.get('/cv/results', ComputerVisionController.getCountingResults);
router.get('/cv/results/:id', ComputerVisionController.getCountingResult);
router.put('/cv/results/:id', ComputerVisionController.updateCountingResult);
router.post('/cv/results/:id/verify', ComputerVisionController.verifyCountingResult);
router.get('/cv/stats', ComputerVisionController.getCountingStats);
router.get('/cv/damage-detection', ComputerVisionController.getDamageDetection);

export default router;