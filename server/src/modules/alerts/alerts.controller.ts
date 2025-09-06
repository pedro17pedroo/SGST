import { Request, Response } from 'express';

export class AlertsController {
  /**
   * Obter todos os alertas
   */
  static async getAllAlerts(req: Request, res: Response) {
    try {
      // Mock data para alertas - pode ser substituído por dados reais da base de dados
      const alerts = [
        {
          id: '1',
          type: 'low_stock',
          priority: 'high',
          title: 'Stock baixo em produtos críticos',
          message: 'Vários produtos estão com stock abaixo do nível mínimo',
          status: 'active',
          entityType: 'product',
          entityId: 'prod-123',
          entityName: 'Produto Exemplo',
          userId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'system',
          priority: 'medium',
          title: 'Backup automático concluído',
          message: 'O backup diário foi executado com sucesso',
          status: 'acknowledged',
          entityType: 'system',
          entityId: null,
          entityName: null,
          userId: null,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          updatedAt: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: alerts,
        total: alerts.length
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ 
        message: "Erro ao buscar alertas", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obter alerta por ID
   */
  static async getAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock data - substituir por consulta real à base de dados
      const alert = {
        id,
        type: 'low_stock',
        priority: 'high',
        title: 'Stock baixo em produtos críticos',
        message: 'Vários produtos estão com stock abaixo do nível mínimo',
        status: 'active',
        entityType: 'product',
        entityId: 'prod-123',
        entityName: 'Produto Exemplo',
        userId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Error fetching alert:', error);
      res.status(500).json({ 
        message: "Erro ao buscar alerta", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Criar novo alerta
   */
  static async createAlert(req: Request, res: Response) {
    try {
      const alertData = req.body;
      
      // Validação básica
      if (!alertData.title || !alertData.message || !alertData.type || !alertData.priority) {
        return res.status(400).json({
          message: 'Campos obrigatórios: title, message, type, priority'
        });
      }

      // Mock creation - substituir por inserção real na base de dados
      const newAlert = {
        id: `alert-${Date.now()}`,
        ...alertData,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        data: newAlert,
        message: 'Alerta criado com sucesso'
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({ 
        message: "Erro ao criar alerta", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Atualizar alerta
   */
  static async updateAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Mock update - substituir por atualização real na base de dados
      const updatedAlert = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: updatedAlert,
        message: 'Alerta atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar alerta", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reconhecer alerta
   */
  static async acknowledgeAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock acknowledge - substituir por atualização real na base de dados
      const acknowledgedAlert = {
        id,
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: acknowledgedAlert,
        message: 'Alerta reconhecido com sucesso'
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({ 
        message: "Erro ao reconhecer alerta", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Eliminar alerta
   */
  static async deleteAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock deletion - substituir por eliminação real na base de dados
      res.json({
        success: true,
        message: 'Alerta eliminado com sucesso'
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar alerta", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}