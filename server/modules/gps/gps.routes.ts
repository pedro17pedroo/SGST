import { Router } from 'express';
import { GPSController } from './gps.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Todas as rotas GPS requerem autenticação
router.use(requireAuth);

// Atualizar localização GPS do utilizador
router.post('/update', GPSController.updateLocation);

// Obter status GPS do utilizador atual
router.get('/status', GPSController.getCurrentStatus);

// Obter veículos disponíveis para motoristas
router.get('/vehicles/available', requireRole(['driver', 'manager', 'admin']), GPSController.getAvailableVehicles);

// Associar GPS do utilizador a um veículo (apenas motoristas)
router.post('/vehicle/assign', requireRole(['driver', 'manager', 'admin']), GPSController.assignVehicle);

// Remover associação GPS-veículo
router.post('/vehicle/unassign', requireRole(['driver', 'manager', 'admin']), GPSController.unassignVehicle);

// Obter histórico de localizações (apenas gerentes e admins)
router.get('/history/:userId?', requireRole(['manager', 'admin']), GPSController.getLocationHistory);

// Obter localizações em tempo real de todos os utilizadores/veículos
router.get('/real-time', requireRole(['manager', 'admin']), GPSController.getRealTimeLocations);

// Verificar se GPS está obrigatório para o utilizador
router.get('/required', GPSController.isGPSRequired);

export default router;