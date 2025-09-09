import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { MultiBarcodeReader } from "@/components/ui/multi-barcode-scanner";
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
  user?: {
    id: string;
    username: string;
  } | null;
  createdAt: string;
}

export default function ScannerPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get recent scans
  const { data: recentScans, isLoading } = useQuery({
    queryKey: ['/api/barcode-scans'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/barcode-scans');
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
      const response = await apiRequest('POST', '/api/barcode-scans', {
        ...data,
        userId: user?.id || 'anonymous-user'
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

  // Função para lidar com código escaneado
  const handleScanResult = (code: string, method: 'laser' | 'camera' | 'manual') => {
    setScannedCode(code);
    
    // Automatically create scan record
    createScanMutation.mutate({
      scannedCode: code,
      scanType: method,
      scanPurpose: 'inventory',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'scanner-page',
        method: method
      }
    });
    
    toast({
      title: "Código escaneado com sucesso!",
      description: `Método: ${method === 'laser' ? 'Laser' : method === 'camera' ? 'Câmera' : 'Manual'} - Código: ${code}`,
    });
  };

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
              <h2 className="text-xl font-semibold">Scanner Multi-Método</h2>
            </div>

            <MultiBarcodeReader
              onScanResult={handleScanResult}
              className="w-full"
            />

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
                          <span>{scan.user?.username || 'Usuário não encontrado'}</span>
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