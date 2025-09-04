import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp: number;
}

interface GPSState {
  position: GPSPosition | null;
  isActive: boolean;
  isRequired: boolean;
  error: string | null;
  isLoading: boolean;
  vehicleId?: string;
}

interface UseGPSOptions {
  autoStart?: boolean;
  interval?: number; // milliseconds
  highAccuracy?: boolean;
  onLocationUpdate?: (position: GPSPosition) => void;
  onError?: (error: string) => void;
  vehicleId?: string;
}

export function useGPS(options: UseGPSOptions = {}) {
  const {
    autoStart = false,
    interval = 30000, // 30 segundos
    highAccuracy = true,
    onLocationUpdate,
    onError,
    vehicleId
  } = options;

  const { toast } = useToast();
  const [gpsState, setGPSState] = useState<GPSState>({
    position: null,
    isActive: false,
    isRequired: false,
    error: null,
    isLoading: false,
    vehicleId
  });

  const watchId = useRef<number | null>(null);
  const intervalId = useRef<number | null>(null);

  // Verificar se GPS é obrigatório
  const checkGPSRequirement = useCallback(async () => {
    try {
      const response = await apiRequest('GET', '/api/gps/required');
      const data = await response.json();
      setGPSState(prev => ({
        ...prev,
        isRequired: data.isRequired
      }));
      return data.isRequired;
    } catch (error) {
      console.error('Erro ao verificar requisitos GPS:', error);
      return false;
    }
  }, []);

  // Enviar atualização GPS para o servidor
  const sendGPSUpdate = useCallback(async (position: GPSPosition) => {
    try {
      const gpsData = {
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        speed: position.speed,
        heading: position.heading,
        altitude: position.altitude,
        vehicleId: gpsState.vehicleId,
        deviceType: 'mobile',
        batteryLevel: (navigator as any).getBattery ? 
          await (navigator as any).getBattery().then((battery: any) => Math.round(battery.level * 100)) : 
          undefined,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const response = await apiRequest('POST', '/api/gps/update', gpsData);

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar GPS:', error);
      throw error;
    }
  }, [gpsState.vehicleId]);

  // Obter posição atual
  const getCurrentPosition = useCallback((): Promise<GPSPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não está disponível'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 30000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsPosition: GPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            altitude: position.coords.altitude || undefined,
            timestamp: position.timestamp
          };
          resolve(gpsPosition);
        },
        (error) => {
          let errorMsg = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Permissão de GPS negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Posição GPS não disponível';
              break;
            case error.TIMEOUT:
              errorMsg = 'Timeout ao obter GPS';
              break;
            default:
              errorMsg = 'Erro desconhecido de GPS';
          }
          reject(new Error(errorMsg));
        },
        options
      );
    });
  }, [highAccuracy]);

  // Iniciar rastreamento GPS
  const startGPS = useCallback(async () => {
    if (gpsState.isActive) return;

    setGPSState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Obter posição inicial
      const position = await getCurrentPosition();
      
      // Enviar para servidor
      await sendGPSUpdate(position);

      setGPSState(prev => ({
        ...prev,
        position,
        isActive: true,
        isLoading: false,
        error: null
      }));

      // Callback para posição inicial
      onLocationUpdate?.(position);

      // Configurar atualizações periódicas
      intervalId.current = setInterval(async () => {
        try {
          const newPosition = await getCurrentPosition();
          await sendGPSUpdate(newPosition);
          
          setGPSState(prev => ({
            ...prev,
            position: newPosition
          }));

          onLocationUpdate?.(newPosition);
        } catch (error) {
          console.error('Erro na atualização periódica GPS:', error);
        }
      }, interval);

      toast({
        title: "GPS Ativado",
        description: `Rastreamento ativo com precisão de ${Math.round(position.accuracy)}m`,
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao ativar GPS';
      
      setGPSState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
        isActive: false
      }));

      onError?.(errorMsg);
      
      toast({
        title: "Erro GPS",
        description: errorMsg,
        variant: "destructive"
      });
    }
  }, [gpsState.isActive, getCurrentPosition, sendGPSUpdate, onLocationUpdate, onError, interval, toast]);

  // Parar rastreamento GPS
  const stopGPS = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    setGPSState(prev => ({
      ...prev,
      isActive: false,
      position: null
    }));

    toast({
      title: "GPS Desativado",
      description: "Rastreamento GPS foi interrompido",
    });
  }, [toast]);

  // Obter status GPS do servidor
  const getServerStatus = useCallback(async () => {
    try {
      const response = await apiRequest('GET', '/api/gps/status');
      const status = await response.json();
      setGPSState(prev => ({
        ...prev,
        isRequired: status.isGPSRequired,
        vehicleId: status.assignedVehicle?.id
      }));
      return status;
    } catch (error) {
      console.error('Erro ao obter status GPS:', error);
    }
    return null;
  }, []);

  // Auto-iniciar se necessário
  useEffect(() => {
    if (autoStart) {
      checkGPSRequirement().then((required) => {
        if (required) {
          startGPS();
        }
      });
    }
  }, [autoStart, checkGPSRequirement, startGPS]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  return {
    ...gpsState,
    startGPS,
    stopGPS,
    getCurrentPosition,
    checkGPSRequirement,
    getServerStatus,
    sendGPSUpdate
  };
}