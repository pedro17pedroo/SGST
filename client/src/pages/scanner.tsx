import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Scan, Package, MapPin, Clock, User } from "lucide-react";

interface BarcodeScan {
  id: string;
  scannedCode: string;
  scanType: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
  } | null;
  warehouse?: {
    id: string;
    name: string;
  } | null;
  scanPurpose: string;
  user: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get recent scans
  const { data: recentScans, isLoading } = useQuery({
    queryKey: ['/api/barcode-scans'],
    queryFn: async () => {
      const response = await fetch('/api/barcode-scans');
      if (!response.ok) throw new Error('Failed to fetch barcode scans');
      return response.json() as Promise<BarcodeScan[]>;
    }
  });

  // Create barcode scan mutation
  const createScanMutation = useMutation({
    mutationFn: async (data: {
      scannedCode: string;
      scanType: string;
      scanPurpose: string;
      warehouseId?: string;
      metadata?: any;
    }) => {
      const response = await fetch('/api/barcode-scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user?.id || 'anonymous-user'
        })
      });
      if (!response.ok) throw new Error('Failed to create scan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/barcode-scans'] });
      toast({
        title: "Código escaneado com sucesso!",
        description: "O escaneamento foi registado no sistema.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao registar escaneamento",
        description: error.message,
      });
    }
  });

  const startScanning = () => {
    setIsScanning(true);
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        setScannedCode(decodedText);
        html5QrcodeScanner.clear();
        setIsScanning(false);
        
        // Automatically create scan record
        createScanMutation.mutate({
          scannedCode: decodedText,
          scanType: 'barcode',
          scanPurpose: 'inventory',
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        });
      },
      (errorMessage) => {
        console.log(`QR Code scanning failed: ${errorMessage}`);
      }
    );

    setScanner(html5QrcodeScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setIsScanning(false);
      setScanner(null);
    }
  };

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Escaneamento de Códigos" breadcrumbs={["Escaneamento de Códigos"]} />
      
      <div className="px-6 py-4 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scan className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Scanner</h2>
            </div>

            {!isScanning ? (
              <div className="text-center space-y-4">
                <div className="w-64 h-64 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Scan className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Clique para iniciar o escaneamento
                    </p>
                  </div>
                </div>
                <Button onClick={startScanning} data-testid="start-scan-button">
                  <Scan className="w-4 h-4 mr-2" />
                  Iniciar Escaneamento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div id="qr-reader" className="w-full"></div>
                <Button 
                  onClick={stopScanning} 
                  variant="outline"
                  data-testid="stop-scan-button"
                >
                  Parar Escaneamento
                </Button>
              </div>
            )}

            {scannedCode && (
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Último código escaneado:</p>
                <p className="font-mono font-semibold text-foreground" data-testid="scanned-code">
                  {scannedCode}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Scans Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Escaneamentos Recentes</h2>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-muted rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-muted-foreground/20 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : recentScans && recentScans.length > 0 ? (
                recentScans.slice(0, 10).map((scan) => (
                  <div key={scan.id} className="flex items-center space-x-3 p-3 bg-secondary rounded-lg" data-testid={`scan-item-${scan.id}`}>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      {scan.product ? (
                        <Package className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <Scan className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-sm font-medium">
                          {scan.scannedCode}
                        </span>
                        <Badge variant={scan.product ? "default" : "secondary"}>
                          {scan.product ? "Produto" : "Desconhecido"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {scan.product && (
                          <div className="flex items-center space-x-1">
                            <Package className="w-3 h-3" />
                            <span>{scan.product.name}</span>
                          </div>
                        )}
                        {scan.warehouse && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{scan.warehouse.name}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{scan.user.username}</span>
                        </div>
                        <span>
                          {new Date(scan.createdAt).toLocaleString('pt-PT')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Scan className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum escaneamento encontrado</p>
                  <p className="text-sm">Inicie um escaneamento para ver o histórico</p>
                </div>
              )}
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}