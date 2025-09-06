import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useToast } from "@/hooks/use-toast";
import { 
  useAlerts, 
  useCreateAlert, 
  useAcknowledgeAlert, 
  useResolveAlert,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  type Alert,
  type NotificationPreference
  // type AlertFormData, // Removido - não utilizado
  // type NotificationPreferenceFormData // Removido - não utilizado
} from "@/hooks/api/use-alerts";
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
 
  XCircle,
  Plus,
  Search,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Eye,
  Package,
  Warehouse,
  ShoppingCart,
  Building
} from "lucide-react";
import { z } from "zod";

// Alert Schema
const alertSchema = z.object({
  type: z.enum(["low_stock", "reorder_point", "expiry", "quality", "system"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "Título é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  entityType: z.enum(["product", "warehouse", "order", "supplier"]).optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  scheduledFor: z.string().optional(),
  expiresAt: z.string().optional(),
});

// Notification Preference Schema
const notificationPreferenceSchema = z.object({
  alertType: z.string().min(1, "Tipo de alerta é obrigatório"),
  channel: z.enum(["email", "sms", "push", "in_app"]),
  enabled: z.boolean(),
  threshold: z.any().optional(),
});

export default function AlertsPage() {

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  // const { toast } = useToast();

  const alertForm = useForm<z.infer<typeof alertSchema>>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      type: "system",
      priority: "medium",
      title: "",
      message: "",
      entityType: undefined,
      entityId: "",
      userId: "",
      scheduledFor: "",
      expiresAt: "",
    },
  });

  const preferenceForm = useForm<z.infer<typeof notificationPreferenceSchema>>({
    resolver: zodResolver(notificationPreferenceSchema),
    defaultValues: {
      alertType: "",
      channel: "in_app",
      enabled: true,
    },
  });

  // Hooks de API
  const { data: alerts, isLoading: isLoadingAlerts } = useAlerts();
  const { data: preferences } = useNotificationPreferences();
  const createAlertMutation = useCreateAlert();
  const acknowledgeAlertMutation = useAcknowledgeAlert();
  const resolveAlertMutation = useResolveAlert();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  // Funções de manipulação
  const handleCreateAlert = (data: z.infer<typeof alertSchema>) => {
    createAlertMutation.mutate(data, {
      onSuccess: () => {
        setIsAlertDialogOpen(false);
        alertForm.reset();
      }
    });
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  const handleResolveAlert = (alertId: string) => {
    resolveAlertMutation.mutate(alertId);
  };

  const handleSavePreference = (data: z.infer<typeof notificationPreferenceSchema>) => {
    // Adaptar dados para o formato esperado pelo hook
    const preferenceData = {
      userId: 'current-user', // Substituir pelo ID do usuário atual
      preferences: [data]
    };
    updatePreferencesMutation.mutate(preferenceData, {
      onSuccess: () => {
        setIsPreferencesDialogOpen(false);
        preferenceForm.reset();
      }
    });
  };













  const onAlertSubmit = (data: z.infer<typeof alertSchema>) => {
    handleCreateAlert(data);
  };

  const onPreferenceSubmit = (data: z.infer<typeof notificationPreferenceSchema>) => {
    handleSavePreference(data);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "low":
        return <Bell className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "high":
        return <Badge variant="destructive">Alto</Badge>;
      case "medium":
        return <Badge variant="secondary">Médio</Badge>;
      case "low":
        return <Badge variant="outline">Baixo</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive"><Bell className="w-3 h-3 mr-1" />Ativo</Badge>;
      case "acknowledged":
        return <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />Reconhecido</Badge>;
      case "resolved":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Resolvido</Badge>;
      case "dismissed":
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Dispensado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "low_stock":
        return <Badge variant="outline">Stock Baixo</Badge>;
      case "reorder_point":
        return <Badge variant="secondary">Ponto de Recompra</Badge>;
      case "expiry":
        return <Badge variant="destructive">Expiração</Badge>;
      case "quality":
        return <Badge variant="destructive">Qualidade</Badge>;
      case "system":
        return <Badge variant="default">Sistema</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getEntityIcon = (entityType?: string) => {
    switch (entityType) {
      case "product":
        return <Package className="w-4 h-4" />;
      case "warehouse":
        return <Warehouse className="w-4 h-4" />;
      case "order":
        return <ShoppingCart className="w-4 h-4" />;
      case "supplier":
        return <Building className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "push":
        return <Smartphone className="w-4 h-4" />;
      case "in_app":
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const alertsData = Array.isArray(alerts) ? alerts : alerts?.data || [];
  const filteredAlerts = alertsData.filter((alert: Alert) => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.entityName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const activeAlertsCount = alertsData.filter((a: Alert) => a.status === "active").length;
  const acknowledgedAlertsCount = alertsData.filter((a: Alert) => a.status === "acknowledged").length;
  const resolvedAlertsCount = alertsData.filter((a: Alert) => a.status === "resolved").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Alertas & Notificações
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerir alertas do sistema e preferências de notificação
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isPreferencesDialogOpen} onOpenChange={setIsPreferencesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="open-preferences">
                <Settings className="w-4 h-4 mr-2" />
                Preferências
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Preferências de Notificação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Canais de Notificação</h3>
                  {(Array.isArray(preferences) ? preferences : preferences?.data || []).map((pref: NotificationPreference) => (
                    <div key={pref.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getChannelIcon(pref.channel)}
                        <div>
                          <p className="text-sm font-medium">
                            {pref.alertType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pref.channel === 'email' && 'Notificações por email'}
                            {pref.channel === 'sms' && 'Notificações por SMS'}
                            {pref.channel === 'push' && 'Notificações push'}
                            {pref.channel === 'in_app' && 'Notificações na aplicação'}
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={pref.enabled} 
                        data-testid={`toggle-${pref.id}`}
                      />
                    </div>
                  ))}
                </div>

                <Form {...preferenceForm}>
                  <form onSubmit={preferenceForm.handleSubmit(onPreferenceSubmit)} className="space-y-4">
                    <FormField
                      control={preferenceForm.control}
                      name="alertType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Alerta</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-alert-type">
                                <SelectValue placeholder="Seleccione o tipo de alerta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low_stock">Stock Baixo</SelectItem>
                              <SelectItem value="reorder_point">Ponto de Recompra</SelectItem>
                              <SelectItem value="expiry">Expiração</SelectItem>
                              <SelectItem value="quality">Qualidade</SelectItem>
                              <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferenceForm.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canal de Notificação</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-channel">
                                <SelectValue placeholder="Seleccione o canal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in_app">Na Aplicação</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="push">Push</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsPreferencesDialogOpen(false)}
                        data-testid="button-cancel-preferences"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updatePreferencesMutation.isPending}
                        data-testid="button-save-preferences"
                      >
                        Guardar Preferência
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-alert-button">
                <Plus className="w-4 h-4 mr-2" />
                Novo Alerta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Novo Alerta</DialogTitle>
              </DialogHeader>
              <Form {...alertForm}>
                <form onSubmit={alertForm.handleSubmit(onAlertSubmit)} className="space-y-4">
                  <FormField
                    control={alertForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Alerta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-new-alert-type">
                              <SelectValue placeholder="Seleccione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low_stock">Stock Baixo</SelectItem>
                            <SelectItem value="reorder_point">Ponto de Recompra</SelectItem>
                            <SelectItem value="expiry">Expiração</SelectItem>
                            <SelectItem value="quality">Qualidade</SelectItem>
                            <SelectItem value="system">Sistema</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={alertForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="Seleccione a prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={alertForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Título do alerta..." 
                            {...field} 
                            data-testid="input-alert-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={alertForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição detalhada do alerta..." 
                            {...field} 
                            data-testid="textarea-alert-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={alertForm.control}
                      name="entityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Entidade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-entity-type">
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="product">Produto</SelectItem>
                              <SelectItem value="warehouse">Armazém</SelectItem>
                              <SelectItem value="order">Encomenda</SelectItem>
                              <SelectItem value="supplier">Fornecedor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={alertForm.control}
                      name="entityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID da Entidade</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="ID..." 
                              {...field} 
                              data-testid="input-entity-id"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAlertDialogOpen(false)}
                      data-testid="button-cancel-alert"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAlertMutation.isPending}
                      data-testid="button-submit-alert"
                    >
                      Criar Alerta
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Procurar alertas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-alerts"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]" data-testid="filter-priority">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="acknowledged">Reconhecido</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alertas Ativos</p>
              <p className="text-2xl font-bold text-foreground" data-testid="active-alerts-count">
                {activeAlertsCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reconhecidos</p>
              <p className="text-2xl font-bold text-foreground" data-testid="acknowledged-alerts-count">
                {acknowledgedAlertsCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
              <p className="text-2xl font-bold text-foreground" data-testid="resolved-alerts-count">
                {resolvedAlertsCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="p-6">
        {isLoadingAlerts ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert: Alert) => (
              <div 
                key={alert.id} 
                className="border border-border rounded-lg p-4 space-y-3"
                data-testid={`alert-item-${alert.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getPriorityIcon(alert.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground" data-testid={`alert-title-${alert.id}`}>
                          {alert.title}
                        </h3>
                        {getTypeBadge(alert.type)}
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      {alert.entityType && alert.entityName && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          {getEntityIcon(alert.entityType)}
                          <span>{alert.entityName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(alert.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <div>Criado: {new Date(alert.createdAt).toLocaleString('pt-PT')}</div>
                    {alert.acknowledgedAt && (
                      <div>Reconhecido: {new Date(alert.acknowledgedAt).toLocaleString('pt-PT')}</div>
                    )}
                    {alert.resolvedAt && (
                      <div>Resolvido: {new Date(alert.resolvedAt).toLocaleString('pt-PT')}</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {alert.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          disabled={acknowledgeAlertMutation.isPending}
                          data-testid={`acknowledge-alert-${alert.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Reconhecer
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={resolveAlertMutation.isPending}
                          data-testid={`resolve-alert-${alert.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolver
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button 
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                        disabled={resolveAlertMutation.isPending}
                        data-testid={`resolve-acknowledged-alert-${alert.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {searchQuery || filterPriority !== "all" || filterStatus !== "all" 
                    ? "Nenhum alerta encontrado" 
                    : "Nenhum alerta registado"
                  }
                </p>
                <p className="text-sm">
                  {searchQuery || filterPriority !== "all" || filterStatus !== "all"
                    ? "Tente ajustar os filtros de pesquisa" 
                    : "Os alertas aparecerão aqui quando forem criados"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}