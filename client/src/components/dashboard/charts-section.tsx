import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ErrorBoundary } from "@/components/error-boundary";

const salesData = [
  { name: "Computadores", value: 30, color: "#3b82f6" },
  { name: "Smartphones", value: 25, color: "#10b981" },
  { name: "Acessórios", value: 20, color: "#f59e0b" },
  { name: "Tablets", value: 15, color: "#ef4444" },
  { name: "Outros", value: 10, color: "#8b5cf6" },
];

const stockMovementData = [
  { date: "01/01", entradas: 120, saidas: 80 },
  { date: "05/01", entradas: 150, saidas: 95 },
  { date: "10/01", entradas: 180, saidas: 110 },
  { date: "15/01", entradas: 140, saidas: 125 },
  { date: "20/01", entradas: 160, saidas: 105 },
  { date: "25/01", entradas: 190, saidas: 140 },
  { date: "30/01", entradas: 170, saidas: 130 },
];

export function ChartsSection() {
  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6" data-testid="charts-section">
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4" data-testid="sales-chart-title">
          Vendas por Categoria
        </h3>
        <div className="chart-container" data-testid="sales-chart">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={salesData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {salesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4" data-testid="stock-chart-title">
          Movimento de Stock (30 dias)
        </h3>
        <div className="chart-container" data-testid="stock-chart">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stockMovementData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickMargin={5}
              />
              <YAxis 
                fontSize={12}
                tickMargin={5}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="entradas" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Entradas"
              />
              <Line 
                type="monotone" 
                dataKey="saidas" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Saídas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </div>
    </ErrorBoundary>
  );
}
