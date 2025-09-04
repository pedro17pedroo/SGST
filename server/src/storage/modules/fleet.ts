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
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    const query = db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return await getSingleRecord<Vehicle>(query);
  }

  async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    console.log('=== DEBUG getVehicleByLicensePlate ===');
    console.log('Searching for:', JSON.stringify(licensePlate));
    
    const query = db.select().from(vehicles).where(eq(vehicles.licensePlate, licensePlate)).limit(1);
    const result = await getSingleRecord<Vehicle>(query);
    console.log('Result:', result ? `FOUND: ${JSON.stringify(result.licensePlate)}` : 'NOT FOUND');
    return result;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    return insertAndReturn<Vehicle>(vehicles, vehicle);
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    return updateAndReturn<Vehicle>(vehicles, id, vehicle);
  }

  async deleteVehicle(id: string): Promise<void> {
    await safeDelete(vehicles, id);
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

  // ===== VEHICLE MAINTENANCE =====
  
  async getVehicleMaintenance(vehicleId: string): Promise<VehicleMaintenance[]> {
    return await db.select().from(vehicleMaintenance)
      .where(eq(vehicleMaintenance.vehicleId, vehicleId))
      .orderBy(desc(vehicleMaintenance.scheduledDate));
  }

  async createVehicleMaintenance(maintenance: InsertVehicleMaintenance): Promise<VehicleMaintenance> {
    return insertAndReturn<VehicleMaintenance>(vehicleMaintenance, maintenance);
  }

  async updateMaintenance(id: string, maintenance: Partial<InsertVehicleMaintenance>): Promise<VehicleMaintenance> {
    return updateAndReturn<VehicleMaintenance>(vehicleMaintenance, id, maintenance);
  }

  async getUpcomingMaintenance(): Promise<VehicleMaintenance[]> {
    return await db.select().from(vehicleMaintenance)
      .where(sql`scheduled_date >= CURDATE() AND status = 'scheduled'`)
      .orderBy(vehicleMaintenance.scheduledDate);
  }

  // ===== GPS TRACKING =====
  
  async trackGPS(tracking: InsertGpsTracking): Promise<GpsTracking> {
    return insertAndReturn<GpsTracking>(gpsTracking, tracking);
  }

  async getVehicleCurrentLocation(vehicleId: string): Promise<GpsTracking | null> {
    const query = db.select().from(gpsTracking)
      .where(eq(gpsTracking.vehicleId, vehicleId))
      .orderBy(desc(gpsTracking.timestamp))
      .limit(1);
    return await getSingleRecord<GpsTracking>(query);
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
    return updateAndReturn<Vehicle>(vehicles, vehicleId, { gpsStatus: status });
  }

  // ===== VEHICLE ASSIGNMENTS =====
  
  async getVehicleAssignments(): Promise<VehicleAssignment[]> {
    return await db.select().from(vehicleAssignments)
      .orderBy(desc(vehicleAssignments.createdAt));
  }

  async getAssignment(id: string): Promise<VehicleAssignment | null> {
    const query = db.select().from(vehicleAssignments).where(eq(vehicleAssignments.id, id)).limit(1);
    return await getSingleRecord<VehicleAssignment>(query);
  }

  async createAssignment(assignment: InsertVehicleAssignment): Promise<VehicleAssignment> {
    return insertAndReturn<VehicleAssignment>(vehicleAssignments, assignment);
  }

  async updateAssignment(id: string, assignment: Partial<InsertVehicleAssignment>): Promise<VehicleAssignment> {
    return updateAndReturn<VehicleAssignment>(vehicleAssignments, id, assignment);
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
    const query = db.select().from(geofences).where(eq(geofences.id, id)).limit(1);
    return await getSingleRecord<Geofence>(query);
  }

  async createGeofence(geofence: InsertGeofence): Promise<Geofence> {
    return insertAndReturn<Geofence>(geofences, geofence);
  }

  async updateGeofence(id: string, geofence: Partial<InsertGeofence>): Promise<Geofence> {
    return updateAndReturn<Geofence>(geofences, id, geofence);
  }

  async deleteGeofence(id: string): Promise<void> {
    await safeDelete(geofences, id);
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
    return insertAndReturn<GeofenceAlert>(geofenceAlerts, alert);
  }

  async acknowledgeGeofenceAlert(id: string): Promise<GeofenceAlert> {
    return updateAndReturn<GeofenceAlert>(geofenceAlerts, id, { 
      isAcknowledged: true,
      acknowledgedAt: new Date()
    });
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