import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Scan, 
  Camera, 
  CheckCircle, 
  XCircle, 
  ScanLine,
  Video,
  AlertCircle,
  RotateCcw,
  FlashlightIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrowserMultiFormatReader, Result, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBarcodeScanned: (barcode: string) => void;
  currentValue?: string;
}

export function BarcodeScanner({ 
  open, 
  onOpenChange, 
  onBarcodeScanned, 
  currentValue 
}: BarcodeScannerProps) {
  const [activeTab, setActiveTab] = useState("camera");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [manualCode, setManualCode] = useState(currentValue || "");
  const [error, setError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();

  // Inicializar o leitor ZXing
  useEffect(() => {
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }
    
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  // Listar dispositivos de vídeo disponíveis
  const listVideoDevices = useCallback(async () => {
    try {
      if (!codeReaderRef.current) return;
      
      const devices = await codeReaderRef.current.listVideoInputDevices();
      setAvailableDevices(devices);
      
      if (devices.length > 0 && !selectedDeviceId) {
        // Preferir câmera traseira (environment) se disponível
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        setSelectedDeviceId(backCamera?.deviceId || devices[0].deviceId);
      }
    } catch (err) {
        // Erro ao listar dispositivos de vídeo
      setError('Não foi possível acessar os dispositivos de câmera');
    }
  }, [selectedDeviceId]);

  // Iniciar escaneamento com detecção melhorada e logs detalhados
  const startScanning = useCallback(async () => {
    // Iniciando escaneamento...
    
    if (!codeReaderRef.current) {
      // CodeReader não está disponível
      return;
    }
    
    if (!videoRef.current) {
      // Vídeo não está disponível
      return;
    }
    
    try {
      setIsScanning(true);
      setError(null);
      setScanResult(null);
      
      // Configurando escaneamento com dispositivo
      
      // ZXing-js usa configurações internas otimizadas automaticamente
      
      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId || null,
        videoRef.current,
        (result: Result | null, error?: Error) => {
          if (result) {
            const barcodeText = result.getText();
            // Código detectado automaticamente
            setScanResult(barcodeText);
            setScannedCode(barcodeText);
            
            // Parar escaneamento após sucesso
            stopScanning();
            
            toast({
              title: "Código escaneado com sucesso!",
              description: `Código: ${barcodeText}`,
            });
          }
          
          if (error && !(error instanceof NotFoundException)) {
            // Erro durante escaneamento
          }
        }
      );
      
      // Escaneamento iniciado com sucesso
    } catch (err) {
      // Erro ao iniciar escaneamento
      setError('Erro ao acessar a câmera. Verifique as permissões.');
      setIsScanning(false);
      
      toast({
        title: "Erro ao acessar câmera",
        description: "Verifique se você concedeu permissão para usar a câmera.",
        variant: "destructive",
      });
    }
  }, [selectedDeviceId, toast]);

  // Parar escaneamento
  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
    setTorchEnabled(false);
  }, []);

  // Alternar flash/lanterna
  const toggleTorch = useCallback(async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      
      if (track && 'torch' in track.getCapabilities()) {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled } as any]
        });
        setTorchEnabled(!torchEnabled);
      } else {
        toast({
          title: "Flash não disponível",
          description: "Este dispositivo não suporta controle de flash.",
          variant: "destructive",
        });
      }
    } catch (err) {
        // Erro ao controlar flash
      toast({
        title: "Erro no flash",
        description: "Não foi possível controlar o flash da câmera.",
        variant: "destructive",
      });
    }
  }, [torchEnabled, toast]);

  // Capturar frame manualmente - versão simplificada
  const captureFrame = useCallback(async () => {
    // Iniciando captura de frame...
    
    if (!codeReaderRef.current) {
      // CodeReader não está disponível
      return;
    }
    
    if (!videoRef.current) {
      // Vídeo não está disponível
      return;
    }
    
    if (videoRef.current.readyState !== 4) {
      // Vídeo não está pronto
      toast({
        title: "Vídeo não está pronto",
        description: "Aguarde o vídeo carregar completamente.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Criando canvas para captura...
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Não foi possível criar contexto do canvas');
      }
      
      // Definir dimensões do canvas
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      
      // Dimensões do canvas definidas
      
      // Desenhar frame atual do vídeo no canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Converter para data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      // Imagem capturada
      
      // Tentar decodificar
      // Tentando decodificar...
      const result = await codeReaderRef.current.decodeFromImage(undefined, imageDataUrl);
      
      if (result) {
        const barcodeText = result.getText();
        // Código encontrado
        
        setScanResult(barcodeText);
        setScannedCode(barcodeText);
        
        toast({
          title: "Código capturado com sucesso!",
          description: `Código: ${barcodeText}`,
        });
      } else {
        // Nenhum resultado retornado
        throw new Error('Nenhum código de barras detectado');
      }
      
    } catch (err) {
      // Erro ao capturar frame
      toast({
        title: "Nenhum código encontrado",
        description: "Tente posicionar melhor o código de barras na câmera.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Resetar scanner
  const resetScanner = useCallback(() => {
    stopScanning();
    setScannedCode("");
    setScanResult(null);
    setError(null);
  }, [stopScanning]);

  // Confirmar código escaneado
  const handleConfirmScanned = () => {
    if (scannedCode) {
      onBarcodeScanned(scannedCode);
      onOpenChange(false);
    }
  };

  // Confirmar código manual
  const handleConfirmManual = () => {
    if (manualCode.trim()) {
      onBarcodeScanned(manualCode.trim());
      onOpenChange(false);
    }
  };

  // Listar dispositivos quando o diálogo abrir
  useEffect(() => {
    if (open) {
      listVideoDevices();
    } else {
      stopScanning();
    }
  }, [open, listVideoDevices, stopScanning]);

  // Cleanup quando componente desmontar
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scanner de Código de Barras
          </DialogTitle>
          <DialogDescription>
            Escaneie um código de barras usando a câmera ou digite manualmente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Câmera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Leitura via Câmera
                </CardTitle>
                <CardDescription>
                  Use a câmera do dispositivo para capturar o código de barras
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seleção de câmera */}
                {availableDevices.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="camera-select">Selecionar Câmera:</Label>
                    <select
                      id="camera-select"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      disabled={isScanning}
                    >
                      {availableDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Câmera ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Área do vídeo */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  
                  {/* Overlay de escaneamento */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-green-500 w-64 h-32 relative">
                        <div className="absolute inset-0 border-2 border-green-500 animate-pulse" />
                        <ScanLine className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-green-500 animate-bounce" />
                      </div>
                    </div>
                  )}
                  
                  {/* Resultado do escaneamento */}
                  {scanResult && (
                    <div className="absolute bottom-4 left-4 right-4 bg-green-500 text-white p-2 rounded-md text-center">
                      <CheckCircle className="inline h-4 w-4 mr-2" />
                      Código detectado: {scanResult}
                    </div>
                  )}
                </div>

                {/* Controles */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {!isScanning ? (
                    <Button onClick={startScanning} className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Iniciar Escaneamento
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopScanning} variant="destructive" className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Parar Escaneamento
                      </Button>
                      
                      <Button onClick={captureFrame} variant="default" className="flex items-center gap-2">
                        <Scan className="h-4 w-4" />
                        Capturar Código
                      </Button>
                    </>
                  )}
                  
                  <Button onClick={resetScanner} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Resetar
                  </Button>
                  
                  {isScanning && (
                    <Button onClick={toggleTorch} variant="outline" className="flex items-center gap-2">
                      <FlashlightIcon className={cn("h-4 w-4", torchEnabled && "text-yellow-500")} />
                      {torchEnabled ? "Desligar" : "Ligar"} Flash
                    </Button>
                  )}
                </div>
                
                {/* Instruções */}
                {isScanning && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Posicione o código de barras na área verde.</p>
                    <p>A detecção é automática ou clique em "Capturar Código".</p>
                  </div>
                )}

                {/* Mensagens de erro */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {/* Resultado escaneado */}
                {scannedCode && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="space-y-2">
                      <Label>Código Escaneado:</Label>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <code className="text-green-700 font-mono">{scannedCode}</code>
                      </div>
                    </div>
                    <Button onClick={handleConfirmScanned} className="w-full flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Confirmar Código Escaneado
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5" />
                  Entrada Manual
                </CardTitle>
                <CardDescription>
                  Digite o código de barras manualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-code">Código de Barras:</Label>
                  <Input
                    id="manual-code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Digite o código de barras..."
                    className="font-mono"
                  />
                </div>
                
                <Button 
                  onClick={handleConfirmManual} 
                  disabled={!manualCode.trim()}
                  className="w-full flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmar Código Manual
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}