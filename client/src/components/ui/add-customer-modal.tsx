import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { User, Building2, Mail, Phone, MapPin, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

// Schema de validação baseado no schema do servidor
const customerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  email: z.string(),
  phone: z.string(),
  mobile: z.string(),
  address: z.string(),
  city: z.string().max(100, "Cidade muito longa"),
  province: z.string().max(100, "Província muito longa"),
  postalCode: z.string().max(20, "Código postal muito longo"),
  country: z.string().max(100, "País muito longo"),
  taxNumber: z.string().max(50, "Número fiscal muito longo"),
  customerType: z.enum(["individual", "company"]),
  notes: z.string(),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

interface Customer {
  id: string
  customerNumber: string
  name: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  country: string
  taxNumber?: string
  customerType: 'individual' | 'company'
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

interface AddCustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerCreated?: (customer: Customer) => void
}

export function AddCustomerModal({
  open,
  onOpenChange,
  onCustomerCreated,
}: AddCustomerModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      mobile: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Angola",
      taxNumber: "",
      customerType: "individual",
      notes: "",
    },
  })

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const response = await apiRequest('POST', '/api/customers', data)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar cliente')
      }
      return response.json()
    },
    onSuccess: (customer: Customer) => {
      toast({
        title: "Cliente criado com sucesso",
        description: `Cliente ${customer.name} (${customer.customerNumber}) foi criado.`,
      })
      
      // Invalidar cache de clientes
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] })
      queryClient.invalidateQueries({ queryKey: ['/api/customers/search'] })
      
      // Chamar callback se fornecido
      onCustomerCreated?.(customer)
      
      // Fechar modal e resetar formulário
      onOpenChange(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: CustomerFormData) => {
    // Limpar campos vazios
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== "" && value !== undefined)
    ) as CustomerFormData
    
    createCustomerMutation.mutate(cleanData)
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  const customerType = form.watch("customerType")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Adicionar Novo Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do cliente. Os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Informações Básicas
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="individual">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Individual
                            </div>
                          </SelectItem>
                          <SelectItem value="company">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              Empresa
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {customerType === "company" ? "Nome da Empresa" : "Nome Completo"} *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {customerType === "company" ? "NIF" : "Número Fiscal"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Número fiscal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefone
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+244 xxx xxx xxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telemóvel
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+244 9xx xxx xxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Endereço */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Endereço
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Rua, número, bairro..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Luanda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Província</FormLabel>
                      <FormControl>
                        <Input placeholder="Luanda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o cliente..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={createCustomerMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createCustomerMutation.isPending}
              >
                {createCustomerMutation.isPending ? "Criando..." : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}