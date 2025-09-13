import { db } from '../../../database/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  vehicles,
  vehicleMaintenance,
  gpsTracking,
  vehicleAssignments,
  geofences,
  geofenceAlerts,
  type Vehicle,
  type InsertVehicle,
  type VehicleMaintenance,
  type InsertVehicleMaintenance,
  type GpsTracking,
  type InsertGpsTracking,
  type VehicleAssignment,
  type InsertVehicleAssignment,
  type Geofence,
  type InsertGeofence,
  type GeofenceAlert,
  type InsertGeofenceAlert
} from '../../../../shared/schema';
import { insertAndReturn, updateAndReturn, safeDelete, getSingleRecord } from '../utils';

export class FleetStorage {
  // ===== VEHICLE MANAGEMENT =====
  
  async getVehicles(): Promise<Vehicle[]> {
    console.log('=== DEBUG getVehicles ===');
    try {
      console.log('Executando query: db.select().from(vehicles).orderBy(desc(vehicles.createdAt))');
      const result = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
      console.log('Query executada com sucesso. Resultados:', result.length);
      return result;
    } catch (error) {
      console.error('ERRO em getVehicles:', error);
      throw error;
    }
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    return await getSingleRecord<Vehicle>(vehicles, eq(vehicles.id, id));
  }

  async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    console.log('=== DEBUG getVehicleByLicensePlate ===');
    console.log('Searching for:', JSON.stringify(licensePlate));
    
