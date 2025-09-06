import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast for new notifications
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications (in production, this would be WebSocket or SSE)
  // NOTA: Desabilitado temporariamente para evitar requisições desnecessárias
  useEffect(() => {
    // Intervalo aumentado para 5 minutos para reduzir carga
    const interval = setInterval(() => {
      const random = Math.random();
      
      if (random < 0.05) { // 5% chance every 5 minutes (reduzido de 10% a cada 30s)
        if (random < 0.015) {
          addNotification({
            type: "warning",
            title: "Stock Baixo",
            message: "Produto XYZ está com stock abaixo do limite mínimo",
          });
        } else if (random < 0.03) {
          addNotification({
            type: "success",
            title: "Nova Encomenda",
            message: "Encomenda #1234 foi recebida e está a ser processada",
          });
        } else {
          addNotification({
            type: "info",
            title: "Atualização do Sistema",
            message: "Novos relatórios estão disponíveis no dashboard",
          });
        }
      }
    }, 300000); // Check every 5 minutes (aumentado de 30 segundos)

    return () => clearInterval(interval);
  }, [addNotification]); // Adicionada dependência para evitar stale closures

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };
}