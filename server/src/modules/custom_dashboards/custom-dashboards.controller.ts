import { Request, Response } from 'express';
import { z } from 'zod';
import { CustomDashboardsModel } from './custom-dashboards.model';

// Validation schemas
const createDashboardSchema = z.object({
  name: z.string().min(1, "Nome do dashboard é obrigatório"),
  description: z.string().optional(),
  layout: z.object({
    columns: z.number().min(1).max(12).default(12),
    rows: z.number().min(1).max(20).default(8),
    gap: z.number().min(0).max(50).default(16)
  }),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.enum([
      "metric_card", "chart_line", "chart_bar", "chart_pie", "chart_area",
      "table", "list", "gauge", "progress", "heatmap", "map", "text",
      "image", "video", "iframe", "calendar", "timeline", "kanban"
    ]),
    position: z.object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().min(1).max(12),
      height: z.number().min(1).max(10)
    }),
    config: z.object({
      title: z.string().optional(),
      dataSource: z.string().optional(),
      query: z.string().optional(),
      refreshInterval: z.number().min(5000).default(30000),
      style: z.object({
        backgroundColor: z.string().optional(),
        borderColor: z.string().optional(),
        textColor: z.string().optional(),
        fontSize: z.number().optional()
      }).optional(),
      displayOptions: z.record(z.any()).optional()
    })
  })),
  filters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["date_range", "select", "multiselect", "text", "number"]),
    options: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional(),
    defaultValue: z.any().optional(),
    required: z.boolean().default(false)
  })).optional(),
  permissions: z.object({
    public: z.boolean().default(false),
    users: z.array(z.string().uuid()).optional(),
    roles: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional()
  }),
  settings: z.object({
    autoRefresh: z.boolean().default(true),
    refreshInterval: z.number().min(10000).default(60000),
    showFilters: z.boolean().default(true),
    showExportOptions: z.boolean().default(true),
    allowFullscreen: z.boolean().default(true)
  }).optional()
});

const updateDashboardSchema = createDashboardSchema.partial();

const widgetDataSchema = z.object({
  widgetId: z.string().uuid(),
  query: z.string(),
  parameters: z.record(z.any()).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  filters: z.record(z.any()).optional()
});

