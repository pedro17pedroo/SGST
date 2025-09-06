import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsService } from "../../services/api.service";
import { useToast } from "@/hooks/use-toast";
// import type { QueryParams, ApiResponse } from "../../services/api.service"; // Removed unused import

// Interfaces
export interface Alert {
  id: string;
  type: "low_stock" | "reorder_point" | "expiry" | "quality" | "system";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  entityType?: "product" | "warehouse" | "order" | "supplier";
  entityId?: string;
  entityName?: string;
  user?: {
    id: string;
    username: string;
  };
  acknowledgedBy?: {
    id: string;
    username: string;
  };
  resolvedBy?: {
    id: string;
    username: string;
  };
  metadata?: any;
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  alertType: string;
  channel: "email" | "sms" | "push" | "in_app";
  enabled: boolean;
  threshold?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AlertFormData {
  type: "low_stock" | "reorder_point" | "expiry" | "quality" | "system";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  entityType?: "product" | "warehouse" | "order" | "supplier";
  entityId?: string;
  userId?: string;
  scheduledFor?: string;
  expiresAt?: string;
}

export interface NotificationPreferenceFormData {
  alertType: string;
  channel: "email" | "sms" | "push" | "in_app";
  enabled: boolean;
  threshold?: any;
}

// Query Keys
export const ALERTS_QUERY_KEYS = {
  all: ['alerts'] as const,
  lists: () => [...ALERTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...ALERTS_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ALERTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ALERTS_QUERY_KEYS.details(), id] as const,
  preferences: () => [...ALERTS_QUERY_KEYS.all, 'preferences'] as const,
};

// Hooks
export function useAlerts(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ALERTS_QUERY_KEYS.list(filters || {}),
    queryFn: () => alertsService.getAlerts(filters),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: ALERTS_QUERY_KEYS.detail(id),
    queryFn: () => alertsService.getAlert(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: alertsService.createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.lists() });
      toast({
        title: "Alerta criado",
        description: "O alerta foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar alerta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertFormData> }) =>
      alertsService.updateAlert(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.detail(id) });
      toast({
        title: "Alerta atualizado",
        description: "O alerta foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar alerta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: alertsService.acknowledgeAlert,
    onSuccess: (_, alertId: string) => {
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.detail(alertId) });
      toast({
        title: "Alerta reconhecido",
        description: "O alerta foi marcado como reconhecido.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reconhecer alerta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: alertsService.resolveAlert,
    onSuccess: (_, alertId: string) => {
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.detail(alertId) });
      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao resolver alerta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: alertsService.dismissAlert,
    onSuccess: (_, alertId: string) => {
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.detail(alertId) });
      toast({
        title: "Alerta dispensado",
        description: "O alerta foi dispensado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao dispensar alerta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: alertsService.deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.lists() });
      toast({
        title: "Alerta eliminado",
        description: "O alerta foi eliminado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao eliminar alerta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

// Notification Preferences Hooks
export function useNotificationPreferences(userId?: string) {
  return useQuery({
    queryKey: [...ALERTS_QUERY_KEYS.preferences(), userId],
    queryFn: () => alertsService.getNotificationPreferences(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, preferences }: { userId: string; preferences: NotificationPreferenceFormData[] }) =>
      alertsService.updateNotificationPreferences(userId, preferences),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [...ALERTS_QUERY_KEYS.preferences(), userId] });
      toast({
        title: "Preferências atualizadas",
        description: "As suas preferências de notificação foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar preferências",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}