import { Search, Bell, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNotifications } from "@/hooks/use-notifications";
import { useIsMobile } from "@/hooks/use-mobile";
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
    <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4" data-testid="page-header">
      <div className="flex items-center justify-between">
        <div>
          {!isMobile && (
            <nav className="text-sm text-muted-foreground mb-2" data-testid="breadcrumbs">
              <span>SGST</span>
              {breadcrumbs.map((crumb, index) => (
                <span key={index}>
                  {" / "}
                  <span className={index === breadcrumbs.length - 1 ? "text-foreground" : ""}>
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          )}
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground" data-testid="page-title">{title}</h2>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {!isMobile && (
            <div className="relative">
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="pl-10 w-48 lg:w-64"
                data-testid="search-input"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          )}
          
          {isMobile && (
            <Button variant="ghost" size="icon" className="p-2">
              <Search className="w-4 h-4" />
            </Button>
          )}
          
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
