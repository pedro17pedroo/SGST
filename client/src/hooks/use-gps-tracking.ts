import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GPSOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGPSTrackingReturn {
  position: GPSPosition | null;
  error: string | null;
  isTracking: boolean;
  isSupported: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  getCurrentPosition: () => Promise<GPSPosition>;
}

export function useGPSTracking(options: GPSOptions = {}): UseGPSTrackingReturn {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const isSupported = 'geolocation' in navigator;

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options
  };

  const handleSuccess = useCallback((geoPosition: GeolocationPosition) => {
    const newPosition: GPSPosition = {
      latitude: geoPosition.coords.latitude,
      longitude: geoPosition.coords.longitude,
      accuracy: geoPosition.coords.accuracy,
      timestamp: geoPosition.timestamp
    };
    
    setPosition(newPosition);
    setError(null);
  }, []);

  const handleError = useCallback((geoError: GeolocationPositionError) => {
    let errorMessage = 'Erro desconhecido na localização';
    
    switch (geoError.code) {
      case geoError.PERMISSION_DENIED:
        errorMessage = 'Acesso à localização foi negado. Por favor, permita o acesso nas configurações do navegador.';
        break;
      case geoError.POSITION_UNAVAILABLE:
        errorMessage = 'Informações de localização não disponíveis.';
        break;
      case geoError.TIMEOUT:
        errorMessage = 'Tempo limite para obter localização excedido.';
        break;
    }
    
    setError(errorMessage);
    setPosition(null);
    
    toast({
      title: "Erro de GPS",
      description: errorMessage,
      variant: "destructive"
    });
  }, [toast]);

  const getCurrentPosition = useCallback((): Promise<GPSPosition> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Geolocalização não é suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          const position: GPSPosition = {
            latitude: geoPosition.coords.latitude,
            longitude: geoPosition.coords.longitude,
            accuracy: geoPosition.coords.accuracy,
            timestamp: geoPosition.timestamp
          };
          resolve(position);
        },
        (geoError) => {
          reject(new Error(handleError(geoError) as any));
        },
        defaultOptions
      );
    });
  }, [isSupported, defaultOptions, handleError]);

  const startTracking = useCallback(() => {
    if (!isSupported) {
      setError('Geolocalização não é suportada pelo navegador');
      return;
    }

    if (isTracking) {
      return;
    }

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      defaultOptions
    );

    setWatchId(id);
    setIsTracking(true);
    setError(null);
  }, [isSupported, isTracking, handleSuccess, handleError, defaultOptions]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    position,
    error,
    isTracking,
    isSupported,
    startTracking,
    stopTracking,
    getCurrentPosition
  };
}

// Hook for mandatory GPS verification
export function useMandatoryGPS() {
  const { position, error, isSupported, startTracking, getCurrentPosition } = useGPSTracking();
  const [isGPSRequired, setIsGPSRequired] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check GPS permission status
  useEffect(() => {
    if (!isSupported) return;

    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setHasPermission(permission.state === 'granted');
        
        permission.addEventListener('change', () => {
          setHasPermission(permission.state === 'granted');
        });
      } catch (err) {
        // Fallback for browsers that don't support permissions API
        setHasPermission(null);
      }
    };

    checkPermission();
  }, [isSupported]);

  // Auto-start GPS tracking when required
  useEffect(() => {
    if (isGPSRequired && hasPermission && !position && !error) {
      startTracking();
    }
  }, [isGPSRequired, hasPermission, position, error, startTracking]);

  const requestGPSAccess = useCallback(async () => {
    try {
      await getCurrentPosition();
      setIsGPSRequired(true);
      
      toast({
        title: "GPS Ativado",
        description: "Localização ativada com sucesso.",
      });
    } catch (err) {
      toast({
        title: "GPS Obrigatório",
        description: "É necessário ativar o GPS para continuar.",
        variant: "destructive"
      });
    }
  }, [getCurrentPosition, toast]);

  const enforceGPS = useCallback(() => {
    setIsGPSRequired(true);
  }, []);

  return {
    position,
    error,
    isSupported,
    hasPermission,
    isGPSRequired,
    requestGPSAccess,
    enforceGPS
  };
}