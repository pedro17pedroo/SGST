import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Package, MapPin, Calendar, Truck, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const response = await fetch(`/api/public/track/${encodeURIComponent(trackingNumber)}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro ao buscar informações de rastreamento');
  }
  
  return response.json();
}

export default function PublicTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: trackingInfo, isLoading, error, refetch } = useQuery({
    queryKey: ['public-tracking', trackingNumber],
    queryFn: () => fetchTrackingInfo(trackingNumber),
    enabled: searchTriggered && trackingNumber.trim() !== '',
    retry: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearchTriggered(true);
      refetch();
    }
  };

  const handleReset = () => {
    setTrackingNumber("");
    setSearchTriggered(false);
  };

  const statusInfo = trackingInfo ? getStatusInfo(trackingInfo.status) : null;
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="text-page-title">
            Rastreamento de Encomendas
          </h1>
          <p className="text-lg text-gray-600">
            Acompanhe o status da sua encomenda em tempo real
          </p>
        </div>

        {/* Search Form */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              Consultar Encomenda
            </CardTitle>
            <CardDescription className="text-center">
              Digite o número de rastreamento para consultar o status da sua encomenda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
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
                    onClick={handleReset}
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
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span data-testid="text-error-message">{error.message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <StatusIcon className="h-6 w-6" />
                  Status da Encomenda
                  <Badge className={statusInfo?.color} data-testid="badge-status">
                    {statusInfo?.label}
                  </Badge>
                </CardTitle>
                <CardDescription>{statusInfo?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Número de Rastreamento</Label>
                    <p className="font-mono text-lg" data-testid="text-tracking-number">{trackingInfo.trackingNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Transportadora</Label>
                    <p className="text-lg" data-testid="text-carrier">{trackingInfo.carrier || "Não informado"}</p>
                  </div>
                </div>

                {trackingInfo.estimatedDelivery && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Previsão de Entrega</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span data-testid="text-estimated-delivery">
                        {format(new Date(trackingInfo.estimatedDelivery), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                )}

                {trackingInfo.actualDelivery && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data de Entrega</Label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span data-testid="text-actual-delivery">
                        {format(new Date(trackingInfo.actualDelivery), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                )}

                {trackingInfo.shippingAddress && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Endereço de Entrega</Label>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-sm" data-testid="text-shipping-address">{trackingInfo.shippingAddress}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Information */}
            {trackingInfo.order && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Informações da Encomenda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Número da Encomenda</Label>
                      <p className="font-mono" data-testid="text-order-number">{trackingInfo.order.orderNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cliente</Label>
                      <p data-testid="text-customer-name">{trackingInfo.order.customerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Valor Total</Label>
                      <p className="font-semibold" data-testid="text-total-amount">
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
                        <Label className="text-sm font-medium text-gray-500 mb-3 block">Itens da Encomenda</Label>
                        <div className="space-y-2">
                          {trackingInfo.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg" data-testid={`item-${index}`}>
                              <div>
                                <p className="font-medium" data-testid={`text-product-name-${index}`}>{item.productName}</p>
                                <p className="text-sm text-gray-500" data-testid={`text-quantity-${index}`}>Quantidade: {item.quantity}</p>
                              </div>
                              <p className="font-semibold" data-testid={`text-item-price-${index}`}>
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

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Encomenda criada em {format(new Date(trackingInfo.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-gray-500 text-sm">
          <p>
            Dúvidas sobre sua encomenda? Entre em contacto connosco.
          </p>
        </div>
      </div>
    </div>
  );
}