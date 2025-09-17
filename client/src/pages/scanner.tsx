import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { MultiBarcodeReader } from "@/components/ui/multi-barcode-scanner";
import { 
  useBarcodeScans, 
  useProductByBarcode, 
  useCreateBarcodeScan, 
  useBarcodeScanningStats,
  CreateBarcodeScanData 
} from "@/hooks/use-barcode-scanning";
import { useWarehouses } from '@/hooks/api/use-warehouses';
import { 
  Scan, 
  Package, 
  MapPin, 
  Clock, 
  User, 
  BarChart3, 
  Search,
  Camera,
  Zap,
  Edit3,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScanResult {
  code: string;
  method: 'laser' | 'camera' | 'manual';
  timestamp: Date;
}

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState("scanner");
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [scanPurpose, setScanPurpose] = useState<CreateBarcodeScanData['purpose']>("inventory");
  const [manualCode, setManualCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Hooks para dados
  const { data: warehouses } = useWarehouses();
  const { data: recentScans, isLoading: isLoadingScans, refetch: refetchScans } = useBarcodeScans({ limit: 20 });
  const { data: productData, isLoading: isLoadingProduct } = useProductByBarcode(currentScan?.code || "");
  const { data: stats } = useBarcodeScanningStats();
  const createScanMutation = useCreateBarcodeScan();
  
  // Selecionar primeiro armazém por padrão
  useEffect(() => {
    if (warehouses?.data && warehouses.data.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses.data[0].id);
    }
  }, [warehouses, selectedWarehouse]);
  
  // Notificar quando produto for encontrado ou não encontrado
  useEffect(() => {
    if (currentScan && !isLoadingProduct) {
      if (productData?.data) {
        toast({
          title: "Produto encontrado!",
          description: `${productData.data.name} - ${productData.data.sku}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: `Código: ${currentScan.code}`,
          variant: "destructive",
        });
      }
    }
  }, [currentScan, productData, isLoadingProduct, toast]);
  
  // Função para processar escaneamento
  const handleScanResult = (code: string, method: 'laser' | 'camera' | 'manual') => {
    const scanResult: ScanResult = {
      code,
      method,
      timestamp: new Date()
    };
    
    setCurrentScan(scanResult);
    
    // Criar registro de escaneamento
    if (selectedWarehouse && user?.id) {
      createScanMutation.mutate({
        barcode: code,
        scanType: 'barcode',
        purpose: scanPurpose,
        warehouseId: selectedWarehouse,
        userId: user.id,
        metadata: {
          method,
          timestamp: scanResult.timestamp.toISOString(),
          source: 'scanner-page',
          userAgent: navigator.userAgent
        }
      });
    }
    
    // Mudar para aba de detalhes automaticamente
    setActiveTab("details");
  };
  
  // Função para escaneamento manual
  const handleManualScan = () => {
    if (manualCode.trim()) {
      handleScanResult(manualCode.trim(), 'manual');
      setManualCode("");
    }
  };
  
  // Função para buscar produto
  const handleSearchProduct = () => {
    if (searchCode.trim()) {
      setCurrentScan({
        code: searchCode.trim(),
        method: 'manual',
        timestamp: new Date()
      });
      setActiveTab("details");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Escaneamento de Códigos" 
        breadcrumbs={["Escaneamento de Códigos"]} 
      />
      
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localização
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Auditoria
            </TabsTrigger>
          </TabsList>

          {/* Aba Scanner */}
          <TabsContent value="scanner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configurações de Escaneamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    Configurações de Escaneamento
                  </CardTitle>
                  <CardDescription>
                    Configure o armazém e propósito do escaneamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse">Armazém</Label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um armazém" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses?.data?.map((warehouse: any) => (
                           <SelectItem key={warehouse.id} value={warehouse.id}>
                             {warehouse.name} ({warehouse.code})
                           </SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Propósito</Label>
                    <Select value={scanPurpose} onValueChange={(value: CreateBarcodeScanData['purpose']) => setScanPurpose(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory">Inventário</SelectItem>
                        <SelectItem value="picking">Separação</SelectItem>
                        <SelectItem value="receiving">Recebimento</SelectItem>
                        <SelectItem value="shipping">Expedição</SelectItem>
                        <SelectItem value="counting">Contagem</SelectItem>
                        <SelectItem value="tracking">Rastreamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Scanner Multi-Método */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Scanner Multi-Método
                  </CardTitle>
                  <CardDescription>
                    Use laser, câmera ou entrada manual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MultiBarcodeReader
                    onScanResult={handleScanResult}
                    className="w-full"
                  />
                  
                  {/* Entrada Manual */}
                  <div className="space-y-2">
                    <Label htmlFor="manual-code">Entrada Manual</Label>
                    <div className="flex gap-2">
                      <Input
                        id="manual-code"
                        placeholder="Digite o código manualmente"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                      />
                      <Button onClick={handleManualScan} disabled={!manualCode.trim()}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Resultado do Último Escaneamento */}
            {currentScan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Último Escaneamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Código</Label>
                      <p className="font-mono font-semibold">{currentScan.code}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Método</Label>
                      <div className="flex items-center gap-2">
                        {currentScan.method === 'laser' && <Zap className="w-4 h-4" />}
                        {currentScan.method === 'camera' && <Camera className="w-4 h-4" />}
                        {currentScan.method === 'manual' && <Edit3 className="w-4 h-4" />}
                        <span className="capitalize">
                          {currentScan.method === 'laser' ? 'Leitor Laser' : 
                           currentScan.method === 'camera' ? 'Câmera' : 'Manual'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Horário</Label>
                      <p>{format(currentScan.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Detalhes do Produto */}
          <TabsContent value="details" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Detalhes do Produto</h2>
                <p className="text-muted-foreground">Informações completas do produto escaneado</p>
              </div>
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por código..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchProduct()}
                    className="w-64"
                  />
                  <Button onClick={handleSearchProduct} disabled={!searchCode.trim()}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {currentScan ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações do Produto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Informações do Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProduct ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : productData?.data ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Nome</Label>
                          <p className="font-semibold">{productData.data.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">SKU</Label>
                          <p className="font-mono">{productData.data.sku}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Código de Barras</Label>
                          <p className="font-mono">{productData.data.barcode}</p>
                        </div>
                        {productData.data.description && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Descrição</Label>
                            <p>{productData.data.description}</p>
                          </div>
                        )}
                        {productData.data.category && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Categoria</Label>
                            <Badge variant="outline">{productData.data.category.name}</Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Produto Encontrado
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                        <p className="font-semibold">Produto não encontrado</p>
                        <p className="text-sm text-muted-foreground">Código: {currentScan.code}</p>
                        <Badge variant="secondary" className="mt-2">
                          Produto Desconhecido
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Informações de Stock e Localização */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Stock e Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productData?.data ? (
                      <div className="space-y-4">
                        {productData.data.currentStock !== undefined && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Stock Atual</Label>
                            <p className="font-semibold text-lg">{productData.data.currentStock} unidades</p>
                          </div>
                        )}
                        {productData.data.location && (
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Localização</Label>
                            <div className="space-y-1">
                              {productData.data.location.warehouse && (
                                <p><strong>Armazém:</strong> {productData.data.location.warehouse.name}</p>
                              )}
                              {productData.data.location.zone && (
                                <p><strong>Zona:</strong> {productData.data.location.zone}</p>
                              )}
                              {productData.data.location.aisle && (
                                <p><strong>Corredor:</strong> {productData.data.location.aisle}</p>
                              )}
                              {productData.data.location.shelf && (
                                <p><strong>Prateleira:</strong> {productData.data.location.shelf}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {productData.data.lastScan && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Último Escaneamento</Label>
                            <div className="space-y-1">
                              <p>{format(new Date(productData.data.lastScan.scannedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                              {productData.data.lastScan.user && (
                                <p className="text-sm text-muted-foreground">
                                  Por: {productData.data.lastScan.user.name}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Info className="w-8 h-8 mx-auto mb-2" />
                        <p>Informações não disponíveis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Scan className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto escaneado</h3>
                  <p className="text-muted-foreground mb-4">
                    Escaneie um código ou use a busca para ver os detalhes do produto
                  </p>
                  <Button onClick={() => setActiveTab("scanner")}>
                    Ir para Scanner
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Histórico de Escaneamentos</h2>
                <p className="text-muted-foreground">Registro completo de todas as atividades de escaneamento</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => refetchScans()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {isLoadingScans ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border-b animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : recentScans?.data && recentScans.data.length > 0 ? (
                    recentScans.data.map((scan: any, index: number) => (
                      <div key={scan.id} className={`flex items-center space-x-4 p-4 hover:bg-muted/50 transition-colors ${
                        index !== recentScans.data.length - 1 ? 'border-b' : ''
                      }`}>
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          {scan.productId ? (
                            <Package className="w-5 h-5 text-primary-foreground" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono text-sm font-medium">
                              {scan.barcode}
                            </span>
                            <Badge variant={scan.productId ? "default" : "secondary"}>
                              {scan.productId ? "Produto" : "Desconhecido"}
                            </Badge>
                            <Badge variant="outline">
                              {scan.purpose}
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
                              <span>{scan.user?.name || 'Usuário não encontrado'}</span>
                            </div>
                            <span>
                              {format(new Date(scan.scannedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum escaneamento encontrado</h3>
                      <p className="text-muted-foreground">
                        Inicie um escaneamento para ver o histórico
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Localização */}
          <TabsContent value="location" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Rastreamento e Localização</h2>
              <p className="text-muted-foreground">Mapeamento de produtos no armazém</p>
            </div>
            
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O mapeamento visual de localização estará disponível em breve
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Auditoria */}
          <TabsContent value="audit" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Relatórios e Auditoria</h2>
              <p className="text-muted-foreground">Análise de atividades e estatísticas de escaneamento</p>
            </div>
            
            {/* Estatísticas */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Scan className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{stats.totalScans}</p>
                        <p className="text-sm text-muted-foreground">Total de Escaneamentos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{stats.successfulScans}</p>
                        <p className="text-sm text-muted-foreground">Produtos Encontrados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">{stats.unknownProducts}</p>
                        <p className="text-sm text-muted-foreground">Produtos Desconhecidos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.totalScans > 0 ? Math.round((stats.successfulScans / stats.totalScans) * 100) : 0}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Relatórios Detalhados</h3>
                <p className="text-muted-foreground">
                  Gráficos e análises avançadas estarão disponíveis em breve
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}