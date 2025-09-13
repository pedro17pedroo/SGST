import * as React from "react"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"
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

interface Carrier {
  id: string
  name: string
  code: string
  type: string // internal, external
  email?: string
  phone?: string
  isActive: boolean
}

interface CarrierComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  onCarrierSelect?: (carrier: Carrier | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showInternalOnly?: boolean
}

export const CarrierCombobox = React.memo(function CarrierCombobox({
  value,
  onValueChange,
  onCarrierSelect,
  placeholder = "Selecionar transportadora...",
  disabled = false,
  className,
  showInternalOnly = false,
}: CarrierComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCarrier, setSelectedCarrier] = React.useState<Carrier | null>(null)

  // Buscar transportadoras ativas
  const carriersQueryFn = React.useCallback(async () => {
    const endpoint = showInternalOnly 
      ? '/api/carriers/internal' 
      : '/api/carriers/active'
    
    const response = await apiRequest('GET', endpoint)
    if (!response.ok) throw new Error('Erro ao buscar transportadoras')
    const data = await response.json()
    return data
  }, [showInternalOnly])

  const { data: carriers = [], isLoading } = useQuery({
    queryKey: ['/api/carriers', showInternalOnly ? 'internal' : 'active'],
    queryFn: carriersQueryFn,
    staleTime: 60000, // Cache por 1 minuto
  })

  // Buscar transportadora específica quando value muda
  const currentCarrierQueryFn = React.useCallback(async () => {
    if (!value) return null
    
    const response = await apiRequest('GET', `/api/carriers/${value}`)
    if (!response.ok) throw new Error('Erro ao buscar transportadora')
    return response.json()
  }, [value])

  const { data: currentCarrier } = useQuery({
    queryKey: ['/api/carriers', value],
    queryFn: currentCarrierQueryFn,
    enabled: !!value && !selectedCarrier,
  })

  // Atualizar transportadora selecionada quando currentCarrier muda
  React.useEffect(() => {
    if (currentCarrier && currentCarrier.id === value) {
      setSelectedCarrier(currentCarrier)
      onCarrierSelect?.(currentCarrier)
    }
  }, [currentCarrier, value, onCarrierSelect])

  const handleSelect = (carrier: Carrier) => {
    setSelectedCarrier(carrier)
    onValueChange(carrier.id)
    onCarrierSelect?.(carrier)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    setSelectedCarrier(null)
    onValueChange("")
    onCarrierSelect?.(null)
    setSearchQuery("")
  }

  // Filtrar transportadoras com base na pesquisa
  const filteredCarriers = carriers.filter((carrier: Carrier) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      carrier.name.toLowerCase().includes(query) ||
      carrier.code.toLowerCase().includes(query) ||
      carrier.type.toLowerCase().includes(query)
    )
  })

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
              {selectedCarrier ? (
                <>
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium truncate">{selectedCarrier.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Código: {selectedCarrier.code}</span>
                      <Badge 
                        variant={selectedCarrier.type === 'internal' ? 'default' : 'outline'} 
                        className="text-xs"
                      >
                        {selectedCarrier.type === 'internal' ? 'Interna' : 'Externa'}
                      </Badge>
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
              placeholder="Pesquisar por nome ou código..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Carregando transportadoras...
                </div>
              )}
              
              {!isLoading && filteredCarriers.length === 0 && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? `Nenhuma transportadora encontrada para "${searchQuery}"` : "Nenhuma transportadora disponível"}
                    </p>
                  </div>
                </CommandEmpty>
              )}
              
              {filteredCarriers.length > 0 && (
                <CommandGroup>
                  {filteredCarriers.map((carrier: Carrier) => (
                    <CommandItem
                      key={carrier.id}
                      value={`${carrier.name} ${carrier.code} ${carrier.type}`}
                      onSelect={() => handleSelect(carrier)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{carrier.name}</span>
                          <Badge 
                            variant={carrier.type === 'internal' ? 'default' : 'outline'} 
                            className="text-xs"
                          >
                            {carrier.type === 'internal' ? 'Interna' : 'Externa'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Código: {carrier.code}</div>
                          {(carrier.email || carrier.phone) && (
                            <div className="flex items-center gap-2">
                              {carrier.email && <span>Email: {carrier.email}</span>}
                              {carrier.phone && <span>• Tel: {carrier.phone}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === carrier.id ? "opacity-100" : "opacity-0"
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
      {selectedCarrier && (
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