import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { useToast } from '../../hooks/use-toast';
import { Scan, Camera, Keyboard, Zap, CheckCircle, AlertCircle, Video } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface MultiBarcodeReaderProps {
  onScanResult: (code: string, method: 'laser' | 'camera' | 'manual') => void;
  className?: string;
}

type ScanMethod = 'laser' | 'camera' | 'manual';
type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

interface ScanMethodState {
  available: boolean;
  active: boolean;
  status: ScanStatus;
  lastResult?: string;
  error?: string;
}

export const MultiBarcodeReader: React.FC<MultiBarcodeReaderProps> = ({
  onScanResult,
  className = ''
}) => {
  const { toast } = useToast();
  const [manualInput, setManualInput] = useState('');
  const [currentMethod, setCurrentMethod] = useState<ScanMethod>('laser');
  const laserListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null);
  const laserBufferRef = useRef('');
  const laserTimeoutRef = useRef<number | null>(null);
  
  // Refs para câmera
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Estados para cada método de escaneamento
  const [methods, setMethods] = useState<Record<ScanMethod, ScanMethodState>>({
    laser: { available: false, active: false, status: 'idle' },
    camera: { available: true, active: false, status: 'idle' },
    manual: { available: true, active: false, status: 'idle' }
  });

  // Detectar leitores laser conectados
  const detectLaserReaders = useCallback(async () => {
    console.log('🔍 Detectando leitores laser...');
    
    try {
      // Verificar se a API WebHID está disponível (para leitores USB)
      if ('hid' in navigator) {
        console.log('✅ WebHID API disponível');
        
        // Tentar obter dispositivos HID já autorizados
        const devices = await (navigator as any).hid.getDevices();
        console.log('📱 Dispositivos HID encontrados:', devices.length);
        
        // Verificar se algum dispositivo parece ser um leitor de código de barras
        const barcodeReaders = devices.filter((device: any) => {
          // IDs de fornecedores comuns de leitores de código de barras
          const commonVendorIds = [0x05e0, 0x0c2e, 0x1a86, 0x0483, 0x04b4];
          return commonVendorIds.includes(device.vendorId) || 
                 device.productName?.toLowerCase().includes('barcode') ||
                 device.productName?.toLowerCase().includes('scanner');
        });
        
        if (barcodeReaders.length > 0) {
          console.log('✅ Leitor laser detectado:', barcodeReaders[0]);
          setMethods(prev => ({
            ...prev,
            laser: { ...prev.laser, available: true }
          }));
          return true;
        }
      }
      
      // Fallback: assumir que um leitor laser pode estar conectado como teclado
      console.log('📝 Configurando detecção por eventos de teclado');
      setMethods(prev => ({
        ...prev,
        laser: { ...prev.laser, available: true }
      }));
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao detectar leitores laser:', error);
      setMethods(prev => ({
        ...prev,
        laser: { ...prev.laser, available: false, error: 'Erro na detecção' }
      }));
      return false;
    }
  }, []);

  // Configurar listener para leitura laser via teclado
  const setupLaserListener = useCallback(() => {
    console.log('🎯 Configurando listener para laser...');
    
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Leitores laser geralmente enviam dados rapidamente
      if (event.key === 'Enter') {
        // Fim da leitura laser
        if (laserBufferRef.current.length > 3) {
          console.log('✅ Código laser detectado:', laserBufferRef.current);
          
          setMethods(prev => ({
            ...prev,
            laser: { ...prev.laser, status: 'success', lastResult: laserBufferRef.current }
          }));
          
          onScanResult(laserBufferRef.current, 'laser');
          
          toast({
            title: "Código lido por laser!",
            description: `Código: ${laserBufferRef.current}`,
          });
        }
        laserBufferRef.current = '';
      } else if (event.key.length === 1) {
        // Adicionar caractere ao buffer
        laserBufferRef.current += event.key;
        
        // Reset do timeout
        if (laserTimeoutRef.current) {
          clearTimeout(laserTimeoutRef.current);
        }
        
        // Limpar buffer após 100ms de inatividade
        laserTimeoutRef.current = setTimeout(() => {
          laserBufferRef.current = '';
        }, 100);
      }
    };
    
    laserListenerRef.current = handleKeyPress;
    document.addEventListener('keypress', handleKeyPress);
    
    setMethods(prev => ({
      ...prev,
      laser: { ...prev.laser, active: true, status: 'scanning' }
    }));
  }, [onScanResult, toast]);

  // Remover listener do laser
  const removeLaserListener = useCallback(() => {
    if (laserListenerRef.current) {
      document.removeEventListener('keypress', laserListenerRef.current);
      laserListenerRef.current = null;
    }
    
    if (laserTimeoutRef.current) {
      clearTimeout(laserTimeoutRef.current);
      laserTimeoutRef.current = null;
    }
    
    laserBufferRef.current = '';
    
    setMethods(prev => ({
      ...prev,
      laser: { ...prev.laser, active: false, status: 'idle' }
    }));
  }, []);

  // Ativar método de escaneamento com priorização
  const activateMethod = useCallback(async (method: ScanMethod) => {
    console.log(`🔄 Ativando método: ${method}`);
    
    // Parar câmera se estiver ativa
    if (isCameraActive) {
      stopCamera();
    }
    
    // Remover listener laser se ativo
    removeLaserListener();
    
    // Desativar outros métodos
    setMethods(prev => {
      const newMethods = { ...prev };
      Object.keys(newMethods).forEach(key => {
        newMethods[key as ScanMethod].active = false;
        newMethods[key as ScanMethod].status = 'idle';
        newMethods[key as ScanMethod].error = undefined;
      });
      return newMethods;
    });
    
    setCurrentMethod(method);
    
    // Verificar se o método está disponível
    if (!methods[method].available) {
      console.log(`❌ Método ${method} não está disponível`);
      toast({
        title: "Método indisponível",
        description: `O método ${method} não está disponível no momento.`,
        variant: "destructive",
      });
      return;
    }
    
    switch (method) {
      case 'laser':
        setupLaserListener();
        toast({
          title: "Leitor Laser Ativado",
          description: "Aponte o leitor laser para o código de barras.",
        });
        break;
      case 'camera':
        setMethods(prev => ({
          ...prev,
          camera: { ...prev.camera, active: true, status: 'idle' }
        }));
        toast({
          title: "Câmera Ativada",
          description: "Clique em 'Iniciar Câmera' para começar o escaneamento.",
        });
        break;
      case 'manual':
        setMethods(prev => ({
          ...prev,
          manual: { ...prev.manual, active: true, status: 'scanning' }
        }));
        toast({
          title: "Entrada Manual Ativada",
          description: "Digite o código de barras no campo abaixo.",
        });
        break;
    }
  }, [methods, setupLaserListener, removeLaserListener, isCameraActive, toast]);

  // Tratamento de erro para métodos
  const handleMethodError = useCallback((method: ScanMethod, error: string) => {
    console.log(`❌ Erro no método ${method}:`, error);
    
    setMethods(prev => ({
      ...prev,
      [method]: { ...prev[method], status: 'error', error, active: false }
    }));
    
    toast({
      title: `Erro no ${method === 'laser' ? 'leitor laser' : method === 'camera' ? 'câmera' : 'entrada manual'}`,
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  // Timeout para detectar falhas no laser
  const laserTimeoutDetection = useCallback(() => {
    if (currentMethod === 'laser' && methods.laser.active) {
      // Se laser está ativo há mais de 30 segundos sem resultado, considerar falha
      const timeout = setTimeout(() => {
        if (methods.laser.status === 'scanning' && !methods.laser.lastResult) {
          console.log('⏰ Timeout do laser detectado');
          handleMethodError('laser', 'Timeout do leitor laser');
        }
      }, 30000); // 30 segundos
      
      return () => clearTimeout(timeout);
    }
  }, [currentMethod, methods.laser, handleMethodError]);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    console.log('📹 Iniciando câmera...');
    
    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        
        // Timeout para detectar falha na câmera
        const cameraTimeout = setTimeout(() => {
          if (methods.camera.status === 'scanning' && !methods.camera.lastResult) {
            console.log('⏰ Timeout da câmera detectado');
            handleMethodError('camera', 'Timeout da câmera');
          }
        }, 45000); // 45 segundos para câmera
        
        // Iniciar escaneamento automático
         codeReaderRef.current.decodeFromVideoDevice(
           null,
           videoRef.current,
          (result, error) => {
            if (result) {
              const code = result.getText();
              console.log('✅ Código detectado pela câmera:', code);
              
              clearTimeout(cameraTimeout);
              
              setMethods(prev => ({
                ...prev,
                camera: { ...prev.camera, status: 'success', lastResult: code }
              }));
              
              onScanResult(code, 'camera');
              
              toast({
                title: "Código detectado pela câmera!",
                description: `Código: ${code}`,
              });
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error('❌ Erro na câmera:', error);
              clearTimeout(cameraTimeout);
              handleMethodError('camera', 'Erro durante o escaneamento');
            }
          }
        );
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar câmera:', error);
      setMethods(prev => ({
        ...prev,
        camera: { ...prev.camera, status: 'error', error: 'Erro ao acessar câmera' }
      }));
      
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
      
      // Tratar erro da câmera
      handleMethodError('camera', 'Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }, [onScanResult, toast, methods.camera, handleMethodError]);

  // Parar câmera
  const stopCamera = useCallback(() => {
    console.log('📹 Parando câmera...');
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    setIsCameraActive(false);
  }, []);

  // Entrada manual
  const handleManualSubmit = useCallback(() => {
    if (manualInput.trim()) {
      console.log('✅ Código manual inserido:', manualInput);
      
      setMethods(prev => ({
        ...prev,
        manual: { ...prev.manual, status: 'success', lastResult: manualInput }
      }));
      
      onScanResult(manualInput.trim(), 'manual');
      
      toast({
        title: "Código inserido manualmente!",
        description: `Código: ${manualInput}`,
      });
      
      setManualInput('');
    }
  }, [manualInput, onScanResult, toast]);

  // Efeitos
  useEffect(() => {
    detectLaserReaders();
    
    return () => {
      removeLaserListener();
      stopCamera();
    };
  }, [detectLaserReaders, removeLaserListener, stopCamera]);

  // Renderizar ícone do método
  const renderMethodIcon = (method: ScanMethod) => {
    const state = methods[method];
    
    switch (method) {
      case 'laser':
        return <Zap className={`w-5 h-5 ${state.active ? 'text-blue-500' : 'text-gray-400'}`} />;
      case 'camera':
        return <Camera className={`w-5 h-5 ${state.active ? 'text-green-500' : 'text-gray-400'}`} />;
      case 'manual':
        return <Keyboard className={`w-5 h-5 ${state.active ? 'text-orange-500' : 'text-gray-400'}`} />;
    }
  };

  // Renderizar status do método
  const renderMethodStatus = (method: ScanMethod) => {
    const state = methods[method];
    
    if (!state.available) {
      return <Badge variant="secondary">Indisponível</Badge>;
    }
    
    if (state.active) {
      switch (state.status) {
        case 'scanning':
          return <Badge variant="default">Ativo</Badge>;
        case 'success':
          return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
        case 'error':
          return <Badge variant="destructive">Erro</Badge>;
      }
    }
    
    return <Badge variant="outline">Inativo</Badge>;
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="w-6 h-6" />
          Scanner de Código de Barras
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Escolha o método de escaneamento desejado
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status dos Métodos */}
        <div className="grid grid-cols-3 gap-4">
          {(['laser', 'camera', 'manual'] as ScanMethod[]).map((method, index) => {
            const state = methods[method];
            const isActive = state.active;
            const isScanning = state.status === 'scanning';
            const hasError = state.status === 'error';
            const hasSuccess = state.status === 'success';
            
            return (
              <div 
                key={method}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? hasError 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                      : hasSuccess
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : state.available
                    ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    : 'border-gray-100 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => state.available && activateMethod(method)}
              >
                {/* Indicador de status */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-500 text-white">
                    ✓
                  </div>
                )}
                
                {/* Animação de escaneamento */}
                {isScanning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent animate-pulse" />
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  {renderMethodIcon(method)}
                  <span className="font-medium">
                    {method === 'laser' ? 'Leitor Laser' : method === 'camera' ? 'Câmera' : 'Entrada Manual'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  {renderMethodStatus(method)}
                  {isScanning && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                
                {/* Feedback específico do método */}
                {isActive && (
                  <div className="text-xs text-muted-foreground">
                    {method === 'laser' && isScanning && '🎯 Aguardando leitura...'}
                    {method === 'camera' && isScanning && '📹 Escaneando com câmera...'}
                    {method === 'manual' && isScanning && '⌨️ Digite o código...'}
                    {hasSuccess && `✅ Último: ${state.lastResult?.substring(0, 10)}...`}
                    {hasError && `❌ ${state.error || 'Erro desconhecido'}`}
                  </div>
                )}
                
                {!state.available && (
                  <div className="text-xs text-red-500">
                    ❌ Indisponível
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Método Ativo */}
        {Object.values(methods).some(method => method.active) && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">Método Ativo:</span>
              <Badge variant="default">
                {currentMethod === 'laser' ? 'Leitor Laser' : 
                 currentMethod === 'camera' ? 'Câmera' : 'Entrada Manual'}
              </Badge>
            </div>
          
          {currentMethod === 'laser' && methods.laser.active && (
            <p className="text-sm text-muted-foreground">
              🎯 Aponte o leitor laser para o código de barras
            </p>
          )}
          
          {currentMethod === 'camera' && methods.camera.active && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                📹 Use a câmera integrada abaixo
              </p>
              <div className="relative bg-black rounded-lg overflow-hidden">
                 <video 
                   ref={videoRef}
                   className="w-full h-64 object-cover"
                   autoPlay
                   playsInline
                   muted
                 />
                 <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-green-400 rounded-lg">
                     <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                     <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                     <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                     <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
                   </div>
                 </div>
                 {!isCameraActive && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                     <Button onClick={() => startCamera()} className="flex items-center gap-2">
                       <Video className="w-4 h-4" />
                       Iniciar Câmera
                     </Button>
                   </div>
                 )}
               </div>
            </div>
          )}
          
          {currentMethod === 'manual' && methods.manual.active && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ⌨️ Digite o código manualmente:
              </p>
              <div className="flex gap-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Digite o código de barras..."
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Instruções */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Clique em um dos métodos acima para começar o escaneamento
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiBarcodeReader;