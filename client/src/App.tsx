import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ModuleProvider } from "@/contexts/module-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ModuleGuard } from "@/components/layout/module-guard";
import { useIsMobile } from "@/hooks/use-mobile";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Inventory from "@/pages/inventory";
import Warehouses from "@/pages/warehouses";
import Suppliers from "@/pages/suppliers";
import Orders from "@/pages/orders";
import Shipping from "@/pages/shipping";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import Scanner from "@/pages/scanner";
import ProductLocations from "@/pages/product-locations";
import InventoryCounts from "@/pages/inventory-counts";
import PickingPacking from "@/pages/picking-packing";
import BatchManagement from "@/pages/batch-management";
import Returns from "@/pages/returns";
import Alerts from "@/pages/alerts";
import AdvancedAnalytics from "@/pages/advanced-analytics";
import QualityControl from "@/pages/quality-control";
import PublicTracking from "@/pages/public-tracking";
import WarehouseAutomation from "@/pages/WarehouseAutomation";
import NotFound from "@/pages/not-found";

function Router() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={`flex-1 overflow-auto ${
        isMobile ? 'pt-16' : 'ml-72'
      }`}>
        <div className="container-responsive py-4">
          <Switch>
            <Route path="/" component={Dashboard} />
          <Route path="/dashboard">
            <ModuleGuard moduleId="dashboard" fallback={<NotFound />}>
              <Dashboard />
            </ModuleGuard>
          </Route>
          <Route path="/products">
            <ModuleGuard moduleId="products" fallback={<NotFound />}>
              <Products />
            </ModuleGuard>
          </Route>
          <Route path="/inventory">
            <ModuleGuard moduleId="inventory" fallback={<NotFound />}>
              <Inventory />
            </ModuleGuard>
          </Route>
          <Route path="/warehouses">
            <ModuleGuard moduleId="warehouses" fallback={<NotFound />}>
              <Warehouses />
            </ModuleGuard>
          </Route>
          <Route path="/suppliers">
            <ModuleGuard moduleId="suppliers" fallback={<NotFound />}>
              <Suppliers />
            </ModuleGuard>
          </Route>
          <Route path="/orders">
            <ModuleGuard moduleId="orders" fallback={<NotFound />}>
              <Orders />
            </ModuleGuard>
          </Route>
          <Route path="/shipping">
            <ModuleGuard moduleId="shipping" fallback={<NotFound />}>
              <Shipping />
            </ModuleGuard>
          </Route>
          <Route path="/scanner">
            <ModuleGuard moduleId="barcode_scanning" fallback={<NotFound />}>
              <Scanner />
            </ModuleGuard>
          </Route>
          <Route path="/product-locations">
            <ModuleGuard moduleId="product_locations" fallback={<NotFound />}>
              <ProductLocations />
            </ModuleGuard>
          </Route>
          <Route path="/inventory-counts">
            <ModuleGuard moduleId="inventory_counts" fallback={<NotFound />}>
              <InventoryCounts />
            </ModuleGuard>
          </Route>
          <Route path="/picking-packing">
            <ModuleGuard moduleId="picking_packing" fallback={<NotFound />}>
              <PickingPacking />
            </ModuleGuard>
          </Route>
          <Route path="/batch-management">
            <ModuleGuard moduleId="batch_management" fallback={<NotFound />}>
              <BatchManagement />
            </ModuleGuard>
          </Route>
          <Route path="/returns">
            <ModuleGuard moduleId="returns" fallback={<NotFound />}>
              <Returns />
            </ModuleGuard>
          </Route>
          <Route path="/alerts">
            <ModuleGuard moduleId="alerts" fallback={<NotFound />}>
              <Alerts />
            </ModuleGuard>
          </Route>
          <Route path="/advanced-analytics">
            <ModuleGuard moduleId="advanced_analytics" fallback={<NotFound />}>
              <AdvancedAnalytics />
            </ModuleGuard>
          </Route>
          <Route path="/quality-control">
            <ModuleGuard moduleId="quality_control" fallback={<NotFound />}>
              <QualityControl />
            </ModuleGuard>
          </Route>
          <Route path="/reports">
            <ModuleGuard moduleId="reports" fallback={<NotFound />}>
              <Reports />
            </ModuleGuard>
          </Route>
          <Route path="/users">
            <ModuleGuard moduleId="users" fallback={<NotFound />}>
              <Users />
            </ModuleGuard>
          </Route>
          <Route path="/settings">
            <ModuleGuard moduleId="settings" fallback={<NotFound />}>
              <Settings />
            </ModuleGuard>
          </Route>
          <Route path="/warehouse-automation">
            <WarehouseAutomation />
          </Route>
          <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <ModuleProvider>
              <Switch>
                {/* Public route - no authentication required */}
                <Route path="/track">
                  <ModuleGuard moduleId="public_tracking" fallback={<NotFound />}>
                    <PublicTracking />
                  </ModuleGuard>
                </Route>
                <Route path="/tracking">
                  <ModuleGuard moduleId="public_tracking" fallback={<NotFound />}>
                    <PublicTracking />
                  </ModuleGuard>
                </Route>
                
                {/* Protected routes - authentication required */}
                <Route>
                  <ProtectedRoute>
                    <Router />
                  </ProtectedRoute>
                </Route>
              </Switch>
              <Toaster />
            </ModuleProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
