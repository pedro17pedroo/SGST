import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Navigation, Clock, MapPin, RefreshCw, Smartphone, Satellite, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVehicleLocations } from '@/hooks/api/use-fleet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface VehicleLocation {
  vehicleId: string;
  licensePlate: string;
  brand: string;
  model: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  status: 'ativo' | 'manutencao' | 'inativo';
  assignmentId?: string;
  destination?: string;
}

interface FleetTrackingMapProps {
  height?: string;
  showControls?: boolean;
  selectedVehicleId?: string | null;
  onVehicleSelect?: (vehicleId: string | null) => void;
}

// Custom vehicle icons
const createVehicleIcon = (status: string) => {
  const color = status === 'ativo' ? '#22c55e' : status === 'manutencao' ? '#f59e0b' : '#6b7280';
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}'%3E%3Cpath d='M18 16c-.8 0-1.4-.4-1.8-1H15v-1h1.2c.4-.6 1-.9 1.8-.9s1.4.3 1.8.9H21v1h-1.2c-.4.6-1 1-1.8 1zM6 16c-.8 0-1.4-.4-1.8-1H3v-1h1.2c.4-.6 1-.9 1.8-.9s1.4.3 1.8.9H9v1H7.8c-.4.6-1 1-1.8 1z'/%3E%3Cpath d='M20 8H4l1-4h14l1 4z'/%3E%3Cpath d='M5 10h14v4H5z'/%3E%3C/svg%3E`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Auto-refresh component
function MapAutoRefresh({ onRefresh }: { onRefresh: () => void }) {
  useEffect(() => {
    const interval = setInterval(onRefresh, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [onRefresh]);

  return null;
}

// Component to fit map bounds to vehicles
function FitBounds({ locations }: { locations: VehicleLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map(loc => [loc.latitude, loc.longitude] as [number, number]);
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [locations, map]);

  return null;
}

export function FleetTrackingMap({ 
  height = '500px', 
  showControls = true,
  onVehicleSelect 
}: FleetTrackingMapProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentDeviceLocation, setCurrentDeviceLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [useDeviceGPS, setUseDeviceGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [centerOnDevice, setCenterOnDevice] = useState(false);
  const { toast } = useToast();

  // Função para solicitar permissão de GPS
  const requestGPSPermission = async () => {
    if (!navigator.geolocation) {
      setGpsError('GPS não é suportado neste dispositivo');
      setGpsPermission('denied');
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setGpsPermission(permission.state as 'granted' | 'denied' | 'prompt');
      return permission.state === 'granted';
    } catch (error) {
      console.error('Erro ao verificar permissão GPS:', error);
      return false;
    }
  };

  // Função para iniciar rastreamento GPS
  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS não é suportado neste dispositivo');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setCurrentDeviceLocation({ lat: latitude, lng: longitude });
      setGpsError(null);
      toast({
        title: "GPS Ativo",
        description: `Localização atualizada: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      });
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = 'Erro desconhecido';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permissão de GPS negada';
          setGpsPermission('denied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível';
          break;
        case error.TIMEOUT:
          errorMessage = 'Timeout na obtenção da localização';
          break;
      }
      setGpsError(errorMessage);
      toast({
        title: "Erro GPS",
        description: errorMessage,
        variant: "destructive"
      });
    };

    const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    setWatchId(id);
    setUseDeviceGPS(true);
  };

  // Função para parar rastreamento GPS
  const stopGPSTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setUseDeviceGPS(false);
    setCurrentDeviceLocation(null);
    setGpsError(null);
    toast({
      title: "GPS Desativado",
      description: "Rastreamento do dispositivo parado"
    });
  };

  // Função para alternar GPS
  const toggleDeviceGPS = async () => {
    if (useDeviceGPS) {
      stopGPSTracking();
    } else {
      const hasPermission = await requestGPSPermission();
      if (hasPermission || gpsPermission === 'granted') {
        startGPSTracking();
        setCenterOnDevice(true);
      } else {
        toast({
          title: "Permissão Necessária",
          description: "É necessário permitir acesso à localização",
          variant: "destructive"
        });
      }
    }
  };

  // Componente para controlar o centro do mapa
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (centerOnDevice && currentDeviceLocation) {
        map.setView([currentDeviceLocation.lat, currentDeviceLocation.lng], 15);
        setCenterOnDevice(false);
      }
    }, [currentDeviceLocation, centerOnDevice, map]);
    
    return null;
  };
  
  const { data: locationsResponse, isLoading: loading, error, refetch } = useVehicleLocations();

  // Verificar permissão GPS ao montar o componente
  useEffect(() => {
    requestGPSPermission();
    
    // Cleanup ao desmontar
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Cleanup do watchId quando ele muda
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);
  const vehicleLocations = locationsResponse?.data || [];

  useEffect(() => {
    if (vehicleLocations.length > 0) {
      setLastUpdate(new Date());
    }
  }, [vehicleLocations]);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro de GPS",
        description: "Não foi possível carregar as localizações dos veículos.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleRefresh = async () => {
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: "Mapa Atualizado",
        description: "Localizações dos veículos atualizadas.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar localizações.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      manutencao: { label: 'Manutenção', variant: 'secondary' as const },
      inativo: { label: 'Inativo', variant: 'outline' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatSpeed = (speed?: number) => {
    return speed ? `${Math.round(speed)} km/h` : 'Parado';
  };

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-PT');
  };

  // Default center for Angola (Luanda)
  const defaultCenter: LatLngExpression = [-8.8390, 13.2894];

  if (error && vehicleLocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Rastreamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Navigation className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Erro ao carregar mapa</h3>
            <p className="mt-1 text-sm text-gray-500">{error.message}</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Rastreamento GPS
            {loading && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
          </CardTitle>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastUpdate ? `Atualizado ${formatLastUpdate(lastUpdate.toISOString())}` : 'Nunca'}
              </span>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Truck className="h-4 w-4 text-green-600" />
            {vehicleLocations.filter((v: VehicleLocation) => v.status === 'ativo').length} Ativos
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-4 w-4 text-orange-600" />
            {vehicleLocations.filter((v: VehicleLocation) => v.status === 'manutencao').length} Manutenção
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-4 w-4 text-gray-600" />
            {vehicleLocations.filter((v: VehicleLocation) => v.status === 'inativo').length} Inativos
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Controles GPS do Dispositivo */}
        <Card className="m-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <span className="font-medium">GPS do Dispositivo</span>
              </div>
              
              {useDeviceGPS && currentDeviceLocation && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Satellite className="h-4 w-4" />
                  <span>
                    {currentDeviceLocation.lat.toFixed(6)}, {currentDeviceLocation.lng.toFixed(6)}
                  </span>
                </div>
              )}
              
              {gpsError && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant={gpsPermission === 'granted' ? 'default' : gpsPermission === 'denied' ? 'destructive' : 'secondary'}
              >
                {gpsPermission === 'granted' ? 'Permitido' : 
                 gpsPermission === 'denied' ? 'Negado' : 
                 gpsPermission === 'checking' ? 'Verificando...' : 'Pendente'}
              </Badge>
              
              <div className="flex items-center space-x-2">
                 {useDeviceGPS && currentDeviceLocation && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setCenterOnDevice(true)}
                     title="Centralizar no meu dispositivo"
                   >
                     <Satellite className="h-4 w-4" />
                   </Button>
                 )}
                 
                 <Button
                   variant={useDeviceGPS ? "destructive" : "default"}
                   size="sm"
                   onClick={toggleDeviceGPS}
                   disabled={gpsPermission === 'denied'}
                 >
                   {useDeviceGPS ? (
                     <>
                       <Satellite className="h-4 w-4 mr-2" />
                       Parar GPS
                     </>
                   ) : (
                     <>
                       <Smartphone className="h-4 w-4 mr-2" />
                       Ativar GPS
                     </>
                   )}
                 </Button>
               </div>
            </div>
          </div>
        </Card>

        <div style={{ height }}>
          {vehicleLocations.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <Navigation className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum veículo localizado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Veículos aparecerão aqui quando o GPS estiver ativo
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={vehicleLocations.length > 0 ? [vehicleLocations[0].latitude, vehicleLocations[0].longitude] : defaultCenter}
              zoom={vehicleLocations.length === 1 ? 15 : 10}
              style={{ height: '100%', width: '100%' }}
              className="rounded-b-lg"
            >
              <MapController />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapAutoRefresh onRefresh={handleRefresh} />
              <FitBounds locations={vehicleLocations} />
              
              {vehicleLocations.map((vehicle: VehicleLocation) => (
                <Marker
                  key={vehicle.vehicleId}
                  position={[vehicle.latitude, vehicle.longitude]}
                  icon={createVehicleIcon(vehicle.status)}
                  eventHandlers={{
                    click: () => onVehicleSelect?.(vehicle.vehicleId),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="font-semibold text-base mb-2">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Matrícula:</span>
                          <span className="font-mono">{vehicle.licensePlate}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          {getStatusBadge(vehicle.status)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Velocidade:</span>
                          <span>{formatSpeed(vehicle.speed)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Precisão:</span>
                          <span>{Math.round(vehicle.accuracy)}m</span>
                        </div>
                        
                        {vehicle.destination && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Destino:</span>
                            <span className="text-xs">{vehicle.destination}</span>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground pt-1 border-t">
                          Última atualização: {formatLastUpdate(vehicle.timestamp)}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Marcador do dispositivo atual */}
              {useDeviceGPS && currentDeviceLocation && (
                <Marker
                  position={[currentDeviceLocation.lat, currentDeviceLocation.lng]}
                  icon={new Icon({
                    iconUrl: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Ccircle cx='12' cy='12' r='8' stroke='white' stroke-width='3'/%3E%3C/svg%3E`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    popupAnchor: [0, -10],
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold flex items-center">
                        <Smartphone className="h-4 w-4 mr-2 text-blue-600" />
                        Meu Dispositivo
                      </h3>
                      <p className="text-sm text-gray-600">
                        Localização atual do dispositivo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Atualização: {new Date().toLocaleString('pt-AO')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Coordenadas: {currentDeviceLocation.lat.toFixed(6)}, {currentDeviceLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}