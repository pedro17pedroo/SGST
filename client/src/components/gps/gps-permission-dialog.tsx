import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Smartphone,
  Truck,
  Wifi
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GPSPermissionDialogProps {
  isOpen: boolean;
  onSuccess: (gpsData: {
    latitude: number;
    longitude: number;
    accuracy: number;
    vehicleId?: string;
  }) => void;
  onError: (error: string) => void;
  userRole: string;
  userName: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  isGpsActive: boolean;
}

export function GPSPermissionDialog({ 
  isOpen, 
  onSuccess, 
  onError, 
  userRole, 
  userName 
}: GPSPermissionDialogProps) {
  const [gpsStatus, setGpsStatus] = useState<'pending' | 'requesting' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const { toast } = useToast();

  // Carregar veículos disponíveis
  useEffect(() => {
    if (isOpen && userRole === 'driver') {
      loadAvailableVehicles();
    }
  }, [isOpen, userRole]);

  const loadAvailableVehicles = async () => {
    try {
      const response = await apiRequest('GET', '/api/fleet/vehicles/available');
      
      if (response.ok) {
        const vehicleData = await response.json();
        setVehicles(vehicleData);
      } else {
        console.error('Erro ao carregar veículos');
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const requestGPSPermission = async () => {
    setGpsStatus('requesting');
    setErrorMessage('');

    // Verificar se GPS está disponível no navegador
    if (!navigator.geolocation) {
      const error = 'GPS não está disponível neste dispositivo ou navegador';
      setErrorMessage(error);
      setGpsStatus('error');
      onError(error);
      return;
    }

    // Verificar se é motorista e não selecionou veículo
    if (userRole === 'driver' && !selectedVehicle) {
      const error = 'Motoristas devem selecionar um veículo antes de ativar GPS';
      setErrorMessage(error);
      setGpsStatus('error');
      return;
    }

    // Pedir permissão de GPS com alta precisão
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const gpsData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          vehicleId: userRole === 'driver' ? selectedVehicle : undefined
        };

        try {
          // Enviar dados GPS iniciais para o servidor
          await sendGPSUpdate(gpsData);
          
          setGpsStatus('success');
          toast({
            title: "GPS Ativado",
            description: `GPS ativado com sucesso. Precisão: ${Math.round(gpsData.accuracy)}m`,
          });
          
          onSuccess(gpsData);
        } catch (error) {
          console.error('Erro ao enviar dados GPS:', error);
          setErrorMessage('Erro ao conectar GPS ao servidor');
          setGpsStatus('error');
        }
      },
      (error) => {
        let errorMsg = '';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Permissão de GPS negada. Por favor, permita o acesso à localização.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Informações de localização não disponíveis.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Timeout ao obter localização. Tente novamente.';
            break;
          default:
            errorMsg = 'Erro desconhecido ao obter localização.';
        }
        
        setErrorMessage(errorMsg);
        setGpsStatus('error');
        onError(errorMsg);
      },
      options
    );
  };

  const sendGPSUpdate = async (gpsData: any) => {
    const response = await apiRequest('POST', '/api/gps/update', {
      ...gpsData,
      deviceType: 'mobile',
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar dados GPS');
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" data-testid="gps-permission-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            GPS Obrigatório - {userRole === 'driver' ? 'Motorista' : 'Operador'}
          </DialogTitle>
          <DialogDescription>
            {userRole === 'driver' 
              ? `Olá ${userName}, como motorista você deve ativar o GPS e selecionar seu veículo para rastreamento em tempo real.`
              : `Olá ${userName}, como operador você deve ativar o GPS do seu dispositivo para rastreamento das operações.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleção de veículo para motoristas */}
          {userRole === 'driver' && (
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">Selecionar Veículo</Label>
              {loadingVehicles ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando veículos...
                </div>
              ) : (
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger data-testid="select-vehicle">
                    <SelectValue placeholder="Escolha o seu veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                          {vehicle.isGpsActive && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Wifi className="h-3 w-3" />
                              <span className="text-xs">GPS Ativo</span>
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Status do GPS */}
          <div className="space-y-3">
            {gpsStatus === 'pending' && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Para continuar, você deve permitir o acesso à localização do seu dispositivo.
                  Isso permite rastreamento em tempo real e cumprimento das políticas de segurança.
                </AlertDescription>
              </Alert>
            )}

            {gpsStatus === 'requesting' && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Obtendo localização GPS... Aguarde.
                </AlertDescription>
              </Alert>
            )}

            {gpsStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  GPS ativado com sucesso! Você pode continuar usando o sistema.
                </AlertDescription>
              </Alert>
            )}

            {gpsStatus === 'error' && errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription data-testid="gps-error-message">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-2">
            {gpsStatus === 'pending' || gpsStatus === 'error' ? (
              <Button 
                onClick={requestGPSPermission}
                disabled={userRole === 'driver' && !selectedVehicle}
                className="w-full"
                data-testid="button-activate-gps"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ativar GPS
              </Button>
            ) : null}
            
            {gpsStatus === 'requesting' && (
              <Button disabled className="w-full">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Obtendo Localização...
              </Button>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• O GPS é obrigatório para operadores e motoristas</p>
            <p>• Seus dados de localização são usados apenas para operações logísticas</p>
            <p>• O rastreamento é ativo apenas durante o horário de trabalho</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}