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
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      
      if (random < 0.1) { // 10% chance every 30 seconds
        if (random < 0.03) {
          addNotification({
            type: "warning",
            title: "Stock Baixo",
            message: "Produto XYZ está com stock abaixo do limite mínimo",
          });
        } else if (random < 0.06) {
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
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

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