import { Router } from 'express';
import { VehicleTypesController } from './vehicle-types.controller';

const router = Router();

// Rotas para gestão de tipos de veículo
router.get('/', VehicleTypesController.getVehicleTypes);
router.get('/active', VehicleTypesController.getActiveVehicleTypes);
router.get('/categories', VehicleTypesController.getCategories);
router.get('/check-name/:name', VehicleTypesController.checkNameUniqueness);
router.get('/:id', VehicleTypesController.getVehicleTypeById);
router.post('/', VehicleTypesController.createVehicleType);
router.put('/:id', VehicleTypesController.updateVehicleType);
router.delete('/:id', VehicleTypesController.deleteVehicleType);

export default router;