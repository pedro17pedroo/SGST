import { useOffline } from '@/hooks/use-offline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, Sync, AlertTriangle, CheckCircle } from 'lucide-react';

export function OfflineStatus() {
  const { 
    isOnline, 
    lastSync, 
    syncInProgress, 
    pendingCount, 
    conflicts, 
    triggerSync 
  } = useOffline();

  const formatLastSync = (timestamp: number) => {
    if (!timestamp) return 'Nunca';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <Card className="w-full max-w-md" data-testid="card-offline-status">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sistema Offline</CardTitle>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" data-testid="icon-online" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" data-testid="icon-offline" />
            )}
            <Badge 
              variant={isOnline ? 'default' : 'destructive'}
              data-testid="badge-connection-status"
            >
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Sistema offline-first com sincronização automática
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium" data-testid="text-pending-count">
              Operações Pendentes
            </p>
            <p className="text-2xl font-bold text-orange-600" data-testid="text-pending-number">
              {pendingCount}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium" data-testid="text-conflicts-count">
              Conflitos
            </p>
            <p className="text-2xl font-bold text-red-600" data-testid="text-conflicts-number">
              {conflicts.length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Última sincronização:</span>
            <span className="text-sm font-medium" data-testid="text-last-sync">
              {formatLastSync(lastSync)}
            </span>
          </div>
          
          {syncInProgress && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Sync className="h-4 w-4 animate-spin" />
              <span data-testid="text-sync-progress">Sincronizando...</span>
            </div>
          )}
        </div>

        {conflicts.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium" data-testid="text-conflicts-warning">
                {conflicts.length} conflito(s) precisam de resolução manual
              </span>
            </div>
          </div>
        )}

        {pendingCount === 0 && conflicts.length === 0 && isOnline && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm" data-testid="text-all-synced">
              Todos os dados sincronizados
            </span>
          </div>
        )}

        <Button 
          onClick={triggerSync}
          disabled={syncInProgress || !isOnline}
          className="w-full"
          variant={pendingCount > 0 ? "default" : "outline"}
          data-testid="button-sync"
        >
          {syncInProgress ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>
      </CardContent>
    </Card>
  );
}