import * as React from "react"
import { Check, ChevronsUpDown, Building2, Truck } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
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

interface Vehicle {
  id: string
  licensePlate: string
  make: string
  model: string
  year: number
  type: string
  capacity?: string
  fuelType: string
  carrierId: string
  status: string
}

interface CarrierVehicleComboboxProps {
  carrierValue?: string
  vehicleValue?: string
  onCarrierChange: (carrierId: string) => void
  onVehicleChange: (vehicleId: string) => void
  onCarrierSelect?: (carrier: Carrier | null) => void
  onVehicleSelect?: (vehicle: Vehicle | null) => void
  disabled?: boolean
  className?: string
  showInternalOnly?: boolean
}

export const CarrierVehicleCombobox = React.memo(function CarrierVehicleCombobox({
  carrierValue,
  vehicleValue,
  onCarrierChange,
  onVehicleChange,
  onCarrierSelect,
  onVehicleSelect,
  disabled = false,
  className,
  showInternalOnly = false,
}: CarrierVehicleComboboxProps) {
  const [carrierOpen, setCarrierOpen] = React.useState(false)
  const [vehicleOpen, setVehicleOpen] = React.useState(false)
  const [carrierSearchQuery, setCarrierSearchQuery] = React.useState("")
  const [vehicleSearchQuery, setVehicleSearchQuery] = React.useState("")
  const [selectedCarrier, setSelectedCarrier] = React.useState<Carrier | null>(null)
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null)

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

  const { data: carriers = [], isLoading: isLoadingCarriers } = useQuery({
    queryKey: ['/api/carriers', showInternalOnly ? 'internal' : 'active'],
    queryFn: carriersQueryFn,
    staleTime: 60000, // Cache por 1 minuto
  })

  // Buscar veículos da transportadora selecionada
  const vehiclesQueryFn = React.useCallback(async () => {
    if (!carrierValue) return []
    
    const response = await apiRequest('GET', `/api/fleet/vehicles?carrierId=${carrierValue}&status=available`)
    if (!response.ok) throw new Error('Erro ao buscar veículos')
    const data = await response.json()
    return data
  }, [carrierValue])

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['/api/fleet/vehicles', 'by-carrier', carrierValue],
    queryFn: vehiclesQueryFn,
    enabled: !!carrierValue,
    staleTime: 30000, // Cache por 30 segundos
  })

  // Buscar transportadora específica quando carrierValue muda
  const currentCarrierQueryFn = React.useCallback(async () => {
    if (!carrierValue) return null
    
    const response = await apiRequest('GET', `/api/carriers/${carrierValue}`)
    if (!response.ok) throw new Error('Erro ao buscar transportadora')
    return response.json()
  }, [carrierValue])

  const { data: currentCarrier } = useQuery({
    queryKey: ['/api/carriers', carrierValue],
    queryFn: currentCarrierQueryFn,
    enabled: !!carrierValue && !selectedCarrier,
  })

  // Buscar veículo específico quando vehicleValue muda
  const currentVehicleQueryFn = React.useCallback(async () => {
    if (!vehicleValue) return null
    
    const response = await apiRequest('GET', `/api/fleet/vehicles/${vehicleValue}`)
    if (!response.ok) throw new Error('Erro ao buscar veículo')
    return response.json()
  }, [vehicleValue])

  const { data: currentVehicle } = useQuery({
    queryKey: ['/api/fleet/vehicles', vehicleValue],
    queryFn: currentVehicleQueryFn,
    enabled: !!vehicleValue && !selectedVehicle,
  })

  // Atualizar transportadora selecionada quando currentCarrier muda
  React.useEffect(() => {
    if (currentCarrier && currentCarrier.id === carrierValue) {
      setSelectedCarrier(currentCarrier)
      onCarrierSelect?.(currentCarrier)
    }
  }, [currentCarrier, carrierValue, onCarrierSelect])

  // Atualizar veículo selecionado quando currentVehicle muda
  React.useEffect(() => {
    if (currentVehicle && currentVehicle.id === vehicleValue) {
      setSelectedVehicle(currentVehicle)
      onVehicleSelect?.(currentVehicle)
    }
  }, [currentVehicle, vehicleValue, onVehicleSelect])

  // Limpar veículo quando transportadora muda
  React.useEffect(() => {
    if (carrierValue !== selectedCarrier?.id) {
      setSelectedVehicle(null)
      onVehicleChange("")
      onVehicleSelect?.(null)
    }
  }, [carrierValue, selectedCarrier?.id, onVehicleChange, onVehicleSelect])

  const handleCarrierSelect = (carrier: Carrier) => {
    setSelectedCarrier(carrier)
    onCarrierChange(carrier.id)
    onCarrierSelect?.(carrier)
    setCarrierOpen(false)
    setCarrierSearchQuery("")
    
    // Limpar seleção de veículo ao mudar transportadora
    setSelectedVehicle(null)
    onVehicleChange("")
    onVehicleSelect?.(null)
  }

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    onVehicleChange(vehicle.id)
    onVehicleSelect?.(vehicle)
    setVehicleOpen(false)
    setVehicleSearchQuery("")
  }

  const handleCarrierClear = () => {
    setSelectedCarrier(null)
    onCarrierChange("")
    onCarrierSelect?.(null)
    setCarrierSearchQuery("")
    
    // Limpar também o veículo
    setSelectedVehicle(null)
    onVehicleChange("")
    onVehicleSelect?.(null)
  }

  const handleVehicleClear = () => {
    setSelectedVehicle(null)
    onVehicleChange("")
    onVehicleSelect?.(null)
    setVehicleSearchQuery("")
  }

  // Filtrar transportadoras com base na pesquisa
  const filteredCarriers = carriers.filter((carrier: Carrier) => {
    if (!carrierSearchQuery) return true
    const query = carrierSearchQuery.toLowerCase()
    return (
      carrier.name.toLowerCase().includes(query) ||
      carrier.code.toLowerCase().includes(query) ||
      carrier.type.toLowerCase().includes(query)
    )
  })

  // Filtrar veículos com base na pesquisa
  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    if (!vehicleSearchQuery) return true
    const query = vehicleSearchQuery.toLowerCase()
    return (
      vehicle.licensePlate.toLowerCase().includes(query) ||
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query)
    )
  })

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Seleção de Transportadora */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Transportadora *</label>
        <Popover open={carrierOpen} onOpenChange={setCarrierOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={carrierOpen}
              className="w-full justify-between h-11"
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
                  <span className="text-muted-foreground">Selecionar transportadora...</span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Pesquisar por nome ou código..." 
                value={carrierSearchQuery}
                onValueChange={setCarrierSearchQuery}
              />
              <CommandList>
                {isLoadingCarriers && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Carregando transportadoras...
                  </div>
                )}
                
                {!isLoadingCarriers && filteredCarriers.length === 0 && (
                  <CommandEmpty>
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {carrierSearchQuery ? `Nenhuma transportadora encontrada para "${carrierSearchQuery}"` : "Nenhuma transportadora disponível"}
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
                        onSelect={() => handleCarrierSelect(carrier)}
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
                            carrierValue === carrier.id ? "opacity-100" : "opacity-0"
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
        
        {/* Botão para limpar seleção de transportadora */}
        {selectedCarrier && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCarrierClear}
            className="h-8 px-2 text-xs"
          >
            Limpar transportadora
          </Button>
        )}
      </div>

      {/* Seleção de Veículo */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Veículo *</label>
        <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={vehicleOpen}
              className="w-full justify-between h-11"
              disabled={disabled || !carrierValue}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedVehicle ? (
                  <>
                    <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="font-medium truncate">{selectedVehicle.licensePlate}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{selectedVehicle.make} {selectedVehicle.model}</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedVehicle.type}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {!carrierValue ? "Selecione primeiro uma transportadora" : "Selecionar veículo..."}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Pesquisar por matrícula, marca ou modelo..." 
                value={vehicleSearchQuery}
                onValueChange={setVehicleSearchQuery}
              />
              <CommandList>
                {isLoadingVehicles && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Carregando veículos...
                  </div>
                )}
                
                {!isLoadingVehicles && !carrierValue && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Selecione uma transportadora primeiro
                  </div>
                )}
                
                {!isLoadingVehicles && carrierValue && filteredVehicles.length === 0 && (
                  <CommandEmpty>
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {vehicleSearchQuery ? `Nenhum veículo encontrado para "${vehicleSearchQuery}"` : "Nenhum veículo disponível para esta transportadora"}
                      </p>
                    </div>
                  </CommandEmpty>
                )}
                
                {filteredVehicles.length > 0 && (
                  <CommandGroup>
                    {filteredVehicles.map((vehicle: Vehicle) => (
                      <CommandItem
                        key={vehicle.id}
                        value={`${vehicle.licensePlate} ${vehicle.make} ${vehicle.model} ${vehicle.type}`}
                        onSelect={() => handleVehicleSelect(vehicle)}
                        className="flex items-center gap-3 p-3"
                      >
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{vehicle.licensePlate}</span>
                            <Badge variant="outline" className="text-xs">
                              {vehicle.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                            <div className="flex items-center gap-2">
                              <span>Combustível: {vehicle.fuelType}</span>
                              {vehicle.capacity && <span>• Capacidade: {vehicle.capacity}</span>}
                            </div>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            vehicleValue === vehicle.id ? "opacity-100" : "opacity-0"
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
        
        {/* Botão para limpar seleção de veículo */}
        {selectedVehicle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVehicleClear}
            className="h-8 px-2 text-xs"
          >
            Limpar veículo
          </Button>
        )}
      </div>
    </div>
  )
})