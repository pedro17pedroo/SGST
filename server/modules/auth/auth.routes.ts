import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from './auth.middleware';

const router = Router();

// Rotas de autenticação públicas
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Rotas de perfil protegidas - requerem autenticação
router.get('/profile', requireAuth, AuthController.getProfile);
router.get('/me', requireAuth, AuthController.getCurrentUser);
router.put('/profile', requireAuth, AuthController.updateProfile);
router.post('/change-password', requireAuth, AuthController.changePassword);

export default router;