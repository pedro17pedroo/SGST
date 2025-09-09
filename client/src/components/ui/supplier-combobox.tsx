import * as React from "react"
import { Check, ChevronsUpDown, Plus, Building } from "lucide-react"
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

import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"

interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

interface SupplierComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  onSupplierSelect?: (supplier: Supplier | null) => void
  onAddNewSupplier?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  newlyCreatedSupplier?: Supplier | null
}

export const SupplierCombobox = React.memo(function SupplierCombobox({
  value,
  onValueChange,
  onSupplierSelect,
  onAddNewSupplier,
  placeholder = "Selecionar fornecedor...",
  disabled = false,
  className,
  newlyCreatedSupplier,
}: SupplierComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null)

  // Buscar fornecedores com base na query de pesquisa
  const searchQueryFn = React.useCallback(async () => {
    if (!searchQuery || searchQuery.length < 2) return []
    
    try {
      const response = await apiRequest('GET', `/api/suppliers/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Erro ao buscar fornecedores')
      const result = await response.json()
      // Extrair dados do campo 'data' da resposta da API
      return result.data || []
    } catch (error) {
      // Ignorar erros de cancelamento
      if (error instanceof Error && error.name === 'AbortError') {
        return []
      }
      throw error
    }
  }, [searchQuery])

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['/api/suppliers/search', searchQuery],
    queryFn: searchQueryFn,
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // Cache por 30 segundos
    retry: (failureCount, error) => {
      // Não tentar novamente se for erro de cancelamento
      if (error instanceof Error && error.name === 'AbortError') {
        return false
      }
      return failureCount < 2
    },
  })

  // Buscar fornecedor específico quando value muda
  const currentSupplierQueryFn = React.useCallback(async () => {
    if (!value) return null
    
    try {
      const response = await apiRequest('GET', `/api/suppliers/${value}`)
      if (!response.ok) throw new Error('Erro ao buscar fornecedor')
      const result = await response.json()
      // Extrair dados do campo 'data' da resposta da API
      return result.data || null
    } catch (error) {
      // Ignorar erros de cancelamento
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }
      throw error
    }
  }, [value])

  const { data: currentSupplier } = useQuery({
    queryKey: ['/api/suppliers', value],
    queryFn: currentSupplierQueryFn,
    enabled: !!value && !selectedSupplier,
    retry: (failureCount, error) => {
      // Não tentar novamente se for erro de cancelamento
      if (error instanceof Error && error.name === 'AbortError') {
        return false
      }
      return failureCount < 2
    },
  })

  // Atualizar fornecedor selecionado quando currentSupplier muda
  React.useEffect(() => {
    if (currentSupplier && currentSupplier.id === value) {
      setSelectedSupplier(currentSupplier)
      onSupplierSelect?.(currentSupplier)
    }
  }, [currentSupplier, value, onSupplierSelect])

  // Selecionar automaticamente fornecedor recém-criado
  React.useEffect(() => {
    if (newlyCreatedSupplier) {
      setSelectedSupplier(newlyCreatedSupplier)
      onValueChange(newlyCreatedSupplier.id)
      onSupplierSelect?.(newlyCreatedSupplier)
    }
  }, [newlyCreatedSupplier, onValueChange, onSupplierSelect])

  const handleSelect = React.useCallback((supplier: Supplier) => {
    setSelectedSupplier(supplier)
    onValueChange(supplier.id)
    onSupplierSelect?.(supplier)
    setOpen(false)
    setSearchQuery("")
  }, [onValueChange, onSupplierSelect])

  const handleClear = React.useCallback(() => {
    setSelectedSupplier(null)
    onValueChange("")
    onSupplierSelect?.(null)
    setSearchQuery("")
  }, [onValueChange, onSupplierSelect])

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
              {selectedSupplier ? (
                <>
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium truncate">{selectedSupplier.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {selectedSupplier.email && <span>{selectedSupplier.email}</span>}
                      {selectedSupplier.phone && <span>{selectedSupplier.phone}</span>}
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
              placeholder="Pesquisar fornecedor por nome, email ou telefone..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Pesquisando...
                </div>
              )}
              
              {!isLoading && searchQuery.length >= 2 && suppliers.length === 0 && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Nenhum fornecedor encontrado para "{searchQuery}"
                    </p>
                    {onAddNewSupplier && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onAddNewSupplier()
                          setOpen(false)
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar novo fornecedor
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
              
              {suppliers.length > 0 && (
                <CommandGroup>
                  {suppliers.map((supplier: Supplier) => (
                    <CommandItem
                      key={supplier.id}
                      value={`${supplier.name} ${supplier.email || ''} ${supplier.phone || ''}`}
                      onSelect={() => handleSelect(supplier)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {supplier.email && <div>Email: {supplier.email}</div>}
                          {supplier.phone && <div>Tel: {supplier.phone}</div>}
                          {supplier.address && <div>Endereço: {supplier.address}</div>}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === supplier.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* Opção para adicionar novo fornecedor sempre visível quando há função */}
              {onAddNewSupplier && searchQuery.length >= 2 && (
                <>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onAddNewSupplier()
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 p-3 border-t"
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <span>Adicionar novo fornecedor</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Botão para limpar seleção */}
      {selectedSupplier && (
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