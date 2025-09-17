import * as React from "react"
import { Check, ChevronsUpDown, Warehouse, MapPin } from "lucide-react"
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

// Interface para Armazém
interface WarehouseData {
  id: string
  name: string
  address?: string
  description?: string
  isActive: boolean
  type?: string
  location?: string
  capacity?: number
}

interface WarehouseComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  onWarehouseSelect?: (warehouse: WarehouseData | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showInactiveWarehouses?: boolean
}

export const WarehouseCombobox = React.forwardRef<
  HTMLButtonElement,
  WarehouseComboboxProps
>(({ 
  value, 
  onValueChange, 
  onWarehouseSelect,
  placeholder = "Selecione um armazém...", 
  disabled = false,
  className,
  showInactiveWarehouses = false
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<WarehouseData | null>(null)

  // Buscar armazéns da API
  const { data: warehousesResponse = [], isLoading, error } = useQuery<any>({
    queryKey: ['/api/warehouses'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Processar dados dos armazéns
  const warehouses = React.useMemo(() => {
    if (!warehousesResponse) return []
    
    // A API pode retornar { success: true, data: [...] } ou diretamente um array
    if (warehousesResponse && typeof warehousesResponse === 'object' && 'data' in warehousesResponse && Array.isArray(warehousesResponse.data)) {
      return warehousesResponse.data as WarehouseData[]
    } else if (Array.isArray(warehousesResponse)) {
      return warehousesResponse as WarehouseData[]
    } else {
      return []
    }
  }, [warehousesResponse])

  // Filtrar armazéns ativos/inativos
  const filteredWarehouses = React.useMemo(() => {
    // Garantir que warehouses seja sempre um array
    const warehouseList = Array.isArray(warehouses) ? warehouses : []
    let filtered = warehouseList
    
    // Filtrar por status ativo se necessário
    if (!showInactiveWarehouses) {
      filtered = filtered.filter((warehouse: WarehouseData) => warehouse.isActive)
    }
    
    // Filtrar por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((warehouse: WarehouseData) => {
        return (
          warehouse.name.toLowerCase().includes(query) ||
          warehouse.address?.toLowerCase().includes(query) ||
          warehouse.description?.toLowerCase().includes(query) ||
          warehouse.location?.toLowerCase().includes(query)
        )
      })
    }
    
    return filtered
  }, [warehouses, searchQuery, showInactiveWarehouses])

  // Encontrar armazém selecionado
  React.useEffect(() => {
    if (value && warehouses.length > 0) {
      const warehouse = warehouses.find((w: WarehouseData) => w.id === value)
      setSelectedWarehouse(warehouse || null)
    } else {
      setSelectedWarehouse(null)
    }
  }, [value, warehouses])

  const handleSelect = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse)
    onValueChange(warehouse.id)
    onWarehouseSelect?.(warehouse)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    setSelectedWarehouse(null)
    onValueChange("")
    onWarehouseSelect?.(null)
    setSearchQuery("")
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedWarehouse ? (
                <>
                  <Warehouse className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium truncate">{selectedWarehouse.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {selectedWarehouse.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{selectedWarehouse.address}</span>
                        </div>
                      )}
                      {!selectedWarehouse.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inativo
                        </Badge>
                      )}
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
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Pesquisar por nome, endereço ou localização..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Carregando armazéns...
                </div>
              )}
              
              {!isLoading && filteredWarehouses.length === 0 && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? `Nenhum armazém encontrado para "${searchQuery}"` : "Nenhum armazém disponível"}
                    </p>
                  </div>
                </CommandEmpty>
              )}
              
              {filteredWarehouses.length > 0 && (
                <CommandGroup>
                  {filteredWarehouses.map((warehouse: WarehouseData) => (
                    <CommandItem
                      key={warehouse.id}
                      value={`${warehouse.name} ${warehouse.address || ''} ${warehouse.description || ''} ${warehouse.location || ''}`}
                      onSelect={() => handleSelect(warehouse)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{warehouse.name}</span>
                          {!warehouse.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                          {warehouse.type && (
                            <Badge variant="outline" className="text-xs">
                              {warehouse.type}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {warehouse.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{warehouse.address}</span>
                            </div>
                          )}
                          {warehouse.description && (
                            <div className="truncate">{warehouse.description}</div>
                          )}
                          {warehouse.capacity && (
                            <div>Capacidade: {warehouse.capacity.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === warehouse.id ? "opacity-100" : "opacity-0"
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
      
      {/* Botão para limpar seleção */}
      {selectedWarehouse && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="mt-2 h-8 px-2 text-xs"
        >
          Limpar seleção
        </Button>
      )}
    </div>
  )
})

WarehouseCombobox.displayName = "WarehouseCombobox"