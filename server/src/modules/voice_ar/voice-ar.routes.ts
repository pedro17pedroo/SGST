import { Router } from 'express';
import { VoiceARController } from './voice-ar.controller';

const router = Router();

// === VOICE PICKING ROUTES ===

// Sessões de Voice Picking
router.post('/voice-picking/sessions', VoiceARController.createVoicePickingSession);
router.get('/voice-picking/sessions', VoiceARController.getVoicePickingSessions);
router.get('/voice-picking/sessions/:sessionId', VoiceARController.getVoicePickingSession);
router.put('/voice-picking/sessions/:sessionId/complete', VoiceARController.completeVoicePickingSession);

// Comandos de voz
router.post('/voice-picking/sessions/:sessionId/commands', VoiceARController.processVoiceCommand);

// Configurações de Voice Picking
router.get('/voice-picking/config/:warehouseId', VoiceARController.getVoicePickingConfig);
router.put('/voice-picking/config/:warehouseId', VoiceARController.updateVoicePickingConfig);

// Analytics de Voice Picking
router.get('/voice-picking/analytics/:warehouseId', VoiceARController.getVoicePickingAnalytics);

// === AR (REALIDADE AUMENTADA) ROUTES ===

// Sessões de AR
router.post('/ar/sessions', VoiceARController.createARSession);
router.get('/ar/sessions', VoiceARController.getARSessions);
router.get('/ar/sessions/:sessionId', VoiceARController.getARSession);
router.put('/ar/sessions/:sessionId/complete', VoiceARController.completeARSession);

// Marcadores e Overlays AR
router.post('/ar/sessions/:sessionId/markers', VoiceARController.addARMarker);
router.post('/ar/sessions/:sessionId/overlays', VoiceARController.addAROverlay);

// Configurações de AR
router.get('/ar/config/:warehouseId', VoiceARController.getARConfig);
router.put('/ar/config/:warehouseId', VoiceARController.updateARConfig);

// Analytics de AR
router.get('/ar/analytics/:warehouseId', VoiceARController.getARAnalytics);

// === HEALTH CHECK ===
router.get('/health', VoiceARController.healthCheck);

export { router as voiceARRoutes };