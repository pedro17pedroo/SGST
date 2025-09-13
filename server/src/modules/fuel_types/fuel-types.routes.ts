import { Router } from 'express';
import { FuelTypesController } from './fuel-types.controller';

const router = Router();

// Rotas para gestão de tipos de combustível
router.get('/', FuelTypesController.getFuelTypes);
router.get('/active', FuelTypesController.getActiveFuelTypes);
router.get('/units', FuelTypesController.getUnits);
router.get('/check-name/:name', FuelTypesController.checkNameUniqueness);
router.get('/:id', FuelTypesController.getFuelTypeById);
router.post('/', FuelTypesController.createFuelType);
router.put('/:id', FuelTypesController.updateFuelType);
router.delete('/:id', FuelTypesController.deleteFuelType);

export default router;