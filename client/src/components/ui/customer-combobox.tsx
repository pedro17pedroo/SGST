import * as React from "react"
import { Check, ChevronsUpDown, Plus, User } from "lucide-react"
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
import { type Customer } from "@shared/schema"

interface CustomerComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  onCustomerSelect?: (customer: Customer | null) => void
  onAddNewCustomer?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  newlyCreatedCustomer?: Customer | null // Novo prop para cliente recém-criado
}

export function CustomerCombobox({
  value,
  onValueChange,
  onCustomerSelect,
  onAddNewCustomer,
  placeholder = "Selecionar cliente...",
  disabled = false,
  className,
  newlyCreatedCustomer,
}: CustomerComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)

  // Buscar clientes com base na query de pesquisa
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['/api/customers/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return []
      
      console.log('🔍 CustomerCombobox: Fazendo pesquisa para:', searchQuery)
      const response = await apiRequest('GET', `/api/customers/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Erro ao buscar clientes')
      const data = await response.json()
      console.log('📊 CustomerCombobox: Resultados recebidos:', data)
      return data
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // Cache por 30 segundos
  })

  // Log de debug para acompanhar o estado
  React.useEffect(() => {
    console.log('🎯 CustomerCombobox Estado:', {
      searchQuery,
      customersCount: customers.length,
      isLoading,
      error: error?.message,
      selectedCustomer: selectedCustomer?.name
    })
  }, [searchQuery, customers, isLoading, error, selectedCustomer])

  // Buscar cliente específico quando value muda
  const { data: currentCustomer } = useQuery({
    queryKey: ['/api/customers', value],
    queryFn: async () => {
      if (!value) return null
      
      const response = await apiRequest('GET', `/api/customers/${value}`)
      if (!response.ok) throw new Error('Erro ao buscar cliente')
      return response.json()
    },
    enabled: !!value && !selectedCustomer,
  })

  // Atualizar cliente selecionado quando currentCustomer muda
  React.useEffect(() => {
    if (currentCustomer && currentCustomer.id === value) {
      setSelectedCustomer(currentCustomer)
      onCustomerSelect?.(currentCustomer)
    }
  }, [currentCustomer, value, onCustomerSelect])

  // Selecionar automaticamente cliente recém-criado
  React.useEffect(() => {
    if (newlyCreatedCustomer) {
      setSelectedCustomer(newlyCreatedCustomer)
      onValueChange(newlyCreatedCustomer.id)
      onCustomerSelect?.(newlyCreatedCustomer)
    }
  }, [newlyCreatedCustomer, onValueChange, onCustomerSelect])

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    onValueChange(customer.id)
    onCustomerSelect?.(customer)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    setSelectedCustomer(null)
    onValueChange("")
    onCustomerSelect?.(null)
    setSearchQuery("")
  }

  const displayValue = selectedCustomer 
    ? `${selectedCustomer.name} (${selectedCustomer.customerNumber})`
    : placeholder

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
              {selectedCustomer ? (
                <>
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium truncate">{selectedCustomer.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{selectedCustomer.customerNumber}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedCustomer.customerType === 'individual' ? 'Individual' : 'Empresa'}
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
              placeholder="Pesquisar cliente por nome, email ou telefone..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Pesquisando...
                </div>
              )}
              
              {!isLoading && searchQuery.length >= 2 && customers.length === 0 && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Nenhum cliente encontrado para "{searchQuery}"
                    </p>
                    {onAddNewCustomer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onAddNewCustomer()
                          setOpen(false)
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar novo cliente
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
              )}
              
              {!isLoading && searchQuery.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Digite pelo menos 2 caracteres para pesquisar
                </div>
              )}
              
              {customers.length > 0 && (
                <CommandGroup>
                  {(() => {
                    console.log('🎨 CustomerCombobox: Renderizando', customers.length, 'clientes')
                    return customers.map((customer: Customer) => {
                      console.log('👤 CustomerCombobox: Renderizando cliente:', customer.name)
                      return (
                        <CommandItem
                          key={customer.id}
                          value={customer.id}
                          onSelect={() => handleSelect(customer)}
                          className="flex items-center gap-3 p-3"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{customer.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {customer.customerType === 'individual' ? 'Individual' : 'Empresa'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Nº: {customer.customerNumber}</div>
                              {customer.email && <div>Email: {customer.email}</div>}
                              {customer.phone && <div>Tel: {customer.phone}</div>}
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              value === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      )
                    })
                  })()} 
                </CommandGroup>
              )}
              
              {/* Opção para adicionar novo cliente sempre visível quando há função */}
              {onAddNewCustomer && searchQuery.length >= 2 && (
                <>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onAddNewCustomer()
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 p-3 border-t"
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <span>Adicionar novo cliente</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Botão para limpar seleção */}
      {selectedCustomer && (
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
}