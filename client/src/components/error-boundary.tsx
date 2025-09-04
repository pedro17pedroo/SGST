import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de erro
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para monitorização
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Aqui poderíamos enviar o erro para um serviço de monitorização
    // como Sentry, LogRocket, etc.
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Algo correu mal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Ocorreu um erro inesperado na aplicação. Por favor, tente recarregar a página ou volte ao início.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                    <div className="text-destructive font-semibold mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <div className="whitespace-pre-wrap">
                      {this.state.error.stack}
                    </div>
                  </div>
                </details>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={this.handleReload} 
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para reportar erros manualmente
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Erro reportado manualmente:', error, errorInfo);
    
    // Aqui poderíamos enviar para um serviço de monitorização
    // Por agora, apenas fazemos log
  };
}

// Componente funcional para erros específicos de queries
export function QueryErrorFallback({ error, resetError }: { error: Error; resetError?: () => void }) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Erro ao carregar dados</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {error.message || 'Ocorreu um erro inesperado'}
            </p>
          </div>
          {resetError && (
            <Button onClick={resetError} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}