export class CustomDashboardsController {
  static async getDashboards(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const includePublic = req.query.includePublic === 'true';
      const category = req.query.category as string;
      
      const dashboards = await CustomDashboardsModel.getDashboards({
        userId,
        includePublic,
        category
      });
      
      res.json({
        dashboards: dashboards.map(dashboard => ({
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description,
          thumbnail: dashboard.thumbnail,
          isPublic: dashboard.permissions.public,
          owner: dashboard.owner,
          lastModified: dashboard.updatedAt,
          widgetCount: dashboard.widgets.length,
          category: dashboard.category
        }))
      });
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      res.status(500).json({
        message: "Erro ao buscar dashboards",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDashboard(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      const userId = req.user?.id;
      
      const dashboard = await CustomDashboardsModel.getDashboard(dashboardId, userId);
      
      if (!dashboard) {
        return res.status(404).json({
          message: "Dashboard não encontrado"
        });
      }

      res.json(dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({
        message: "Erro ao buscar dashboard",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createDashboard(req: Request, res: Response) {
    try {
      const validated = createDashboardSchema.parse(req.body);
      
      const dashboard = await CustomDashboardsModel.createDashboard({
        ...validated,
        createdAt: new Date(),
        createdByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Dashboard criado com sucesso",
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description
        }
      });
    } catch (error) {
      console.error('Error creating dashboard:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar dashboard",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateDashboard(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      const validated = updateDashboardSchema.parse(req.body);
      
      const dashboard = await CustomDashboardsModel.updateDashboard(dashboardId, {
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: req.user?.id || 'system'
      });
      
      res.json({
        message: "Dashboard atualizado com sucesso",
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description
        }
      });
    } catch (error) {
      console.error('Error updating dashboard:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar dashboard",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteDashboard(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      
      await CustomDashboardsModel.deleteDashboard(dashboardId);
      
      res.json({
        message: "Dashboard eliminado com sucesso"
      });
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      res.status(500).json({
        message: "Erro ao eliminar dashboard",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async duplicateDashboard(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      const { name } = req.body;
      
      const dashboard = await CustomDashboardsModel.duplicateDashboard(dashboardId, {
        name: name || `Cópia de Dashboard`,
        duplicatedAt: new Date(),
        duplicatedByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Dashboard duplicado com sucesso",
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description
        }
      });
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
      res.status(500).json({
        message: "Erro ao duplicar dashboard",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWidgetData(req: Request, res: Response) {
    try {
      const validated = widgetDataSchema.parse(req.body);
      
      const data = await CustomDashboardsModel.getWidgetData({
        ...validated,
        requestedAt: new Date(),
        requestedByUserId: req.user?.id || 'system'
      });
      
      res.json({
        data: data.result,
        metadata: {
          recordCount: data.recordCount,
          executionTime: data.executionTime,
          cached: data.cached,
          cacheExpiry: data.cacheExpiry
        }
      });
    } catch (error) {
      console.error('Error fetching widget data:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Parâmetros inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao buscar dados do widget",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getAvailableDataSources(req: Request, res: Response) {
    try {
      const dataSources = await CustomDashboardsModel.getAvailableDataSources();
      
      res.json({
        dataSources: dataSources.map(ds => ({
          id: ds.id,
          name: ds.name,
          description: ds.description,
          type: ds.type,
          schema: ds.schema,
          sampleQueries: ds.sampleQueries,
          availableFields: ds.availableFields,
          supportedChartTypes: ds.supportedChartTypes
        }))
      });
    } catch (error) {
      console.error('Error fetching data sources:', error);
      res.status(500).json({
        message: "Erro ao buscar fontes de dados",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDashboardTemplates(req: Request, res: Response) {
    try {
      const category = req.query.category as string;
      
      const templates = await CustomDashboardsModel.getDashboardTemplates({ category });
      
      res.json({
        templates: templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          preview: template.preview,
          widgets: template.widgets.length,
          complexity: template.complexity,
          tags: template.tags
        }))
      });
    } catch (error) {
      console.error('Error fetching dashboard templates:', error);
      res.status(500).json({
        message: "Erro ao buscar modelos de dashboard",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createFromTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { name, customizations } = req.body;
      
      const dashboard = await CustomDashboardsModel.createFromTemplate(templateId, {
        name,
        customizations,
        createdAt: new Date(),
        createdByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Dashboard criado a partir do modelo",
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description
        }
      });
    } catch (error) {
      console.error('Error creating dashboard from template:', error);
      res.status(500).json({
        message: "Erro ao criar dashboard a partir do modelo",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async exportDashboard(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      const format = req.query.format as string || 'pdf';
      
      const exportResult = await CustomDashboardsModel.exportDashboard(dashboardId, {
        format,
        includeData: req.query.includeData === 'true',
        exportedAt: new Date(),
        exportedByUserId: req.user?.id || 'system'
      });
      
      res.json({
        message: "Export iniciado com sucesso",
        exportJob: {
          id: exportResult.jobId,
          format: exportResult.format,
          estimatedTime: exportResult.estimatedTime,
          downloadUrl: exportResult.downloadUrl
        }
      });
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      res.status(500).json({
        message: "Erro ao exportar dashboard",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async shareDashboard(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      const { shareType, recipients, permissions, expiryDate } = req.body;
      
      const shareResult = await CustomDashboardsModel.shareDashboard(dashboardId, {
        shareType,
        recipients,
        permissions,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        sharedAt: new Date(),
        sharedByUserId: req.user?.id || 'system'
      });
      
      res.json({
        message: "Dashboard partilhado com sucesso",
        share: {
          id: shareResult.shareId,
          shareUrl: shareResult.shareUrl,
          recipients: shareResult.recipients,
          expiryDate: shareResult.expiryDate
        }
      });
    } catch (error) {
      console.error('Error sharing dashboard:', error);
      res.status(500).json({
        message: "Erro ao partilhar dashboard",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}