import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Box, 
  Warehouse, 
  Truck, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings, 
  User,
  LogOut
} from "lucide-react";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/products", label: "Produtos", icon: Box },
  { path: "/inventory", label: "Inventário", icon: Warehouse },
  { path: "/shipping", label: "Expedição", icon: Truck },
  { path: "/orders", label: "Pedidos", icon: ShoppingCart },
  { path: "/reports", label: "Relatórios", icon: FileText },
  { path: "/users", label: "Utilizadores", icon: Users },
  { path: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="bg-card border-r border-border w-72 flex flex-col fixed h-full z-10" data-testid="sidebar">
      <div className="p-6 border-b border-border">
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

      <nav className="flex-1 px-4 py-6 space-y-2" data-testid="navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
          
          return (
            <Link key={item.path} href={item.path}>
              <a 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-primary-foreground text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground" data-testid="user-name">João Silva</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
