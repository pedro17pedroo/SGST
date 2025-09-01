import { Request, Response } from 'express';
import { z } from 'zod';
import { gpsTracking, vehicles, vehicleAssignments, users } from '../../../shared/schema';
import { db } from '../../db';
import { eq, and, desc, gte } from 'drizzle-orm';

// Schema para validação de dados GPS
const gpsUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  altitude: z.number().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  signalStrength: z.number().optional(),
  isEngineOn: z.boolean().optional(),
  vehicleId: z.string().uuid().optional(),
  deviceType: z.enum(['mobile', 'tablet', 'gps_device']).default('mobile'),
  metadata: z.record(z.any()).optional()
});

const vehicleAssignmentSchema = z.object({
  vehicleId: z.string().uuid()
});

export class GPSController {
  
  /**
   * Atualizar localização GPS do utilizador
   */
  static async updateLocation(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const gpsData = gpsUpdateSchema.parse(req.body);

      // Verificar se o utilizador precisa de GPS ativo
      if (!['operator', 'driver'].includes(user.role)) {
        return res.status(403).json({
          message: 'GPS não é obrigatório para o seu perfil',
          error: 'GPS_NOT_REQUIRED'
        });
      }

      // Para motoristas, verificar se existe associação de veículo
      let assignedVehicleId = gpsData.vehicleId;
      if (user.role === 'driver' && !assignedVehicleId) {
        // Buscar veículo atualmente atribuído ao motorista
        const assignment = await db
          .select()
          .from(vehicleAssignments)
          .where(and(
            eq(vehicleAssignments.driverId, user.id),
            eq(vehicleAssignments.status, 'active')
          ))
          .limit(1);

        if (assignment.length > 0) {
          assignedVehicleId = assignment[0].vehicleId;
        }
      }

      // Inserir dados GPS na base de dados
      const gpsRecord = await db.insert(gpsTracking).values({
        vehicleId: assignedVehicleId,
        latitude: gpsData.latitude.toString(),
        longitude: gpsData.longitude.toString(),
        speed: gpsData.speed?.toString(),
        heading: gpsData.heading?.toString(),
        altitude: gpsData.altitude?.toString(),
        accuracy: gpsData.accuracy?.toString(),
        batteryLevel: gpsData.batteryLevel,
        signalStrength: gpsData.signalStrength,
        isEngineOn: gpsData.isEngineOn,
        userId: user.id,
        deviceType: gpsData.deviceType,
        metadata: gpsData.metadata
      }).returning();

      // Atualizar status GPS do veículo se aplicável
      if (assignedVehicleId) {
        await db
          .update(vehicles)
          .set({
            isGpsActive: true,
            lastGpsUpdate: new Date()
          })
          .where(eq(vehicles.id, assignedVehicleId));
      }

      res.json({
        message: 'Localização GPS atualizada com sucesso',
        gpsId: gpsRecord[0].id,
        vehicleId: assignedVehicleId
      });

    } catch (error) {
      console.error('Erro ao atualizar GPS:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados GPS inválidos',
          errors: error.errors
        });
      }

      res.status(500).json({
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obter status GPS atual do utilizador
   */
  static async getCurrentStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      // Buscar último registo GPS do utilizador
      const lastGPS = await db
        .select()
        .from(gpsTracking)
        .where(eq(gpsTracking.userId, user.id))
        .orderBy(desc(gpsTracking.timestamp))
        .limit(1);

      // Verificar se tem veículo atribuído (para motoristas)
      let assignedVehicle = null;
      if (user.role === 'driver') {
        const assignment = await db
          .select({
            vehicle: vehicles
          })
          .from(vehicleAssignments)
          .leftJoin(vehicles, eq(vehicleAssignments.vehicleId, vehicles.id))
          .where(and(
            eq(vehicleAssignments.driverId, user.id),
            eq(vehicleAssignments.status, 'active')
          ))
          .limit(1);

        if (assignment.length > 0) {
          assignedVehicle = assignment[0].vehicle;
        }
      }

      const isGPSRequired = ['operator', 'driver'].includes(user.role);
      const hasRecentGPS = lastGPS.length > 0 && 
        new Date().getTime() - new Date(lastGPS[0].timestamp).getTime() < 300000; // 5 minutos

      res.json({
        isGPSRequired,
        hasRecentGPS,
        lastUpdate: lastGPS.length > 0 ? lastGPS[0].timestamp : null,
        assignedVehicle,
        status: hasRecentGPS ? 'active' : 'inactive'
      });

    } catch (error) {
      console.error('Erro ao obter status GPS:', error);
      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter veículos disponíveis para atribuição
   */
  static async getAvailableVehicles(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      // Buscar veículos ativos
      let vehicleQuery = db
        .select()
        .from(vehicles)
        .where(eq(vehicles.status, 'ativo'));

      // Se for motorista, incluir apenas veículos não atribuídos ou atribuídos a ele
      if (user.role === 'driver') {
        // Para simplicidade, retornar todos os veículos ativos
        // Em produção, seria melhor filtrar por disponibilidade
      }

      const availableVehicles = await vehicleQuery;

      res.json(availableVehicles);

    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Associar motorista a um veículo
   */
  static async assignVehicle(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { vehicleId } = vehicleAssignmentSchema.parse(req.body);

      // Verificar se veículo existe
      const vehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .limit(1);

      if (vehicle.length === 0) {
        return res.status(404).json({
          message: 'Veículo não encontrado'
        });
      }

      // Desativar atribuições anteriores do motorista
      await db
        .update(vehicleAssignments)
        .set({ status: 'completed' })
        .where(and(
          eq(vehicleAssignments.driverId, user.id),
          eq(vehicleAssignments.status, 'active')
        ));

      // Criar nova atribuição
      const assignment = await db.insert(vehicleAssignments).values({
        vehicleId,
        assignmentType: 'manual',
        entityId: `driver-${user.id}`,
        driverId: user.id,
        status: 'active',
        assignedAt: new Date(),
        assignedBy: user.id
      }).returning();

      // Atualizar veículo com o motorista
      await db
        .update(vehicles)
        .set({ driverId: user.id })
        .where(eq(vehicles.id, vehicleId));

      res.json({
        message: 'Veículo atribuído com sucesso',
        assignment: assignment[0],
        vehicle: vehicle[0]
      });

    } catch (error) {
      console.error('Erro ao atribuir veículo:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remover atribuição de veículo
   */
  static async unassignVehicle(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      // Desativar atribuições ativas do motorista
      await db
        .update(vehicleAssignments)
        .set({ 
          status: 'completed',
          completedAt: new Date()
        })
        .where(and(
          eq(vehicleAssignments.driverId, user.id),
          eq(vehicleAssignments.status, 'active')
        ));

      // Remover motorista dos veículos
      await db
        .update(vehicles)
        .set({ driverId: null })
        .where(eq(vehicles.driverId, user.id));

      res.json({
        message: 'Atribuição de veículo removida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter histórico de localizações
   */
  static async getLocationHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const targetUserId = userId || (req as any).user.id;

      // Buscar últimas 100 localizações
      const locations = await db
        .select({
          id: gpsTracking.id,
          latitude: gpsTracking.latitude,
          longitude: gpsTracking.longitude,
          speed: gpsTracking.speed,
          heading: gpsTracking.heading,
          accuracy: gpsTracking.accuracy,
          timestamp: gpsTracking.timestamp,
          vehicleId: gpsTracking.vehicleId,
          deviceType: gpsTracking.deviceType
        })
        .from(gpsTracking)
        .where(eq(gpsTracking.userId, targetUserId))
        .orderBy(desc(gpsTracking.timestamp))
        .limit(100);

      res.json(locations);

    } catch (error) {
      console.error('Erro ao buscar histórico GPS:', error);
      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter localizações em tempo real
   */
  static async getRealTimeLocations(req: Request, res: Response) {
    try {
      // Buscar localizações dos últimos 5 minutos
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const realtimeLocations = await db
        .select({
          userId: gpsTracking.userId,
          userName: users.username,
          latitude: gpsTracking.latitude,
          longitude: gpsTracking.longitude,
          speed: gpsTracking.speed,
          heading: gpsTracking.heading,
          timestamp: gpsTracking.timestamp,
          vehicleId: gpsTracking.vehicleId,
          licensePlate: vehicles.licensePlate,
          vehicleBrand: vehicles.brand,
          vehicleModel: vehicles.model
        })
        .from(gpsTracking)
        .leftJoin(users, eq(gpsTracking.userId, users.id))
        .leftJoin(vehicles, eq(gpsTracking.vehicleId, vehicles.id))
        .where(gte(gpsTracking.timestamp, fiveMinutesAgo))
        .orderBy(desc(gpsTracking.timestamp));

      res.json(realtimeLocations);

    } catch (error) {
      console.error('Erro ao buscar localizações em tempo real:', error);
      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar se GPS é obrigatório para o utilizador
   */
  static async isGPSRequired(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const isRequired = ['operator', 'driver'].includes(user.role);

      res.json({
        isRequired,
        userRole: user.role,
        message: isRequired 
          ? 'GPS é obrigatório para operadores e motoristas'
          : 'GPS não é obrigatório para o seu perfil'
      });

    } catch (error) {
      console.error('Erro ao verificar requisitos GPS:', error);
      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }
}