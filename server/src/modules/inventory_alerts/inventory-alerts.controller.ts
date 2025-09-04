import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/auth';
import { z } from 'zod';
import { InventoryAlertsModel } from './inventory-alerts.model';

// Validation schemas
const createAlertSchema = z.object({
  type: z.enum(["low_stock", "overstock", "expiry", "dead_stock", "quality_issue"]),
  productId: z.string().uuid("ID do produto inválido"),
  warehouseId: z.string().uuid("ID do armazém inválido"),
  threshold: z.number().optional(),
  message: z.string().min(1, "Mensagem é obrigatória"),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  autoResolve: z.boolean().default(false)
});

const updateAlertSchema = z.object({
  status: z.enum(["active", "acknowledged", "resolved", "dismissed"]).optional(),
  assignedToUserId: z.string().uuid().optional(),
  notes: z.string().optional()
});

const alertSettingsSchema = z.object({
  lowStockThreshold: z.number().int().min(0).default(10),
  overstockThreshold: z.number().int().min(0).default(1000),
  expiryWarningDays: z.number().int().min(1).default(30),
  deadStockDays: z.number().int().min(1).default(90),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  notificationFrequency: z.enum(["immediate", "daily", "weekly"]).default("daily")
});

export class InventoryAlertsController {
  // Endpoint específico para stock-alerts (compatibilidade com frontend)
  static async getStockAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const severity = req.query.severity as string | undefined;
      
      const alerts = await InventoryAlertsModel.getAlerts({
        warehouseId,
        type,
        status,
        severity
      });
      
      // Formatar resposta para compatibilidade com frontend
      // Por enquanto retorna array vazio até implementação completa
      const stockAlerts = alerts.map((alert: any) => ({
        id: alert.id || '',
        type: alert.type || 'low_stock',
        productId: alert.productId || '',
        warehouseId: alert.warehouseId || '',
        message: alert.message || '',
        severity: alert.severity || 'medium',
        status: alert.status || 'active',
        createdAt: alert.createdAt || new Date(),
        threshold: alert.threshold || 0
      }));
      
      res.json({
        alerts: stockAlerts,
        total: stockAlerts.length,
        summary: {
          critical: stockAlerts.filter(a => a.severity === 'critical').length,
          high: stockAlerts.filter(a => a.severity === 'high').length,
          medium: stockAlerts.filter(a => a.severity === 'medium').length,
          low: stockAlerts.filter(a => a.severity === 'low').length
        }
      });
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas de stock",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  static async getAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const severity = req.query.severity as string | undefined;
      
      const alerts = await InventoryAlertsModel.getAlerts({
        warehouseId,
        type,
        status,
        severity
      });
      
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const alert = await InventoryAlertsModel.getAlertById(id);
      
      if (!alert) {
        return res.status(404).json({
          message: "Alerta não encontrado"
        });
      }

      res.json(alert);
    } catch (error) {
      console.error('Error fetching alert:', error);
      res.status(500).json({
        message: "Erro ao buscar alerta",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = createAlertSchema.parse(req.body);
      const alert = await InventoryAlertsModel.createAlert({
        ...validated,
        createdByUserId: req.user?.id,
        createdAt: new Date(),
        status: 'active'
      });
      
      res.status(201).json(alert);
    } catch (error) {
      console.error('Error creating alert:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar alerta",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateAlertSchema.parse(req.body);
      const alert = await InventoryAlertsModel.updateAlert(id, {
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: req.user?.id
      });
      
      res.json(alert);
    } catch (error) {
      console.error('Error updating alert:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar alerta",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await InventoryAlertsModel.deleteAlert(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({
        message: "Erro ao eliminar alerta",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getLowStockAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const alerts = await InventoryAlertsModel.getLowStockAlerts(warehouseId);
      res.json(alerts);
    } catch (error) {
      console.error('Error getting low stock alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas de stock baixo",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOverstockAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const alerts = await InventoryAlertsModel.getOverstockAlerts(warehouseId);
      res.json(alerts);
    } catch (error) {
      console.error('Error getting overstock alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas de excesso de stock",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getExpiryAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const daysAhead = parseInt(req.query.days as string) || 30;
      const alerts = await InventoryAlertsModel.getExpiryAlerts(warehouseId, daysAhead);
      res.json(alerts);
    } catch (error) {
      console.error('Error getting expiry alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas de validade",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDeadStockAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const days = parseInt(req.query.days as string) || 90;
      const alerts = await InventoryAlertsModel.getDeadStockAlerts(warehouseId, days);
      res.json(alerts);
    } catch (error) {
      console.error('Error getting dead stock alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas de stock morto",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAlertSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const settings = await InventoryAlertsModel.getAlertSettings(warehouseId);
      res.json(settings);
    } catch (error) {
      console.error('Error getting alert settings:', error);
      res.status(500).json({
        message: "Erro ao buscar configurações de alertas",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateAlertSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = alertSettingsSchema.parse(req.body);
      const warehouseId = req.query.warehouseId as string || 'default';
      
      const settings = await InventoryAlertsModel.updateAlertSettings(warehouseId, {
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: req.user?.id
      });
      
      res.json(settings);
    } catch (error) {
      console.error('Error updating alert settings:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar configurações de alertas",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async acknowledgeAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      const alert = await InventoryAlertsModel.acknowledgeAlert(id, {
        acknowledgedByUserId: req.user?.id,
        acknowledgedAt: new Date(),
        notes
      });
      
      res.json(alert);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({
        message: "Erro ao reconhecer alerta",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async resolveAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { resolution, notes } = req.body;
      
      const alert = await InventoryAlertsModel.resolveAlert(id, {
        resolvedByUserId: req.user?.id,
        resolvedAt: new Date(),
        resolution,
        notes
      });
      
      res.json(alert);
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({
        message: "Erro ao resolver alerta",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async bulkAlertAction(req: AuthenticatedRequest, res: Response) {
    try {
      const { alertIds, action, notes } = req.body;
      
      if (!Array.isArray(alertIds) || alertIds.length === 0) {
        return res.status(400).json({
          message: "Lista de IDs de alertas é obrigatória"
        });
      }

      const result = await InventoryAlertsModel.bulkAlertAction(alertIds, {
        action,
        notes,
        actionByUserId: req.user?.id,
        actionAt: new Date()
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error performing bulk alert action:', error);
      res.status(500).json({
        message: "Erro ao executar ação em lote nos alertas",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}