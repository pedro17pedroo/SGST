import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Building
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { apiRequest } from "@/lib/queryClient";

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  carrier: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  shippingAddress: string;
  createdAt: string;
  order: {
    orderNumber: string;
    customerName: string;
    totalAmount: string;
  } | null;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
  }>;
}



function getStatusInfo(status: string) {
  const statusMap = {
    preparing: {
      label: "Preparando",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Package,
      description: "Sua encomenda está sendo preparada para envio"
    },
    shipped: {
      label: "Enviado",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Truck,
      description: "Sua encomenda está a caminho"
    },
    in_transit: {
      label: "Em Trânsito",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Truck,
      description: "Sua encomenda está em transporte"
    },
    out_for_delivery: {
      label: "Saiu para Entrega",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: MapPin,
      description: "Sua encomenda está com o entregador"
    },
    delivered: {
      label: "Entregue",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      description: "Sua encomenda foi entregue com sucesso"
    },
    cancelled: {
      label: "Cancelado",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      description: "Esta encomenda foi cancelada"
    },
    delayed: {
      label: "Atrasado",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: AlertCircle,
      description: "Houve um atraso na entrega da sua encomenda"
    }
  };

  return statusMap[status as keyof typeof statusMap] || {
    label: status,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Clock,
    description: "Status da encomenda"
  };
}

async function fetchTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
  const response = await apiRequest('GET', `/api/public/track/${encodeURIComponent(trackingNumber)}`);
  return response.json();
}

export default function CustomerPortal() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [, setLocation] = useLocation();

  const { data: trackingInfo, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-tracking', trackingNumber],
    queryFn: () => fetchTrackingInfo(trackingNumber),
    enabled: searchTriggered && trackingNumber.trim() !== '',
    retry: false
  });



  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearchTriggered(true);
      refetch();
    }
  };

  const handleTrackingReset = () => {
    setTrackingNumber("");
    setSearchTriggered(false);
  };



  const statusInfo = trackingInfo ? getStatusInfo(trackingInfo.status) : null;
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SGST</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Plataforma SGST</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="inline w-4 h-4 mr-1" />
                Disponível 24/7
              </div>
              <ThemeToggle />
              <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => setLocation('/login')}
                >
                  Entrar
                </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Bem-vindo à Plataforma SGST
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sistema de gestão de stock e rastreamento - Acesse a plataforma ou consulte o status das suas encomendas
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                Rastreamento de Encomendas
              </CardTitle>
              <CardDescription className="text-center">
                Digite o número de rastreamento para consultar o status da sua encomenda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackingSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Número de Rastreamento</Label>
                  <Input
                    id="trackingNumber"
                    type="text"
                    placeholder="Ex: CT123456789PT ou SHIP-2024-001"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="text-center text-lg"
                    data-testid="input-tracking-number"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                    data-testid="button-search"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Consultar
                      </>
                    )}
                  </Button>
                  {searchTriggered && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleTrackingReset}
                      data-testid="button-reset"
                    >
                      Nova Consulta
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span data-testid="text-error-message">{error.message}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking Results */}
          {trackingInfo && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Status Card */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 dark:text-gray-100">
                    <StatusIcon className="h-6 w-6" />
                    Status da Encomenda
                    <Badge className={statusInfo?.color} data-testid="badge-status">
                      {statusInfo?.label}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">{statusInfo?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Número de Rastreamento</Label>
                      <p className="font-mono text-lg dark:text-gray-100" data-testid="text-tracking-number">{trackingInfo.trackingNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transportadora</Label>
                      <p className="text-lg dark:text-gray-100" data-testid="text-carrier">{trackingInfo.carrier || "Não informado"}</p>
                    </div>
                  </div>

                  {trackingInfo.estimatedDelivery && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Previsão de Entrega</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="dark:text-gray-100" data-testid="text-estimated-delivery">
                          {format(new Date(trackingInfo.estimatedDelivery), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  )}

                  {trackingInfo.shippingAddress && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Endereço de Entrega</Label>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <span className="text-sm dark:text-gray-100" data-testid="text-shipping-address">{trackingInfo.shippingAddress}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Information */}
              {trackingInfo.order && (
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                      <Package className="h-5 w-5" />
                      Informações da Encomenda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Número da Encomenda</Label>
                        <p className="font-mono dark:text-gray-100" data-testid="text-order-number">{trackingInfo.order.orderNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</Label>
                        <p className="dark:text-gray-100" data-testid="text-customer-name">{trackingInfo.order.customerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor Total</Label>
                        <p className="font-semibold dark:text-gray-100" data-testid="text-total-amount">
                          {new Intl.NumberFormat('pt-AO', {
                            style: 'currency',
                            currency: 'AOA'
                          }).format(parseFloat(trackingInfo.order.totalAmount))}
                        </p>
                      </div>
                    </div>

                    {trackingInfo.items.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 block">Itens da Encomenda</Label>
                          <div className="space-y-2">
                            {trackingInfo.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" data-testid={`item-${index}`}>
                                <div>
                                  <p className="font-medium dark:text-gray-100" data-testid={`text-product-name-${index}`}>{item.productName}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-quantity-${index}`}>Quantidade: {item.quantity}</p>
                                </div>
                                <p className="font-semibold dark:text-gray-100" data-testid={`text-item-price-${index}`}>
                                  {new Intl.NumberFormat('pt-AO', {
                                    style: 'currency',
                                    currency: 'AOA'
                                  }).format(parseFloat(item.unitPrice))}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center dark:bg-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg dark:text-gray-100">Rastreamento em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Acompanhe suas encomendas em tempo real com informações precisas de localização e status.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center dark:bg-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg dark:text-gray-100">Entrega Garantida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Garantimos a entrega segura de suas encomendas com atualizações constantes do status.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center dark:bg-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg dark:text-gray-100">Suporte 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Nossa equipe está disponível 24 horas por dia para ajudar com suas dúvidas e necessidades.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center py-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Dúvidas sobre suas encomendas? Entre em contacto connosco.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="/contact" className="hover:text-gray-900 dark:hover:text-gray-100">Contacto</a>
            <a href="/help" className="hover:text-gray-900 dark:hover:text-gray-100">Ajuda</a>
            <a href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100">Termos</a>
            <a href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100">Privacidade</a>
          </div>
        </div>
      </div>
    </div>
  );
}