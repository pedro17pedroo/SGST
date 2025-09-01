import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, User, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GPSPermissionDialog } from "@/components/gps/gps-permission-dialog";

const loginSchema = z.object({
  username: z.string().min(3, "Nome de utilizador deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Deve aceitar os termos e condições para continuar",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLogin: (userData: { username: string; role: string }) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGPSDialog, setShowGPSDialog] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username: string; role: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies/sessions
        body: JSON.stringify({
          username: data.username,
          password: data.password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const userData = { 
          username: result.user.username, 
          role: result.user.role 
        };
        
        // Verificar se GPS é obrigatório
        if (result.requiresGPS) {
          setUserInfo(userData);
          setShowGPSDialog(true);
        } else {
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${result.user.username}!`,
          });
          onLogin(userData);
        }
      } else {
        toast({
          title: "Erro de login",
          description: result.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGPSSuccess = (gpsData: { latitude: number; longitude: number; accuracy: number; vehicleId?: string }) => {
    if (userInfo) {
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${userInfo.username}! GPS ativado com precisão de ${Math.round(gpsData.accuracy)}m`,
      });
      setShowGPSDialog(false);
      onLogin(userInfo);
    }
  };

  const handleGPSError = (error: string) => {
    toast({
      title: "Erro GPS",
      description: `GPS é obrigatório para ${userInfo?.role === 'driver' ? 'motoristas' : 'operadores'}. ${error}`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building className="text-primary-foreground text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SGST</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
          <CardTitle>Iniciar Sessão</CardTitle>
          <CardDescription>
            Entre com as suas credenciais para aceder ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de Utilizador</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Digite o seu nome de utilizador"
                          className="pl-10"
                          {...field}
                          data-testid="input-username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palavra-passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite a sua palavra-passe"
                          className="pl-10 pr-10"
                          {...field}
                          data-testid="input-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-accept-terms"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Aceito os{" "}
                        <a 
                          href="/terms" 
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          termos e condições
                        </a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <a 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
              data-testid="link-forgot-password"
            >
              Esqueceu a sua palavra-passe?
            </a>
          </div>
        </CardContent>
      </Card>

      {/* GPS Permission Dialog */}
      {showGPSDialog && userInfo && (
        <GPSPermissionDialog
          isOpen={showGPSDialog}
          onSuccess={handleGPSSuccess}
          onError={handleGPSError}
          userRole={userInfo.role}
          userName={userInfo.username}
        />
      )}
    </div>
  );
}