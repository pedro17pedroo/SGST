import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  User,
  LogIn,
  Building,
  Eye,
  EyeOff,
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

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

const loginSchema = z.object({
  username: z.string().min(3, "Nome de utilizador deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Deve aceitar os termos e condições para continuar",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

export default function CustomerPortal() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const { data: trackingInfo, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-tracking', trackingNumber],
    queryFn: () => fetchTrackingInfo(trackingNumber),
    enabled: searchTriggered && trackingNumber.trim() !== '',
    retry: false
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      acceptTerms: false,
    },
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

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoginLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: data.username,
          password: data.password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${result.user.username}!`,
        });
        setLoginDialogOpen(false);
        login(result.user);
      } else {
        toast({
          title: "Erro de login",
          description: result.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const statusInfo = trackingInfo ? getStatusInfo(trackingInfo.status) : null;
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SGST</h1>
                <p className="text-sm text-gray-500">Portal do Cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="inline w-4 h-4 mr-1" />
                Disponível 24/7
              </div>
              <ThemeToggle />
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Iniciar Sessão
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de Utilizador</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Digite o seu nome de utilizador"
                                  className="pl-10"
                                  {...field}
                                  data-testid="input-header-username"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Palavra-passe</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Digite a sua palavra-passe"
                                  className="pl-10 pr-10"
                                  {...field}
                                  data-testid="input-header-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-header-password"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-header-accept-terms"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                Aceito os{" "}
                                <a 
                                  href="/terms" 
                                  className="text-primary hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  termos e condições
                                </a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoginLoading}
                        data-testid="button-header-login"
                      >
                        {isLoginLoading ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="text-center space-y-2 mt-4 pt-4 border-t">
                    <a 
                      href="/forgot-password" 
                      className="text-sm text-primary hover:underline block"
                      data-testid="link-header-forgot-password"
                    >
                      Esqueceu a sua palavra-passe?
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Não tem conta?{" "}
                      <a 
                        href="/register" 
                        className="text-primary hover:underline"
                        data-testid="link-header-register"
                      >
                        Criar conta
                      </a>
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Bem-vindo ao Portal do Cliente
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rastreie suas encomendas e acesse informações de entrega
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
            <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto">
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
            <div className="space-y-6 max-w-4xl mx-auto">
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
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Rastreamento em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acompanhe suas encomendas em tempo real com informações precisas de localização e status.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Entrega Garantida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Garantimos a entrega segura de suas encomendas com atualizações constantes do status.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Suporte 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Nossa equipe está disponível 24 horas por dia para ajudar com suas dúvidas e necessidades.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-2">
            Dúvidas sobre suas encomendas? Entre em contacto connosco.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="/contact" className="hover:text-gray-900">Contacto</a>
            <a href="/help" className="hover:text-gray-900">Ajuda</a>
            <a href="/terms" className="hover:text-gray-900">Termos</a>
            <a href="/privacy" className="hover:text-gray-900">Privacidade</a>
          </div>
        </div>
      </div>
    </div>
  );
}