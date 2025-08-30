import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Box, 
  Warehouse, 
  Package,
  Truck, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings, 
  User,
  LogOut,
  Building,
  Scan,
  MapPin,
  ClipboardList,
  PackageCheck,
  RotateCcw,
  Bell,
  TrendingUp,
  Shield,
  Package2,
  Send,
  Calculator,
  CheckSquare,
  Eye,
  Menu,
  X,
  Brain
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useModules } from "@/contexts/module-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

// Mapeamento de ícones para usar com os módulos
const iconMap: Record<string, any> = {
  BarChart3,
  Package,
  Truck,
  Building,
  Warehouse,
  Package2,
  ShoppingCart,
  Send,
  MapPin,
  Calculator,
  Scan,
  CheckSquare,
  Bell,
  Eye,
  Shield,
  FileText,
  TrendingUp,
  Users,
  Settings,
  Brain
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { enabledMenuItems, isLoading } = useModules();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  // Fechar sidebar mobile ao navegar
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  // Fechar sidebar mobile ao redimensionar para desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Administrador", variant: "default" as const },
      manager: { label: "Gestor", variant: "secondary" as const },
      operator: { label: "Operador", variant: "outline" as const },
    };
    return roleConfig[role as keyof typeof roleConfig] || { label: role, variant: "outline" as const };
  };

  return (
    <>
      {/* Menu hambúrguer mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Box className="text-primary-foreground text-sm" />
            </div>
            <h1 className="text-lg font-bold text-foreground">SGST</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      )}
      
      {/* Overlay mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`bg-card border-r border-border flex flex-col h-full z-40 ${
          isMobile 
            ? `fixed w-80 transform transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              } top-16` 
            : 'w-72 fixed'
        }`} 
        data-testid="sidebar"
      >
      {/* Header fixo - Logo e nome da empresa */}
      <div className="px-6 py-4 border-b border-border flex-shrink-0 h-20 flex items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Box className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="app-title">SGST</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestão de Stock</p>
          </div>
        </div>
      </div>

      {/* Navegação com scroll */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2" data-testid="navigation">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Carregando módulos...</div>
          </div>
        ) : (
          enabledMenuItems.map((item) => {
            const Icon = iconMap[item.icon] || Box;
            const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })
        )}
      </nav>

      {/* Footer fixo - Usuário e logout */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-primary-foreground text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground" data-testid="user-name">
              {user?.username || "Utilizador"}
            </p>
            <Badge variant={getRoleBadge(user?.role || "").variant} className="text-xs mt-1">
              {getRoleBadge(user?.role || "").label}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground p-2"
            data-testid="logout-button"
            title="Terminar Sessão"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
      </aside>
    </>
  );
}
