import { Router } from 'express';
import { CustomDashboardsController } from './custom-dashboards.controller';

const router = Router();

// Dashboard management
router.get('/', CustomDashboardsController.getDashboards);
router.get('/:dashboardId', CustomDashboardsController.getDashboard);
router.post('/', CustomDashboardsController.createDashboard);
router.put('/:dashboardId', CustomDashboardsController.updateDashboard);
router.delete('/:dashboardId', CustomDashboardsController.deleteDashboard);

// Dashboard operations
router.post('/:dashboardId/duplicate', CustomDashboardsController.duplicateDashboard);
router.post('/:dashboardId/export', CustomDashboardsController.exportDashboard);
router.post('/:dashboardId/share', CustomDashboardsController.shareDashboard);

// Widget data
router.post('/widgets/data', CustomDashboardsController.getWidgetData);

// Data sources and templates
router.get('/meta/datasources', CustomDashboardsController.getAvailableDataSources);
router.get('/templates', CustomDashboardsController.getDashboardTemplates);
router.post('/templates/:templateId/create', CustomDashboardsController.createFromTemplate);

export default router;