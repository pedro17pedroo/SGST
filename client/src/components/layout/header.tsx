import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNotifications } from "@/hooks/use-notifications";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HeaderProps {
  title: string;
  breadcrumbs?: string[];
}

export function Header({ title, breadcrumbs = [] }: HeaderProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const isMobile = useIsMobile();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning": return "⚠️";
      case "error": return "❌";
      case "success": return "✅";
      default: return "ℹ️";
    }
  };

  return (
    <header className={`sticky z-40 bg-card border-b border-border backdrop-blur-sm w-full h-20 ${
      isMobile ? 'top-16 px-4' : 'top-0 px-6'
    }`} data-testid="page-header">
      <div className="flex items-center justify-between h-full">
        <div className="flex flex-col justify-center min-w-0 flex-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className={`text-sm text-muted-foreground ${
              isMobile ? 'overflow-x-auto scrollbar-hide' : ''
            }`} data-testid="breadcrumbs">
              <div className="flex items-center space-x-2">
                <span className="whitespace-nowrap">SGST</span>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
                    <span className="text-muted-foreground/60">/</span>
                    <span className={`${
                      index === breadcrumbs.length - 1 
                        ? 'text-foreground font-medium' 
                        : isMobile ? 'text-muted-foreground/80' : ''
                    } ${isMobile && index < breadcrumbs.length - 1 ? 'max-w-20 truncate' : ''}`}>
                      {crumb}
                    </span>
                  </div>
                ))}
              </div>
            </nav>
          )}
          <h2 className="text-xl lg:text-2xl font-bold text-foreground truncate" data-testid="page-title">{title}</h2>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-testid="notifications-button">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notificações</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      data-testid="mark-all-read"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-4 hover:bg-accent cursor-pointer ${
                          !notification.read ? "bg-accent/50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <span className="text-lg mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(notification.timestamp, { 
                                  addSuffix: true,
                                  locale: ptBR 
                                })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}