    const result = await getSingleRecord<Vehicle>(vehicles, eq(vehicles.licensePlate, licensePlate));
    console.log('Result:', result ? `FOUND: ${JSON.stringify(result.licensePlate)}` : 'NOT FOUND');
    return result;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<Vehicle>(vehicles, { ...vehicle, id }, vehicles.id, id);
    if (!result) {
      throw new Error('Failed to create vehicle');
    }
    return result;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const result = await updateAndReturn<Vehicle>(vehicles, id, vehicle, vehicles.id);
    if (!result) {
      throw new Error('Failed to update vehicle');
    }
    return result;
  }

  async deleteVehicle(id: string): Promise<void> {
    await safeDelete(vehicles, id, vehicles.id);
  }

  async getVehiclesByStatus(status: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles)
      .where(eq(vehicles.status, status))
      .orderBy(desc(vehicles.createdAt));
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles)
      .where(eq(vehicles.status, 'available'))
      .orderBy(desc(vehicles.createdAt));
  }

  async getVehiclesByCarrier(carrierId: string, status?: string): Promise<Vehicle[]> {
    const conditions = [eq(vehicles.carrierId, carrierId)];
    
    if (status) {
      conditions.push(eq(vehicles.status, status));
    }
    
    return await db.select().from(vehicles)
      .where(and(...conditions))
      .orderBy(desc(vehicles.createdAt));
  }

  // ===== VEHICLE MAINTENANCE =====
  
  async getVehicleMaintenance(vehicleId: string): Promise<VehicleMaintenance[]> {
    return await db.select().from(vehicleMaintenance)
      .where(eq(vehicleMaintenance.vehicleId, vehicleId))
      .orderBy(desc(vehicleMaintenance.scheduledDate));
  }

  async createVehicleMaintenance(maintenance: InsertVehicleMaintenance): Promise<VehicleMaintenance> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<VehicleMaintenance>(vehicleMaintenance, { ...maintenance, id }, vehicleMaintenance.id, id);
    if (!result) {
      throw new Error('Failed to create vehicle maintenance');
    }
    return result;
  }

  async updateMaintenance(id: string, maintenance: Partial<InsertVehicleMaintenance>): Promise<VehicleMaintenance> {
    const result = await updateAndReturn<VehicleMaintenance>(vehicleMaintenance, id, maintenance, vehicleMaintenance.id);
    if (!result) {
      throw new Error('Failed to update maintenance');
    }
    return result;
  }

  async getUpcomingMaintenance(): Promise<VehicleMaintenance[]> {
    return await db.select().from(vehicleMaintenance)
      .where(sql`scheduled_date >= CURDATE() AND status = 'scheduled'`)
      .orderBy(vehicleMaintenance.scheduledDate);
  }

  // ===== GPS TRACKING =====
  
  async trackGPS(tracking: InsertGpsTracking): Promise<GpsTracking> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<GpsTracking>(gpsTracking, { ...tracking, id }, gpsTracking.id, id);
    if (!result) {
      throw new Error('Failed to track GPS');
    }
    return result;
  }

  async getVehicleCurrentLocation(vehicleId: string): Promise<GpsTracking | null> {
    return await getSingleRecord<GpsTracking>(gpsTracking, eq(gpsTracking.vehicleId, vehicleId));
  }

  async getVehicleLocationHistory(vehicleId: string, options: { startDate?: string; endDate?: string }): Promise<GpsTracking[]> {
    const conditions = [eq(gpsTracking.vehicleId, vehicleId)];
    
    if (options.startDate) {
      conditions.push(sql`timestamp >= ${options.startDate}`);
    }
    
    if (options.endDate) {
      conditions.push(sql`timestamp <= ${options.endDate}`);
    }
    
    return await db.select().from(gpsTracking)
      .where(and(...conditions))
      .orderBy(desc(gpsTracking.timestamp));
  }

  async getAllVehicleLocations(): Promise<GpsTracking[]> {
    // Retorna a localização mais recente de cada veículo
    return await db.select().from(gpsTracking)
      .where(sql`(vehicle_id, timestamp) IN (
        SELECT vehicle_id, MAX(timestamp) 
        FROM gps_tracking 
        GROUP BY vehicle_id
      )`);
  }

  async updateGPSStatus(vehicleId: string, status: string): Promise<Vehicle> {
    const result = await updateAndReturn<Vehicle>(vehicles, vehicleId, { lastGpsUpdate: new Date() }, vehicles.id);
    if (!result) {
      throw new Error('Failed to update GPS status');
    }
    return result;
  }

  // ===== VEHICLE ASSIGNMENTS =====
  
  async getVehicleAssignments(): Promise<VehicleAssignment[]> {
    return await db.select().from(vehicleAssignments)
      .orderBy(desc(vehicleAssignments.createdAt));
  }

  async getAssignment(id: string): Promise<VehicleAssignment | null> {
    return await getSingleRecord<VehicleAssignment>(vehicleAssignments, eq(vehicleAssignments.id, id));
  }

  async createAssignment(assignment: InsertVehicleAssignment): Promise<VehicleAssignment> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<VehicleAssignment>(vehicleAssignments, { ...assignment, id }, vehicleAssignments.id, id);
    if (!result) {
      throw new Error('Failed to create assignment');
    }
    return result;
  }

  async updateAssignment(id: string, assignment: Partial<InsertVehicleAssignment>): Promise<VehicleAssignment> {
    const result = await updateAndReturn<VehicleAssignment>(vehicleAssignments, id, assignment, vehicleAssignments.id);
    if (!result) {
      throw new Error('Failed to update assignment');
    }
    return result;
  }

  async getVehicleActiveAssignments(vehicleId: string): Promise<VehicleAssignment[]> {
    return await db.select().from(vehicleAssignments)
      .where(and(
        eq(vehicleAssignments.vehicleId, vehicleId),
        eq(vehicleAssignments.status, 'active')
      ))
      .orderBy(desc(vehicleAssignments.createdAt));
  }

  async getDriverActiveAssignments(driverId: string): Promise<VehicleAssignment[]> {
    return await db.select().from(vehicleAssignments)
      .where(and(
        eq(vehicleAssignments.driverId, driverId),
        eq(vehicleAssignments.status, 'active')
      ))
      .orderBy(desc(vehicleAssignments.createdAt));
  }

  // ===== GEOFENCING =====
  
  async getGeofences(): Promise<Geofence[]> {
    return await db.select().from(geofences).orderBy(desc(geofences.createdAt));
  }

  async getGeofence(id: string): Promise<Geofence | null> {
    return await getSingleRecord<Geofence>(geofences, eq(geofences.id, id));
  }

  async createGeofence(geofence: InsertGeofence): Promise<Geofence> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<Geofence>(geofences, { ...geofence, id }, geofences.id, id);
    if (!result) {
      throw new Error('Failed to create geofence');
    }
    return result;
  }

  async updateGeofence(id: string, geofence: Partial<InsertGeofence>): Promise<Geofence> {
    const result = await updateAndReturn<Geofence>(geofences, id, geofence, geofences.id);
    if (!result) {
      throw new Error('Failed to update geofence');
    }
    return result;
  }

  async deleteGeofence(id: string): Promise<void> {
    await safeDelete(geofences, id, geofences.id);
  }

  async getActiveGeofences(): Promise<Geofence[]> {
    return await db.select().from(geofences)
      .where(eq(geofences.isActive, true))
      .orderBy(desc(geofences.createdAt));
  }

  // ===== GEOFENCE ALERTS =====
  
  async getGeofenceAlerts(): Promise<GeofenceAlert[]> {
    return await db.select().from(geofenceAlerts)
      .orderBy(desc(geofenceAlerts.createdAt));
  }

  async createGeofenceAlert(alert: InsertGeofenceAlert): Promise<GeofenceAlert> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<GeofenceAlert>(geofenceAlerts, { ...alert, id }, geofenceAlerts.id, id);
    if (!result) {
      throw new Error('Failed to create geofence alert');
    }
    return result;
  }

  async acknowledgeGeofenceAlert(id: string): Promise<GeofenceAlert> {
    const result = await updateAndReturn<GeofenceAlert>(geofenceAlerts, id, { 
      isAcknowledged: true,
      acknowledgedAt: new Date()
    }, geofenceAlerts.id);
    if (!result) {
      throw new Error('Failed to acknowledge geofence alert');
    }
    return result;
  }

  async getActiveGeofenceAlerts(): Promise<GeofenceAlert[]> {
    return await db.select().from(geofenceAlerts)
      .where(eq(geofenceAlerts.isAcknowledged, false))
      .orderBy(desc(geofenceAlerts.createdAt));
  }

  // ===== GPS SESSIONS =====
  
  async createGPSSession(session: any): Promise<any> {
    // TODO: Implementar quando a tabela de sessões GPS for criada
    throw new Error('GPS Sessions não implementado ainda');
  }

  async updateGPSSession(id: string, session: any): Promise<any> {
    // TODO: Implementar quando a tabela de sessões GPS for criada
    throw new Error('GPS Sessions não implementado ainda');
  }

  async getActiveGPSSessions(): Promise<any[]> {
    // TODO: Implementar quando a tabela de sessões GPS for criada
    return [];
  }

  async endGPSSession(id: string): Promise<any> {
    // TODO: Implementar quando a tabela de sessões GPS for criada
    throw new Error('GPS Sessions não implementado ainda');
  }
}