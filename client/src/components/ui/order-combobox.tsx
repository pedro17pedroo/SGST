import * as React from "react"
import { Check, ChevronsUpDown, Plus, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { ordersService } from "@/services/api.service"

interface Order {
  id: string
  orderNumber: string
  type: string
  customerId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  supplierId?: string | null
  customer?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  supplier?: any
  user?: any
  totalAmount?: string | number // API retorna como string
  status?: string
  notes?: string
  userId?: string | null
  createdAt?: string
}

interface OrderComboboxProps {
  value: string
  onValueChange: (value: string) => void
  onOrderSelect?: (order: Order | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  orderType?: 'sale' | 'purchase' | 'all'
}

export const OrderCombobox = React.memo(function OrderCombobox({
  value,
  onValueChange,
  onOrderSelect,
  placeholder = "Selecionar encomenda...",
  disabled = false,
  className,
  orderType = 'sale',
}: OrderComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)

  // Buscar encomendas com base na query de pesquisa
  const searchQueryFn = React.useCallback(async () => {
    if (!searchQuery || searchQuery.length < 2) return []
    
    try {
      const response = await ordersService.searchOrders(searchQuery)
      
      if (response.success && response.data) {
        return response.data
      } else {
        return []
      }
    } catch (error) {
      console.error('Erro ao buscar encomendas:', error)
      return []
    }
  }, [searchQuery])

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders/search', searchQuery, orderType],
    queryFn: searchQueryFn,
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.name === 'AbortError') {
        return false
      }
      return failureCount < 2
    },
  })

  // Encontrar encomenda selecionada quando o valor muda
  React.useEffect(() => {
    if (value && orders.length > 0) {
      const order = orders.find((o: Order) => o.id === value)
      if (order && order.id !== selectedOrder?.id) {
        setSelectedOrder(order)
        onOrderSelect?.(order)
      }
    } else if (!value && selectedOrder) {
      setSelectedOrder(null)
      onOrderSelect?.(null)
    }
  }, [value, orders, selectedOrder, onOrderSelect])

  const handleSelect = React.useCallback((order: Order) => {
    setSelectedOrder(order)
    onValueChange(order.id)
    onOrderSelect?.(order)
    setOpen(false)
    setSearchQuery("")
  }, [onValueChange, onOrderSelect])

  const handleClear = React.useCallback(() => {
    setSelectedOrder(null)
    onValueChange("")
    onOrderSelect?.(null)
    setSearchQuery("")
  }, [onValueChange, onOrderSelect])

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(numericAmount)
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmada', variant: 'default' as const },
      processing: { label: 'Processando', variant: 'default' as const },
      shipped: { label: 'Enviada', variant: 'default' as const },
      delivered: { label: 'Entregue', variant: 'default' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return config ? (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    ) : null
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedOrder ? (
                <>
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium truncate">{selectedOrder.orderNumber}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {(selectedOrder.customerName || selectedOrder.customer?.name) && <span>{selectedOrder.customerName || selectedOrder.customer?.name}</span>}
                      {selectedOrder.totalAmount && (
                        <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                      )}
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Pesquisar por número da encomenda, cliente..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Pesquisando...
                </div>
              )}
              
              {!isLoading && searchQuery.length >= 2 && orders.length === 0 && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma encomenda encontrada para "{searchQuery}"
                    </p>
                  </div>
                </CommandEmpty>
              )}
              
              {!isLoading && searchQuery.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Digite pelo menos 2 caracteres para pesquisar
                </div>
              )}
              
              {orders.length > 0 && (
                <CommandGroup>
                  {orders.map((order: Order) => (
                    <CommandItem
                      key={order.id}
                      value={`${order.orderNumber} ${order.customer?.name || ''}`}
                      onSelect={() => handleSelect(order)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{order.orderNumber}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {(order.customerName || order.customer?.name) && (
                            <div>Cliente: {order.customerName || order.customer?.name}</div>
                          )}
                          {order.totalAmount && (
                            <div>Valor: {formatCurrency(order.totalAmount)}</div>
                          )}
                          {order.createdAt && (
                            <div>Data: {new Date(order.createdAt).toLocaleDateString('pt-AO')}</div>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === order.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
})