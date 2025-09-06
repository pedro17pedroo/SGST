import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, User, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GPSPermissionDialog } from "@/components/gps/gps-permission-dialog";
import { useLogin } from "@/hooks/api/use-auth";

const loginSchema = z.object({
  username: z.string().min(3, "Nome de utilizador deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Deve aceitar os termos e condições para continuar",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LoginFormProps {
  onLogin: (authData: AuthData) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  // Loading state removed as it's not being used
  const [showGPSDialog, setShowGPSDialog] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [tempAuthData, setTempAuthData] = useState<AuthData | null>(null);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      acceptTerms: false,
    },
  });

  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: data.username,
        password: data.password,
      });
      
      if (response.success && response.data) {
        const authData = response.data;
        setUserInfo(authData.user);
        setTempAuthData(authData);
        setShowGPSDialog(true);
      } else {
        throw new Error(response.message || "Erro ao fazer login");
      }
    } catch (error: any) {
      toast({
        title: "Erro de autenticação",
        description: error.message || "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGPSSuccess = (gpsData: { latitude: number; longitude: number; accuracy: number; vehicleId?: string }) => {
    if (tempAuthData) {
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${tempAuthData.user.username}! GPS ativado com precisão de ${Math.round(gpsData.accuracy)}m`,
      });
      setShowGPSDialog(false);
      onLogin(tempAuthData);
      setTempAuthData(null);
      setUserInfo(null);
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
                          {...field}
                          type="text"
                          placeholder="Digite o seu nome de utilizador"
                          className="pl-10"
                          disabled={loginMutation.isPending}
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
                          disabled={loginMutation.isPending}
                          data-testid="input-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loginMutation.isPending}
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
                        disabled={loginMutation.isPending}
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
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
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