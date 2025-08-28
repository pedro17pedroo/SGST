import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Settings as SettingsIcon, Database, Bell, Shield, User, Building } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div className="min-h-screen bg-background" data-testid="settings-page">
      <Header title="Configurações" breadcrumbs={["Configurações"]} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Gerir configurações globais do SGST</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="database">Base de Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configurações básicas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma do Sistema</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="pt">Português (Angola)</option>
                    <option value="en">English</option>
                    <option value="pt-br">Português (Brasil)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="Africa/Luanda">África/Luanda (WAT)</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/Lisbon">Europa/Lisboa</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Informações da Empresa</span>
                </CardTitle>
                <CardDescription>Dados da empresa para relatórios e documentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input id="company-name" defaultValue="Empresa SGST Lda" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-nif">NIF</Label>
                    <Input id="company-nif" placeholder="123456789" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-address">Endereço</Label>
                  <Input id="company-address" placeholder="Rua Principal, 123, Luanda" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input id="company-phone" placeholder="+244 900 000 000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input id="company-email" type="email" placeholder="info@empresa.ao" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notificações</span>
                </CardTitle>
                <CardDescription>Configurar alertas e notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações do Sistema</Label>
                    <p className="text-sm text-muted-foreground">Receber alertas importantes</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Alertas de Stock</h4>
                  <div className="space-y-2">
                    <Label htmlFor="low-stock-threshold">Limite Crítico de Stock</Label>
                    <Input id="low-stock-threshold" type="number" defaultValue="10" />
                    <p className="text-xs text-muted-foreground">Alertar quando stock estiver abaixo deste valor</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Alertas de Encomendas</h4>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Notificar encomendas pendentes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Notificar envios em atraso</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Segurança</span>
                </CardTitle>
                <CardDescription>Configurações de segurança e acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Sessões de Utilizador</h4>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                    <Input id="session-timeout" type="number" defaultValue="60" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Política de Palavras-passe</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Exigir caracteres especiais</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Exigir números</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Exigir maiúsculas e minúsculas</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-password-length">Comprimento mínimo</Label>
                    <Input id="min-password-length" type="number" defaultValue="8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Base de Dados</span>
                </CardTitle>
                <CardDescription>Configurações e manutenção da base de dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Criar backup diário automático</p>
                  </div>
                  <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Estado da Base de Dados</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge variant="default">Conectado</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Último Backup</p>
                      <p className="text-sm">28/01/2025 - 18:30</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Ações de Manutenção</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Criar Backup
                    </Button>
                    <Button variant="outline" size="sm">
                      Otimizar BD
                    </Button>
                    <Button variant="destructive" size="sm">
                      Limpar Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancelar</Button>
          <Button>Guardar Configurações</Button>
        </div>
      </div>
    </div>
  );
}
