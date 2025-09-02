import { Router } from 'express';
import { PurchaseApprovalsController } from './purchase-approvals.controller.js';

const router = Router();

// Approval workflow routes
router.post('/purchase-orders/:orderId/submit-approval', PurchaseApprovalsController.submitForApproval);
router.post('/purchase-orders/:orderId/approve', PurchaseApprovalsController.approvePurchaseOrder);
router.post('/purchase-orders/:orderId/reject', PurchaseApprovalsController.rejectPurchaseOrder);
router.post('/purchase-orders/:orderId/revise', PurchaseApprovalsController.requestRevision);

// Approval chain management
router.get('/approval-chains', PurchaseApprovalsController.getApprovalChains);
router.post('/approval-chains', PurchaseApprovalsController.createApprovalChain);
router.put('/approval-chains/:chainId', PurchaseApprovalsController.updateApprovalChain);
router.delete('/approval-chains/:chainId', PurchaseApprovalsController.deleteApprovalChain);

// Pending approvals
router.get('/pending-approvals', PurchaseApprovalsController.getPendingApprovals);
router.get('/pending-approvals/user/:userId', PurchaseApprovalsController.getUserPendingApprovals);

// Approval history
router.get('/purchase-orders/:orderId/approval-history', PurchaseApprovalsController.getApprovalHistory);
router.get('/approval-history', PurchaseApprovalsController.getAllApprovalHistory);

// Approval limits
router.get('/approval-limits', PurchaseApprovalsController.getApprovalLimits);
router.post('/approval-limits', PurchaseApprovalsController.createApprovalLimit);
router.put('/approval-limits/:limitId', PurchaseApprovalsController.updateApprovalLimit);
router.delete('/approval-limits/:limitId', PurchaseApprovalsController.deleteApprovalLimit);

// Approval notifications
router.get('/approval-notifications', PurchaseApprovalsController.getApprovalNotifications);
router.post('/approval-notifications/:notificationId/mark-read', PurchaseApprovalsController.markNotificationRead);

export { router as purchaseApprovalsRoutes };