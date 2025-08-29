import { Router } from 'express';
import { ComputerVisionController } from './computer-vision.controller';

export const computerVisionRoutes = Router();

// Computer Vision endpoints
computerVisionRoutes.post('/cv/count-items', ComputerVisionController.countItems);
computerVisionRoutes.post('/cv/detect-damage', ComputerVisionController.detectDamage);
computerVisionRoutes.post('/cv/read-labels', ComputerVisionController.readLabels);
computerVisionRoutes.post('/cv/quality-check', ComputerVisionController.qualityCheck);
computerVisionRoutes.get('/cv/session/:sessionId', ComputerVisionController.getSession);
computerVisionRoutes.get('/cv/sessions', ComputerVisionController.getSessions);
computerVisionRoutes.post('/cv/configure', ComputerVisionController.updateConfiguration);
computerVisionRoutes.get('/cv/configuration', ComputerVisionController.getConfiguration);