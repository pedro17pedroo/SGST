import { Router } from 'express';
import { ComplianceController } from './compliance.controller.js';

const router = Router();

// Angola IVA (VAT) Compliance
router.get('/compliance/iva/rates', ComplianceController.getIVARates);
router.post('/compliance/iva/calculate', ComplianceController.calculateIVA);
router.get('/compliance/iva/report', ComplianceController.generateIVAReport);
router.post('/compliance/iva/submit', ComplianceController.submitIVADeclaration);

// GDPR Compliance
router.get('/compliance/gdpr/data-subjects', ComplianceController.getDataSubjects);
router.post('/compliance/gdpr/data-request', ComplianceController.handleDataRequest);
router.post('/compliance/gdpr/consent', ComplianceController.recordConsent);
router.delete('/compliance/gdpr/data/:subjectId', ComplianceController.deletePersonalData);

// Audit Trail
router.get('/compliance/audit-trail', ComplianceController.getAuditTrail);
router.post('/compliance/audit-trail', ComplianceController.logAuditEvent);

// Regulatory Reporting
router.get('/compliance/reports/templates', ComplianceController.getReportTemplates);
router.post('/compliance/reports/generate', ComplianceController.generateRegulatoryReport);
router.get('/compliance/reports/history', ComplianceController.getReportHistory);

// Data retention policies
router.get('/compliance/retention-policies', ComplianceController.getRetentionPolicies);
router.post('/compliance/retention-policies', ComplianceController.createRetentionPolicy);
router.post('/compliance/data-cleanup', ComplianceController.executeDataCleanup);

export { router as complianceRoutes };