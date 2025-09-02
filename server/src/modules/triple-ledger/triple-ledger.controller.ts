import { Request, Response } from 'express';
import { TripleLedgerModel } from './triple-ledger.model';

export class TripleLedgerController {
  static async getAuditTrail(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0, tableName, operation } = req.query;
      const auditTrail = await TripleLedgerModel.getAuditTrail({
        limit: Number(limit),
        offset: Number(offset),
        tableName: tableName as string,
        operation: operation as string
      });
      res.json(auditTrail);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      res.status(500).json({ 
        message: "Erro ao buscar trilha de auditoria", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAuditRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await TripleLedgerModel.getAuditRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Registo de auditoria não encontrado" });
      }
      
      res.json(record);
    } catch (error) {
      console.error('Error fetching audit record:', error);
      res.status(500).json({ 
        message: "Erro ao buscar registo de auditoria", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createAuditRecord(req: Request, res: Response) {
    try {
      const auditRecord = await TripleLedgerModel.createAuditRecord(req.body);
      res.status(201).json(auditRecord);
    } catch (error) {
      console.error('Error creating audit record:', error);
      res.status(500).json({ 
        message: "Erro ao criar registo de auditoria", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getEntityAuditTrail(req: Request, res: Response) {
    try {
      const { entityType, entityId } = req.params;
      const auditTrail = await TripleLedgerModel.getEntityAuditTrail(entityType, entityId);
      res.json(auditTrail);
    } catch (error) {
      console.error('Error fetching entity audit trail:', error);
      res.status(500).json({ 
        message: "Erro ao buscar trilha de auditoria da entidade", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWormStorage(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const wormRecords = await TripleLedgerModel.getWormStorage({
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(wormRecords);
    } catch (error) {
      console.error('Error fetching WORM storage:', error);
      res.status(500).json({ 
        message: "Erro ao buscar armazenamento WORM", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWormRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await TripleLedgerModel.getWormRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Registo WORM não encontrado" });
      }
      
      res.json(record);
    } catch (error) {
      console.error('Error fetching WORM record:', error);
      res.status(500).json({ 
        message: "Erro ao buscar registo WORM", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async storeInWorm(req: Request, res: Response) {
    try {
      const wormRecord = await TripleLedgerModel.storeInWorm(req.body);
      res.status(201).json(wormRecord);
    } catch (error) {
      console.error('Error storing in WORM:', error);
      res.status(500).json({ 
        message: "Erro ao armazenar no WORM", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getFraudAlerts(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0, severity, status } = req.query;
      const alerts = await TripleLedgerModel.getFraudAlerts({
        limit: Number(limit),
        offset: Number(offset),
        severity: severity as string,
        status: status as string
      });
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      res.status(500).json({ 
        message: "Erro ao buscar alertas de fraude", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getFraudAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alert = await TripleLedgerModel.getFraudAlert(id);
      
      if (!alert) {
        return res.status(404).json({ message: "Alerta de fraude não encontrado" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error('Error fetching fraud alert:', error);
      res.status(500).json({ 
        message: "Erro ao buscar alerta de fraude", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createFraudAlert(req: Request, res: Response) {
    try {
      const fraudAlert = await TripleLedgerModel.createFraudAlert(req.body);
      res.status(201).json(fraudAlert);
    } catch (error) {
      console.error('Error creating fraud alert:', error);
      res.status(500).json({ 
        message: "Erro ao criar alerta de fraude", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateFraudAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fraudAlert = await TripleLedgerModel.updateFraudAlert(id, req.body);
      res.json(fraudAlert);
    } catch (error) {
      console.error('Error updating fraud alert:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar alerta de fraude", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async verifyIntegrity(req: Request, res: Response) {
    try {
      const { recordId, tableName } = req.body;
      const verification = await TripleLedgerModel.verifyIntegrity(recordId, tableName);
      res.json(verification);
    } catch (error) {
      console.error('Error verifying integrity:', error);
      res.status(500).json({ 
        message: "Erro ao verificar integridade", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async verifyChain(req: Request, res: Response) {
    try {
      const { tableName, startDate, endDate } = req.body;
      const chainVerification = await TripleLedgerModel.verifyChain(tableName, startDate, endDate);
      res.json(chainVerification);
    } catch (error) {
      console.error('Error verifying chain:', error);
      res.status(500).json({ 
        message: "Erro ao verificar cadeia", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getComplianceReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, entityType } = req.query;
      const report = await TripleLedgerModel.getComplianceReport({
        startDate: startDate as string,
        endDate: endDate as string,
        entityType: entityType as string
      });
      res.json(report);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de conformidade", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}