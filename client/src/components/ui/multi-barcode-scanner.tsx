import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { useToast } from '../../hooks/use-toast';
import { Scan, Camera, Zap, CheckCircle, Play, Square } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface MultiBarcodeReaderProps {
  onScanResult: (code: string, method: 'laser' | 'camera') => void;
  className?: string;
  hideMethodSelection?: boolean;
  forcedMethod?: 'laser' | 'camera';
  onCameraStart?: () => void;
  onScanComplete?: () => void;
}

type ScanMethod = 'laser' | 'camera';
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
  className = '',
  hideMethodSelection = false,
  forcedMethod,
  onCameraStart,
  onScanComplete
}) => {
  const { toast } = useToast();

  const [currentMethod, setCurrentMethod] = useState<ScanMethod>('laser');
  const laserListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null);
  const laserBufferRef = useRef('');
  const laserTimeoutRef = useRef<number | null>(null);
  
  // Refs para câmera
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanningIntervalRef = useRef<number | null>(null);
  
  // Estados para cada método de escaneamento
  const [methods, setMethods] = useState<Record<ScanMethod, ScanMethodState>>({
    laser: { available: false, active: false, status: 'idle' },
    camera: { available: true, active: false, status: 'idle' }
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



  // Configurar leitor de código de barras com suporte a todos os formatos
  const setupBarcodeReader = useCallback(() => {
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      // Configurar hints para melhor detecção
      const hints = new Map();
      
      // Suporte a todos os formatos de código de barras
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODABAR,
        BarcodeFormat.ITF,
        BarcodeFormat.RSS_14,
        BarcodeFormat.RSS_EXPANDED,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.PDF_417,
        BarcodeFormat.AZTEC
      ]);
      
      // Melhorar precisão para códigos pequenos e grandes
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.PURE_BARCODE, false);
      
      codeReaderRef.current.hints = hints;
    }
    return codeReaderRef.current;
  }, []);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    console.log('📹 Iniciando câmera...');
    
    // Chamar callback quando a câmera for iniciada
    if (onCameraStart) {
      onCameraStart();
    }
    
    try {
      // Configurar leitor com suporte aprimorado
      setupBarcodeReader();
      
      // Solicitar câmera com configurações otimizadas
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        
        // Aguardar o vídeo carregar antes de iniciar o escaneamento
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
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
      
      handleMethodError('camera', 'Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }, [setupBarcodeReader, onScanResult, toast, handleMethodError, onCameraStart]);

  // Iniciar escaneamento
   const startScanning = useCallback(() => {
     if (!codeReaderRef.current || !videoRef.current || isScanning) return;
     
     console.log('🔍 Iniciando escaneamento...');
     setIsScanning(true);
     
     setMethods(prev => ({
       ...prev,
       camera: { ...prev.camera, status: 'scanning' }
     }));
     
     // Escaneamento contínuo com múltiplas tentativas
     const scanFrame = async () => {
       if (!codeReaderRef.current || !videoRef.current) return;
       
       try {
         const result = await codeReaderRef.current.decodeFromVideoElement(videoRef.current);
         
         if (result) {
           const code = result.getText();
           console.log('✅ Código detectado pela câmera:', code);
           
           // Parar escaneamento após sucesso
           setIsScanning(false);
           
           if (scanningIntervalRef.current) {
             cancelAnimationFrame(scanningIntervalRef.current);
             scanningIntervalRef.current = null;
           }
           
           setMethods(prev => ({
             ...prev,
             camera: { ...prev.camera, status: 'success', lastResult: code }
           }));
           
           onScanResult(code, 'camera');
           
           toast({
             title: "Código detectado pela câmera!",
             description: `Código: ${code}`,
           });
           
           // Chamar callback quando o escaneamento for concluído
           if (onScanComplete) {
             onScanComplete();
           }
           
           // Parar câmera automaticamente após leitura bem-sucedida
           setTimeout(() => {
             if (videoRef.current && videoRef.current.srcObject) {
               const stream = videoRef.current.srcObject as MediaStream;
               stream.getTracks().forEach(track => track.stop());
               videoRef.current.srcObject = null;
             }
             
             if (codeReaderRef.current) {
               codeReaderRef.current.reset();
             }
             
             setIsCameraActive(false);
             
             setMethods(prev => ({
               ...prev,
               camera: { ...prev.camera, status: 'idle', active: false }
             }));
           }, 2000);
           
           return;
         }
       } catch (error) {
         // Ignorar erros de NotFoundException (normal durante escaneamento)
         if (!(error instanceof NotFoundException)) {
           console.error('❌ Erro durante escaneamento:', error);
         }
       }
       
       // Continuar escaneamento se ainda estiver ativo
       if (isScanning) {
         scanningIntervalRef.current = requestAnimationFrame(scanFrame);
       }
     };
     
     // Iniciar loop de escaneamento
     scanFrame();
   }, [isScanning, onScanResult, toast]);

  // Parar escaneamento
  const stopScanning = useCallback(() => {
    console.log('⏹️ Parando escaneamento...');
    setIsScanning(false);
    
    if (scanningIntervalRef.current) {
      cancelAnimationFrame(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }
    
    setMethods(prev => ({
      ...prev,
      camera: { ...prev.camera, status: 'idle' }
    }));
  }, []);

  // Parar câmera
  const stopCamera = useCallback(() => {
    console.log('📹 Parando câmera...');
    
    // Parar escaneamento primeiro
    stopScanning();
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    setIsCameraActive(false);
    
    setMethods(prev => ({
      ...prev,
      camera: { ...prev.camera, status: 'idle', active: false }
    }));
  }, [stopScanning]);

  // Ativar método de escaneamento com priorização
  const activateMethod = useCallback(async (method: ScanMethod) => {
    console.log(`🔄 Ativando método: ${method}`);
    
    // Parar câmera se estiver ativa
    if (isCameraActive) {
      stopCamera();
    }
    
    // Remover listener laser se ativo
    removeLaserListener();
    
    // Desativar outros métodos e verificar disponibilidade
    setMethods(prev => {
      // Verificar se o método está disponível
      if (!prev[method].available) {
        console.log(`❌ Método ${method} não está disponível`);
        toast({
          title: "Método indisponível",
          description: `O método ${method} não está disponível no momento.`,
          variant: "destructive",
        });
        return prev; // Não fazer alterações se não estiver disponível
      }
      
      const newMethods = { ...prev };
      Object.keys(newMethods).forEach(key => {
        newMethods[key as ScanMethod].active = false;
        newMethods[key as ScanMethod].status = 'idle';
        newMethods[key as ScanMethod].error = undefined;
      });
      return newMethods;
    });
    
    setCurrentMethod(method);
    
    
    // Ativar o método específico
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
    }
  }, [setupLaserListener, removeLaserListener, isCameraActive, stopCamera, toast]);



  // Efeitos
  useEffect(() => {
    detectLaserReaders();
    
    return () => {
      // Limpeza completa ao desmontar componente
      removeLaserListener();
      
      // Parar escaneamento
      setIsScanning(false);
      if (scanningIntervalRef.current) {
        cancelAnimationFrame(scanningIntervalRef.current);
        scanningIntervalRef.current = null;
      }
      
      // Parar câmera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [detectLaserReaders, removeLaserListener]);

  // Ativar método forçado automaticamente
  useEffect(() => {
    if (forcedMethod && !methods[forcedMethod].active) {
      activateMethod(forcedMethod);
    }
  }, [forcedMethod, methods, activateMethod]);

  // Renderizar ícone do método
  const renderMethodIcon = (method: ScanMethod) => {
    const state = methods[method];
    
    switch (method) {
      case 'laser':
        return <Zap className={`w-5 h-5 ${state.active ? 'text-blue-500' : 'text-gray-400'}`} />;
      case 'camera':
        return <Camera className={`w-5 h-5 ${state.active ? 'text-green-500' : 'text-gray-400'}`} />;
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
      <CardContent className="p-4 space-y-4">
        {/* Status dos Métodos */}
        {!hideMethodSelection && (
        <div className="grid grid-cols-2 gap-4">
          {(['laser', 'camera'] as ScanMethod[]).map((method) => {
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
                    {method === 'laser' ? 'Leitor Laser' : 'Câmera'}
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
        )}

        {/* Método Ativo */}
        {Object.values(methods).some(method => method.active) && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">Método Ativo:</span>
              <Badge variant="default">
                {currentMethod === 'laser' ? 'Leitor Laser' : 'Câmera'}
              </Badge>
            </div>
          
          {currentMethod === 'laser' && methods.laser.active && (
            <p className="text-sm text-muted-foreground">
              🎯 Aponte o leitor laser para o código de barras
            </p>
          )}
          
          {currentMethod === 'camera' && methods.camera.active && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  📹 Use a câmera integrada para escanear códigos de barras
                </p>
                <div className="flex gap-2">
                  {!isCameraActive ? (
                    <Button 
                      onClick={startCamera} 
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Câmera
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      {!isScanning ? (
                        <Button 
                          onClick={startScanning} 
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <Scan className="w-4 h-4" />
                          Iniciar Escaneamento
                        </Button>
                      ) : (
                        <Button 
                          onClick={stopScanning} 
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                          size="sm"
                        >
                          <Square className="w-4 h-4" />
                          Parar Escaneamento
                        </Button>
                      )}
                      <Button 
                        onClick={stopCamera} 
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                        size="sm"
                        variant="destructive"
                      >
                        <Square className="w-4 h-4" />
                        Parar Câmera
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden">
                 <video 
                   ref={videoRef}
                   className="w-full h-80 object-cover"
                   autoPlay
                   playsInline
                   muted
                 />
                 
                 {/* Overlay de escaneamento */}
                 <div className="absolute inset-0 pointer-events-none">
                   {/* Área de foco principal */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-green-400 rounded-lg">
                     {/* Cantos da área de foco */}
                     <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                     <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                     <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                     <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                     
                     {/* Linha de escaneamento animada */}
                     {isScanning && (
                       <div className="absolute inset-0 overflow-hidden">
                         <div className="absolute w-full h-0.5 bg-green-400 animate-pulse" 
                              style={{
                                top: '50%',
                                boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                              }}>
                         </div>
                       </div>
                     )}
                   </div>
                   
                   {/* Status overlay */}
                   <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                     <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
                       {!isCameraActive && '📷 Câmera Desligada'}
                       {isCameraActive && !isScanning && '⏸️ Pronto para Escanear'}
                       {isCameraActive && isScanning && '🔍 Escaneando...'}
                     </div>
                     
                     {methods.camera.lastResult && (
                       <div className="bg-green-600 bg-opacity-90 text-white px-3 py-2 rounded-lg text-sm">
                         ✅ Último: {methods.camera.lastResult.substring(0, 12)}...
                       </div>
                     )}
                   </div>
                   
                   {/* Instruções */}
                   <div className="absolute bottom-4 left-4 right-4">
                     <div className="bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg text-center text-sm">
                       {!isCameraActive && '🎯 Clique em "Iniciar Câmera" para começar'}
                       {isCameraActive && !isScanning && '📱 Posicione o código de barras na área destacada e clique em "Iniciar Escaneamento"'}
                       {isCameraActive && isScanning && '🔍 Mantenha o código de barras na área destacada. Suporta todos os formatos!'}
                     </div>
                   </div>
                 </div>
                 
                 {/* Overlay quando câmera está desligada */}
                 {!isCameraActive && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
                     <div className="text-center text-white">
                       <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                       <p className="text-lg font-medium mb-2">Câmera Desligada</p>
                       <p className="text-sm opacity-75">Clique em "Iniciar Câmera" para começar</p>
                     </div>
                   </div>
                 )}
               </div>
               
               {/* Informações técnicas */}
               <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                 <div className="space-y-1">
                   <p className="font-medium">📊 Formatos Suportados:</p>
                   <p>QR Code, Code 128, Code 39, EAN-13, UPC-A, Data Matrix, PDF417, e mais</p>
                 </div>
                 <div className="space-y-1">
                   <p className="font-medium">🎯 Otimizações:</p>
                   <p>Detecção aprimorada para códigos pequenos e grandes, múltiplos formatos</p>
                 </div>
               </div>
            </div>
          )}
          

        </div>
        )}


      </CardContent>
    </Card>
  );
};

export default MultiBarcodeReader;