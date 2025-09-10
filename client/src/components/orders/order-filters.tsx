"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-picker"
import { CustomerCombobox } from "@/components/ui/customer-combobox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Filter,
  X,
  Search,
  Calendar,
  User,
  Package,
  DollarSign,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface OrderFilters {
  search?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  customerId?: string
  orderType?: string
  minValue?: number
  maxValue?: number
}

interface OrderFiltersProps {
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
  className?: string
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "processing", label: "Processando" },
  { value: "shipped", label: "Enviada" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelada" }
]

const ORDER_TYPES = [
  { value: "sale", label: "Venda" },
  { value: "purchase", label: "Compra" },
  { value: "return", label: "Devolução" },
  { value: "exchange", label: "Troca" }
]

export function OrderFilters({ filters, onFiltersChange, className }: OrderFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<OrderFilters>(filters)

  // Conta quantos filtros estão ativos
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.status) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.customerId) count++
    if (filters.orderType) count++
    if (filters.minValue || filters.maxValue) count++
    return count
  }, [filters])

  const updateLocalFilter = (key: keyof OrderFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearAllFilters = () => {
    const emptyFilters: OrderFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    setIsOpen(false)
  }

  const clearFilter = (key: keyof OrderFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barra de pesquisa principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar por número da encomenda, cliente..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        {/* Botão de filtros avançados */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  Filtros Avançados
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={localFilters.status || ""}
                    onValueChange={(value) => updateLocalFilter('status', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Intervalo de datas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período
                  </Label>
                  <DateRangePicker
                    dateFrom={localFilters.dateFrom}
                    dateTo={localFilters.dateTo}
                    onDateFromChange={(date) => updateLocalFilter('dateFrom', date)}
                    onDateToChange={(date) => updateLocalFilter('dateTo', date)}
                    placeholderFrom="Data inicial"
                    placeholderTo="Data final"
                  />
                </div>

                {/* Cliente */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </Label>
                  <CustomerCombobox
                    value={localFilters.customerId || ""}
                    onValueChange={(value) => updateLocalFilter('customerId', value || undefined)}
                    placeholder="Selecionar cliente"
                  />
                </div>

                {/* Tipo de encomenda */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Tipo de Encomenda
                  </Label>
                  <Select
                    value={localFilters.orderType || ""}
                    onValueChange={(value) => updateLocalFilter('orderType', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {ORDER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Faixa de valores */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor (Kz)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={localFilters.minValue || ""}
                      onChange={(e) => updateLocalFilter('minValue', e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={localFilters.maxValue || ""}
                      onChange={(e) => updateLocalFilter('maxValue', e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                  <Button
                    onClick={applyFilters}
                    size="sm"
                    className="flex-1"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Indicadores de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {ORDER_STATUSES.find(s => s.value === filters.status)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearFilter('status')}
              />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Período
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  clearFilter('dateFrom')
                  clearFilter('dateTo')
                }}
              />
            </Badge>
          )}
          {filters.customerId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Cliente
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearFilter('customerId')}
              />
            </Badge>
          )}
          {filters.orderType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {ORDER_TYPES.find(t => t.value === filters.orderType)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearFilter('orderType')}
              />
            </Badge>
          )}
          {(filters.minValue || filters.maxValue) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Valor: {filters.minValue || 0} - {filters.maxValue || '∞'} Kz
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  clearFilter('minValue')
                  clearFilter('maxValue')
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}