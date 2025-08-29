import { Express } from 'express';
import { computerVisionRoutes } from './computer-vision.routes';

export function initializeComputerVisionModule(app: Express) {
  app.use('/api', computerVisionRoutes);
}