import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createStockMovement } from "@/lib/api";

const stockMovementSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  warehouseId: z.string().min(1, "Armazém é obrigatório"),
  type: z.enum(["in", "out", "transfer", "adjustment"], {
    required_error: "Tipo de movimento é obrigatório",
  }),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  reference: z.string().optional(),
  reason: z.string().optional(),
});

type StockMovementForm = z.infer<typeof stockMovementSchema>;

interface StockMovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockMovementForm({ open, onOpenChange }: StockMovementFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StockMovementForm>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      productId: "",
      warehouseId: "",
      type: "in",
      quantity: "",
      reference: "",
      reason: "",
    },
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const { data: warehouses = [] } = useQuery<any[]>({
    queryKey: ["/api/warehouses"],
  });

  const createMutation = useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({
        title: "Movimento registado",
        description: "O movimento de stock foi registado com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registar movimento.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StockMovementForm) => {
    const formattedData = {
      ...data,
      quantity: parseInt(data.quantity),
      reference: data.reference || null,
      reason: data.reason || null,
    };

    createMutation.mutate(formattedData);
  };

  const getMovementTypes = () => [
    { value: "in", label: "Entrada", description: "Recebimento de mercadoria" },
    { value: "out", label: "Saída", description: "Venda ou expedição" },
    { value: "transfer", label: "Transferência", description: "Entre armazéns" },
    { value: "adjustment", label: "Ajuste", description: "Correção de inventário" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="stock-movement-form">
        <DialogHeader>
          <DialogTitle data-testid="stock-movement-form-title">
            Registar Movimento de Stock
          </DialogTitle>
          <DialogDescription>
            Registe entradas, saídas ou ajustes de stock.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-movement-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getMovementTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-product">
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Armazém *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-warehouse">
                          <SelectValue placeholder="Selecione o armazém" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map((warehouse: any) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        data-testid="input-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referência</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: PO-2024-001" 
                        {...field} 
                        data-testid="input-reference"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do movimento..." 
                      className="min-h-[80px]"
                      {...field} 
                      data-testid="input-reason"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                {createMutation.isPending ? "Registando..." : "Registar Movimento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}