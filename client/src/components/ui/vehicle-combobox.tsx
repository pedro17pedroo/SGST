import * as React from "react"
import { Check, ChevronsUpDown, Truck } from "lucide-react"
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

interface Vehicle {
  id: string
  licensePlate: string
  make: string
  model: string
  year: number
  type: string
  capacity?: string
  fuelType: string
  status: string
}

interface VehicleComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  onVehicleSelect?: (vehicle: Vehicle | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const VehicleCombobox = React.memo(function VehicleCombobox({
  value,
  onValueChange,
  onVehicleSelect,
  placeholder = "Selecionar veículo...",
  disabled = false,
  className,
}: VehicleComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null)

  // Buscar veículos disponíveis
  const vehiclesQueryFn = React.useCallback(async () => {

    const response = await apiRequest('GET', '/api/shipping/vehicles/available')
    if (!response.ok) throw new Error('Erro ao buscar veículos')
    const data = await response.json()

    return data
  }, [])

  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['/api/shipping/vehicles/available'],
    queryFn: vehiclesQueryFn,
    staleTime: 30000, // Cache por 30 segundos
  })



  // Buscar veículo específico quando value muda
  const currentVehicleQueryFn = React.useCallback(async () => {
    if (!value) return null
    
    const response = await apiRequest('GET', `/api/fleet/vehicles/${value}`)
    if (!response.ok) throw new Error('Erro ao buscar veículo')
    return response.json()
  }, [value])

  const { data: currentVehicle } = useQuery({
    queryKey: ['/api/fleet/vehicles', value],
    queryFn: currentVehicleQueryFn,
    enabled: !!value && !selectedVehicle,
  })

  // Atualizar veículo selecionado quando currentVehicle muda
  React.useEffect(() => {
    if (currentVehicle && currentVehicle.id === value) {
      setSelectedVehicle(currentVehicle)
      onVehicleSelect?.(currentVehicle)
    }
  }, [currentVehicle, value, onVehicleSelect])

  const handleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    onValueChange(vehicle.id)
    onVehicleSelect?.(vehicle)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    setSelectedVehicle(null)
    onValueChange("")
    onVehicleSelect?.(null)
    setSearchQuery("")
  }

  // Filtrar veículos com base na pesquisa
  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      vehicle.licensePlate.toLowerCase().includes(query) ||
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query)
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
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Pesquisar por matrícula, marca ou modelo..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Carregando veículos...
                </div>
              )}
              
              {!isLoading && filteredVehicles.length === 0 && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? `Nenhum veículo encontrado para "${searchQuery}"` : "Nenhum veículo disponível"}
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
                      onSelect={() => handleSelect(vehicle)}
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
                          value === vehicle.id ? "opacity-100" : "opacity-0"
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
      {selectedVehicle && (
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