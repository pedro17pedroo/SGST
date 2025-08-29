import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

// Rotas de autenticação (não precisam de moduleGuard porque são essenciais)
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.post('/change-password', AuthController.changePassword);

export default router;