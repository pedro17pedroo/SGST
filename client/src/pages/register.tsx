import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';

// Schema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().min(1, 'Nome de utilizador é obrigatório'),
  password: z.string().min(6, 'A palavra-passe deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoginLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        username: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      const result = await response.json();
      
      // Armazenar token se "Lembrar-me" estiver marcado
      if (data.rememberMe && result.token) {
        localStorage.setItem('authToken', result.token);
      }
      
      // Atualizar o estado de autenticação com os dados do utilizador
      if (result.user) {
        login(result.user);
      }
      
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta à plataforma SGST.',
      });
      
      // O redirecionamento será feito automaticamente pelo contexto de autenticação
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleBackToPortal = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botão de voltar */}
        <Button
          variant="ghost"
          onClick={handleBackToPortal}
          className="mb-6 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Portal
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">SGST</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Entrar na Plataforma SGST
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Acesse sua conta para gerenciar o sistema de gestão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Utilizador</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="admin"
                          className="h-11"
                        />
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
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="h-11 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
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
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Aceito os termos e condições
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?{' '}
                <Button variant="link" className="p-0 h-auto font-medium text-blue-600 hover:text-blue-700">
                  Contacte o administrador
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}