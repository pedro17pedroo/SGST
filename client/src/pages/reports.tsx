import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, Package, DollarSign, Calendar, Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data for demonstration - in real app this would come from API
const salesData = [
  { month: "Jan", vendas: 45000, compras: 32000 },
  { month: "Fev", vendas: 52000, compras: 28000 },
  { month: "Mar", vendas: 48000, compras: 35000 },
  { month: "Abr", vendas: 61000, compras: 42000 },
  { month: "Mai", vendas: 55000, compras: 38000 },
  { month: "Jun", vendas: 67000, compras: 45000 },
];

const categoryData = [
  { name: "Eletrónicos", value: 35, color: "#8884d8" },
  { name: "Roupas", value: 25, color: "#82ca9d" },
  { name: "Casa", value: 20, color: "#ffc658" },
  { name: "Desporto", value: 15, color: "#ff7300" },
  { name: "Outros", value: 5, color: "#00ff88" },
];

const topProducts = [
  { name: "Smartphone XYZ", sales: 245, revenue: "122.500 AOA" },
  { name: "Laptop ABC", sales: 189, revenue: "378.000 AOA" },
  { name: "Headphones DEF", sales: 156, revenue: "78.000 AOA" },
  { name: "Tablet GHI", sales: 134, revenue: "67.000 AOA" },
  { name: "Camera JKL", sales: 98, revenue: "196.000 AOA" },
];

const stockMovements = [
  { date: "2024-01-15", product: "Smartphone XYZ", type: "entrada", quantity: 50, warehouse: "Armazém A" },
  { date: "2024-01-14", product: "Laptop ABC", type: "saída", quantity: 12, warehouse: "Armazém B" },
  { date: "2024-01-13", product: "Headphones DEF", type: "entrada", quantity: 100, warehouse: "Armazém A" },
  { date: "2024-01-12", product: "Tablet GHI", type: "saída", quantity: 8, warehouse: "Armazém C" },
  { date: "2024-01-11", product: "Camera JKL", type: "transferência", quantity: 5, warehouse: "Armazém A → B" },
];

function ReportCard({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("all");

  // In real app, these would use actual API endpoints
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-reports">
            Relatórios e Análises
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada de desempenho e tendências
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button data-testid="button-export">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total de Vendas"
          value="348.000 AOA"
          change="+12.5% vs mês anterior"
          icon={DollarSign}
          color="green"
        />
        <ReportCard
          title="Produtos Vendidos"
          value="1.234"
          change="+8.2% vs mês anterior"
          icon={Package}
          color="blue"
        />
        <ReportCard
          title="Encomendas Processadas"
          value="156"
          change="+15.3% vs mês anterior"
          icon={FileText}
          color="purple"
        />
        <ReportCard
          title="Taxa de Crescimento"
          value="12.5%"
          change="Tendência positiva"
          icon={TrendingUp}
          color="green"
        />
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales" data-testid="tab-sales">Vendas</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventário</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Produtos</TabsTrigger>
          <TabsTrigger value="movements" data-testid="tab-movements">Movimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Vendas vs Compras</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} AOA`} />
                    <Legend />
                    <Line type="monotone" dataKey="vendas" stroke="#8884d8" name="Vendas" />
                    <Line type="monotone" dataKey="compras" stroke="#82ca9d" name="Compras" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Níveis de Stock por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vendas" fill="#8884d8" name="Stock Entrada" />
                  <Bar dataKey="compras" fill="#82ca9d" name="Stock Saída" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`product-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimentos de Stock Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockMovements.map((movement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`movement-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <p className="font-medium">{movement.product}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          movement.type === "entrada" ? "default" :
                          movement.type === "saída" ? "destructive" : "secondary"
                        }
                      >
                        {movement.type}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">{movement.quantity} unidades</p>
                        <p className="text-sm text-muted-foreground">{movement.warehouse}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}