import * as React from "react"
import { Check, ChevronsUpDown, Plus, Tag } from "lucide-react"
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

interface Category {
  id: string
  name: string
  description?: string | null
}

interface CategoryComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  onCategorySelect?: (category: Category | null) => void
  onAddNewCategory?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  newlyCreatedCategory?: Category | null
}

export const CategoryCombobox = React.memo(function CategoryCombobox({
  value,
  onValueChange,
  onCategorySelect,
  onAddNewCategory,
  placeholder = "Selecionar categoria...",
  disabled = false,
  className,
  newlyCreatedCategory,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)

  // Buscar categorias com base na query de pesquisa
  const searchQueryFn = React.useCallback(async ({ signal }: { signal?: AbortSignal }) => {
    if (!searchQuery || searchQuery.length < 2) return []
    
    try {
      const response = await apiRequest('GET', `/api/categories/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Erro ao buscar categorias')
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

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/categories/search', searchQuery],
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

  // Buscar categoria específica quando value muda
  const currentCategoryQueryFn = React.useCallback(async ({ signal }: { signal?: AbortSignal }) => {
    if (!value) return null
    
    try {
      const response = await apiRequest('GET', `/api/categories/${value}`)
      if (!response.ok) throw new Error('Erro ao buscar categoria')
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

  const { data: currentCategory } = useQuery({
    queryKey: ['/api/categories', value],
    queryFn: currentCategoryQueryFn,
    enabled: !!value && !selectedCategory,
    retry: (failureCount, error) => {
      // Não tentar novamente se for erro de cancelamento
      if (error instanceof Error && error.name === 'AbortError') {
        return false
      }
      return failureCount < 2
    },
  })

  // Atualizar categoria selecionada quando currentCategory muda
  React.useEffect(() => {
    if (currentCategory && currentCategory.id === value) {
      setSelectedCategory(currentCategory)
      onCategorySelect?.(currentCategory)
    }
  }, [currentCategory, value, onCategorySelect])

  // Selecionar automaticamente categoria recém-criada
  React.useEffect(() => {
    if (newlyCreatedCategory) {
      setSelectedCategory(newlyCreatedCategory)
      onValueChange(newlyCreatedCategory.id)
      onCategorySelect?.(newlyCreatedCategory)
    }
  }, [newlyCreatedCategory, onValueChange, onCategorySelect])

  const handleSelect = React.useCallback((category: Category) => {
    setSelectedCategory(category)
    onValueChange(category.id)
    onCategorySelect?.(category)
    setOpen(false)
    setSearchQuery("")
  }, [onValueChange, onCategorySelect])

  const handleClear = React.useCallback(() => {
    setSelectedCategory(null)
    onValueChange("")
    onCategorySelect?.(null)
    setSearchQuery("")
  }, [onValueChange, onCategorySelect])

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
              {selectedCategory ? (
                <>
                  <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium truncate">{selectedCategory.name}</span>
                    {selectedCategory.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {selectedCategory.description}
                      </span>
                    )}
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
              placeholder="Pesquisar categoria por nome..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Pesquisando...
                </div>
              )}
              
              {!isLoading && searchQuery.length >= 2 && categories.length === 0 && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Nenhuma categoria encontrada para "{searchQuery}"
                    </p>
                    {onAddNewCategory && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onAddNewCategory()
                          setOpen(false)
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar nova categoria
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
              
              {categories.length > 0 && (
                <CommandGroup>
                  {categories.map((category: Category) => (
                    <CommandItem
                      key={category.id}
                      value={`${category.name} ${category.description || ''}`}
                      onSelect={() => handleSelect(category)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* Opção para adicionar nova categoria sempre visível quando há função */}
              {onAddNewCategory && searchQuery.length >= 2 && (
                <>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onAddNewCategory()
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 p-3 border-t"
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <span>Adicionar nova categoria</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Botão para limpar seleção */}
      {selectedCategory && (
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