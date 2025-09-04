import { Router } from 'express';
import { EDIController } from './edi.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { AuthenticatedRequest } from '../../types/auth';

const router = Router();

// Middleware de autenticação para todas as rotas EDI
router.use(requireAuth);

// Connection Management Routes
router.post('/connections', 
  requireRole(['admin', 'manager']), 
  EDIController.createConnection
);

router.get('/connections', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getConnections
);

router.get('/connections/:id', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getConnection
);

router.put('/connections/:id', 
  requireRole(['admin', 'manager']), 
  EDIController.updateConnection
);

router.delete('/connections/:id', 
  requireRole(['admin']), 
  EDIController.deleteConnection
);

router.post('/connections/:id/test', 
  requireRole(['admin', 'manager']), 
  EDIController.testConnection
);

// Document Processing Routes
router.post('/documents/inbound', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.processInboundDocument
);

router.post('/documents/outbound', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.sendOutboundDocument
);

router.get('/documents', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getDocuments
);

router.get('/documents/:id', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getDocument
);

// Message Types Routes
router.get('/message-types', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getMessageTypes
);

router.get('/message-types/:id', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getMessageType
);

// Transactions Routes
router.get('/transactions', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getTransactions
);

router.get('/transactions/:id', 
  requireRole(['admin', 'manager', 'operator']), 
  EDIController.getTransaction
);

// Monitoring and Statistics Routes
router.get('/statistics', 
  requireRole(['admin', 'manager']), 
  EDIController.getStatistics
);

router.get('/audit-logs', 
  requireRole(['admin']), 
  EDIController.getAuditLogs
);

// Health Check Route (sem permissão específica para monitoramento)
router.get('/health', 
  EDIController.healthCheck
);

export default router;