interface GPSLocation {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  receivedAt: Date;
  address?: string;
}

interface GPSDevice {
  id: string;
  name: string;
  type: 'smartphone' | 'tablet' | 'gps_tracker' | 'vehicle_tracker';
  imei?: string;
  phoneNumber?: string;
  userId?: string;
  vehicleId?: string;
  active: boolean;
  lastLocation?: GPSLocation;
  registeredAt: Date;
  registeredByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

interface Geofence {
  id: string;
  name: string;
  type: 'circular' | 'polygon';
  coordinates: Array<{ latitude: number; longitude: number }>;
  radius?: number;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  warehouseId?: string;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

interface GPSAlert {
  id: string;
  type: 'geofence_enter' | 'geofence_exit' | 'speeding' | 'device_offline' | 'panic_button';
  deviceId: string;
  geofenceId?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: { latitude: number; longitude: number };
  timestamp: Date;
  acknowledgedAt?: Date;
  acknowledgedByUserId?: string;
  resolved: boolean;
}

interface OptimizedRoute {
  id: string;
  startLocation: { latitude: number; longitude: number };
  destinations: Array<{
    latitude: number;
    longitude: number;
    address: string;
    priority: number;
    order: number;
    estimatedArrival?: Date;
  }>;
  totalDistance: number;
  totalTime: number;
  vehicleType: string;
  optimizationType: string;
  createdAt: Date;
}

export class GPSTrackingModel {
  private static locations: Map<string, GPSLocation[]> = new Map();
  private static devices: Map<string, GPSDevice> = new Map();
  private static geofences: Map<string, Geofence> = new Map();
  private static alerts: Map<string, GPSAlert> = new Map();
  private static routes: Map<string, OptimizedRoute> = new Map();

  static async updateLocation(data: Omit<GPSLocation, 'id' | 'address'>): Promise<GPSLocation> {
    const id = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate reverse geocoding for address
    const address = await this.reverseGeocode(data.latitude, data.longitude);
    
    const location: GPSLocation = {
      id,
      address,
      ...data
    };

    // Store location in device history
    if (!this.locations.has(data.deviceId)) {
      this.locations.set(data.deviceId, []);
    }
    
    const deviceLocations = this.locations.get(data.deviceId)!;
    deviceLocations.push(location);
    
    // Keep only last 1000 locations per device
    if (deviceLocations.length > 1000) {
      deviceLocations.splice(0, deviceLocations.length - 1000);
    }

    // Update device's last known location
    const device = this.devices.get(data.deviceId);
    if (device) {
      device.lastLocation = location;
    }

    return location;
  }

  private static async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    // Simulate reverse geocoding - in production, use a real service like Google Maps API
    const addresses = [
      "Rua da Liberdade, Luanda, Angola",
      "Avenida Marginal, Ilha de Luanda, Angola",
      "Rua Rainha Ginga, Maianga, Luanda, Angola",
      "Avenida 4 de Fevereiro, Ingombota, Luanda, Angola",
      "Rua Comandante Che Guevara, Sambizanga, Luanda, Angola"
    ];
    
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  static async getCurrentLocation(trackingId: string): Promise<GPSLocation | undefined> {
    const deviceLocations = this.locations.get(trackingId);
    if (!deviceLocations || deviceLocations.length === 0) {
      return undefined;
    }
    
    // Return the most recent location
    return deviceLocations[deviceLocations.length - 1];
  }

  static async getLocationHistory(
    trackingId: string, 
    options: { startDate?: Date; endDate?: Date; limit?: number }
  ): Promise<GPSLocation[]> {
    const deviceLocations = this.locations.get(trackingId) || [];
    
    let filteredLocations = deviceLocations;
    
    // Filter by date range
    if (options.startDate || options.endDate) {
      filteredLocations = deviceLocations.filter(location => {
        const timestamp = location.timestamp.getTime();
        const afterStart = !options.startDate || timestamp >= options.startDate.getTime();
        const beforeEnd = !options.endDate || timestamp <= options.endDate.getTime();
        return afterStart && beforeEnd;
      });
    }
    
    // Sort by timestamp (newest first)
    filteredLocations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply limit
    if (options.limit) {
      filteredLocations = filteredLocations.slice(0, options.limit);
    }
    
    return filteredLocations;
  }

  static async registerDevice(data: Omit<GPSDevice, 'id' | 'lastLocation'>): Promise<GPSDevice> {
    const id = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const device: GPSDevice = {
      id,
      ...data
    };
    
    this.devices.set(id, device);
    return device;
  }

  static async listDevices(filters: { active?: boolean; type?: string }): Promise<GPSDevice[]> {
    const allDevices = Array.from(this.devices.values());
    
    return allDevices.filter(device => {
      const matchesActive = filters.active === undefined || device.active === filters.active;
      const matchesType = !filters.type || device.type === filters.type;
      return matchesActive && matchesType;
    });
  }

  static async updateDevice(deviceId: string, updates: Partial<GPSDevice>): Promise<GPSDevice | undefined> {
    const device = this.devices.get(deviceId);
    if (!device) {
      return undefined;
    }
    
    const updatedDevice = { ...device, ...updates };
    this.devices.set(deviceId, updatedDevice);
    
    return updatedDevice;
  }

  static async deleteDevice(deviceId: string): Promise<{ success: boolean }> {
    const deleted = this.devices.delete(deviceId);
    
    // Also delete location history
    if (deleted) {
      this.locations.delete(deviceId);
    }
    
    return { success: deleted };
  }

  static async createGeofence(data: Omit<Geofence, 'id'>): Promise<Geofence> {
    const id = `geo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const geofence: Geofence = {
      id,
      ...data
    };
    
    this.geofences.set(id, geofence);
    return geofence;
  }

  static async listGeofences(filters: { warehouseId?: string }): Promise<Geofence[]> {
    const allGeofences = Array.from(this.geofences.values());
    
    return allGeofences.filter(geofence => {
      const matchesWarehouse = !filters.warehouseId || geofence.warehouseId === filters.warehouseId;
      return matchesWarehouse;
    });
  }

  static async updateGeofence(geofenceId: string, updates: Partial<Geofence>): Promise<Geofence | undefined> {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence) {
      return undefined;
    }
    
    const updatedGeofence = { ...geofence, ...updates };
    this.geofences.set(geofenceId, updatedGeofence);
    
    return updatedGeofence;
  }

  static async deleteGeofence(geofenceId: string): Promise<{ success: boolean }> {
    return { success: this.geofences.delete(geofenceId) };
  }

  static async checkGeofenceViolations(
    deviceId: string, 
    latitude: number, 
    longitude: number
  ): Promise<GPSAlert[]> {
    const alerts: GPSAlert[] = [];
    const device = this.devices.get(deviceId);
    
    if (!device) {
      return alerts;
    }
    
    for (const geofence of this.geofences.values()) {
      const isInside = this.isPointInGeofence(latitude, longitude, geofence);
      const wasInside = device.lastLocation ? 
        this.isPointInGeofence(device.lastLocation.latitude, device.lastLocation.longitude, geofence) : 
        false;
      
      // Check for enter/exit events
      if (isInside && !wasInside && geofence.alertOnEnter) {
        const alert = this.createAlert({
          type: 'geofence_enter',
          deviceId,
          geofenceId: geofence.id,
          message: `Dispositivo ${device.name} entrou na geofence ${geofence.name}`,
          severity: 'medium',
          location: { latitude, longitude }
        });
        alerts.push(alert);
      } else if (!isInside && wasInside && geofence.alertOnExit) {
        const alert = this.createAlert({
          type: 'geofence_exit',
          deviceId,
          geofenceId: geofence.id,
          message: `Dispositivo ${device.name} saiu da geofence ${geofence.name}`,
          severity: 'medium',
          location: { latitude, longitude }
        });
        alerts.push(alert);
      }
    }
    
    return alerts;
  }

  private static isPointInGeofence(latitude: number, longitude: number, geofence: Geofence): boolean {
    if (geofence.type === 'circular') {
      const center = geofence.coordinates[0];
      const distance = this.calculateDistance(latitude, longitude, center.latitude, center.longitude);
      return distance <= (geofence.radius || 100);
    } else {
      // Simple polygon check - in production, use a more robust algorithm
      return this.isPointInPolygon(latitude, longitude, geofence.coordinates);
    }
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static isPointInPolygon(latitude: number, longitude: number, polygon: Array<{ latitude: number; longitude: number }>): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].latitude > latitude) !== (polygon[j].latitude > latitude)) &&
          (longitude < (polygon[j].longitude - polygon[i].longitude) * (latitude - polygon[i].latitude) / (polygon[j].latitude - polygon[i].latitude) + polygon[i].longitude)) {
        inside = !inside;
      }
    }
    return inside;
  }

  private static createAlert(data: Omit<GPSAlert, 'id' | 'timestamp' | 'resolved'>): GPSAlert {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: GPSAlert = {
      id,
      timestamp: new Date(),
      resolved: false,
      ...data
    };
    
    this.alerts.set(id, alert);
    return alert;
  }

  static async getGPSAlerts(filters: { status?: string; deviceId?: string }): Promise<GPSAlert[]> {
    const allAlerts = Array.from(this.alerts.values());
    
    return allAlerts.filter(alert => {
      const matchesStatus = !filters.status || 
        (filters.status === 'resolved' && alert.resolved) ||
        (filters.status === 'unresolved' && !alert.resolved) ||
        (filters.status === 'acknowledged' && alert.acknowledgedAt);
      
      const matchesDevice = !filters.deviceId || alert.deviceId === filters.deviceId;
      
      return matchesStatus && matchesDevice;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async acknowledgeAlert(alertId: string, data: { acknowledgedAt: Date; acknowledgedByUserId: string }): Promise<GPSAlert | undefined> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return undefined;
    }
    
    alert.acknowledgedAt = data.acknowledgedAt;
    alert.acknowledgedByUserId = data.acknowledgedByUserId;
    
    return alert;
  }

  static async optimizeRoute(data: Omit<OptimizedRoute, 'id' | 'createdAt' | 'totalDistance' | 'totalTime'>): Promise<OptimizedRoute> {
    const id = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simple route optimization algorithm - in production, use a real routing service
    const optimizedDestinations = [...data.destinations].sort((a, b) => b.priority - a.priority);
    
    // Add order and estimated arrival times
    optimizedDestinations.forEach((dest, index) => {
      dest.order = index + 1;
      dest.estimatedArrival = new Date(Date.now() + (index + 1) * 30 * 60 * 1000); // 30 minutes per stop
    });
    
    // Calculate total distance and time (mock values)
    const totalDistance = optimizedDestinations.length * 5000; // 5km per destination
    const totalTime = optimizedDestinations.length * 30; // 30 minutes per destination
    
    const route: OptimizedRoute = {
      id,
      startLocation: data.startLocation,
      destinations: optimizedDestinations,
      vehicleType: data.vehicleType,
      optimizationType: data.optimizationType,
      totalDistance,
      totalTime,
      createdAt: new Date()
    };
    
    this.routes.set(id, route);
    return route;
  }

  static async getRoute(routeId: string): Promise<OptimizedRoute | undefined> {
    return this.routes.get(routeId);
  }
}