import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Search, 
  Plus,
  Eye,
  Package,
  Clock,
  User,
  Camera,
  Microscope,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react";
import { z } from "zod";

// Quality Control Schema
const qualityInspectionSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  batchNumber: z.string().min(1, "Número do lote é obrigatório"),
  inspectionType: z.enum(["incoming", "in_process", "outgoing", "random"]),
  criteria: z.array(z.object({
    criteriaId: z.string(),
    name: z.string(),
    result: z.enum(["pass", "fail", "na"]),
    score: z.number().min(0).max(100),
    notes: z.string().optional(),
  })),
  overallResult: z.enum(["pass", "fail", "conditional"]),
  overallScore: z.number().min(0).max(100),
  defectsFound: z.array(z.string()).optional(),
  correctiveActions: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

// Audit Schema
const auditSchema = z.object({
  auditType: z.enum(["internal", "external", "supplier", "process"]),
  scope: z.string().min(1, "Âmbito é obrigatório"),
  auditDate: z.string().min(1, "Data é obrigatória"),
  auditor: z.string().min(1, "Auditor é obrigatório"),
  department: z.string().optional(),
  warehouseId: z.string().optional(),
  supplierId: z.string().optional(),
  findings: z.array(z.object({
    category: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    description: z.string(),
    evidence: z.string().optional(),
    correctiveAction: z.string().optional(),
    dueDate: z.string().optional(),
  })),
  overallRating: z.enum(["excellent", "good", "satisfactory", "needs_improvement", "unsatisfactory"]),
  recommendations: z.string().optional(),
});

interface QualityInspection {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  batchNumber: string;
  inspectionType: "incoming" | "in_process" | "outgoing" | "random";
  inspector: {
    id: string;
    name: string;
  };
  overallResult: "pass" | "fail" | "conditional";
  overallScore: number;
  defectsFound: string[];
  correctiveActions?: string;
  status: "pending" | "in_progress" | "completed" | "reviewed";
  reviewedBy?: {
    id: string;
    name: string;
  };
  criteria: Array<{
    criteriaId: string;
    name: string;
    result: "pass" | "fail" | "na";
    score: number;
    notes?: string;
  }>;
  createdAt: string;
  completedAt?: string;
  reviewedAt?: string;
}

interface Audit {
  id: string;
  auditType: "internal" | "external" | "supplier" | "process";
  scope: string;
  auditDate: string;
  auditor: string;
  department?: string;
  warehouse?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  status: "planned" | "in_progress" | "completed" | "follow_up";
  overallRating: "excellent" | "good" | "satisfactory" | "needs_improvement" | "unsatisfactory";
  findings: Array<{
    id: string;
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    evidence?: string;
    correctiveAction?: string;
    dueDate?: string;
    status: "open" | "in_progress" | "closed";
  }>;
  recommendations?: string;
  createdAt: string;
  completedAt?: string;
}

export default function QualityControlPage() {
  const [activeTab, setActiveTab] = useState("inspections");
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inspectionForm = useForm<z.infer<typeof qualityInspectionSchema>>({
    resolver: zodResolver(qualityInspectionSchema),
    defaultValues: {
      productId: "",
      batchNumber: "",
      inspectionType: "incoming",
      criteria: [],
      overallResult: "pass",
      overallScore: 100,
      defectsFound: [],
      correctiveActions: "",
      notes: "",
      photos: [],
    },
  });

  const auditForm = useForm<z.infer<typeof auditSchema>>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      auditType: "internal",
      scope: "",
      auditDate: "",
      auditor: "",
      department: "",
      warehouseId: "",
      supplierId: "",
      findings: [],
      overallRating: "good",
      recommendations: "",
    },
  });

  // Get quality inspections
  const { data: inspections, isLoading: isLoadingInspections } = useQuery({
    queryKey: ['/api/quality-inspections'],
    queryFn: async () => {
      // Demo data for now
      return [
        {
          id: 'insp-001',
          product: {
            id: '1',
            name: 'Smartphone Samsung Galaxy A54',
            sku: 'SPH-001'
          },
          batchNumber: 'BTH-2025-001',
          inspectionType: 'incoming' as const,
          inspector: { id: 'user-001', name: 'Ana Costa' },
          overallResult: 'pass' as const,
          overallScore: 95,
          defectsFound: [],
          status: 'completed' as const,
          reviewedBy: { id: 'user-002', name: 'João Silva' },
          criteria: [
            { criteriaId: 'c1', name: 'Embalagem', result: 'pass' as const, score: 100 },
            { criteriaId: 'c2', name: 'Funcionalidade', result: 'pass' as const, score: 95 },
            { criteriaId: 'c3', name: 'Aparência', result: 'pass' as const, score: 90 },
          ],
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          reviewedAt: new Date().toISOString(),
        },
        {
          id: 'insp-002',
          product: {
            id: '3',
            name: 'Monitor LG 24" Full HD',
            sku: 'MON-003'
          },
          batchNumber: 'BTH-2025-002',
          inspectionType: 'random' as const,
          inspector: { id: 'user-003', name: 'Pedro Santos' },
          overallResult: 'fail' as const,
          overallScore: 60,
          defectsFound: ['Pixels mortos', 'Riscas no ecrã'],
          correctiveActions: 'Produto devolvido ao fornecedor para substituição',
          status: 'completed' as const,
          criteria: [
            { criteriaId: 'c1', name: 'Qualidade de Imagem', result: 'fail' as const, score: 40, notes: 'Pixels mortos detectados' },
            { criteriaId: 'c2', name: 'Conectividade', result: 'pass' as const, score: 95 },
            { criteriaId: 'c3', name: 'Embalagem', result: 'pass' as const, score: 85 },
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'insp-003',
          product: {
            id: '4',
            name: 'Fones JBL Tune 510BT',
            sku: 'FON-004'
          },
          batchNumber: 'BTH-2025-003',
          inspectionType: 'outgoing' as const,
          inspector: { id: 'user-001', name: 'Ana Costa' },
          overallResult: 'conditional' as const,
          overallScore: 75,
          defectsFound: ['Embalagem ligeiramente danificada'],
          correctiveActions: 'Reembalar produto antes do envio',
          status: 'in_progress' as const,
          criteria: [
            { criteriaId: 'c1', name: 'Áudio', result: 'pass' as const, score: 90 },
            { criteriaId: 'c2', name: 'Conectividade Bluetooth', result: 'pass' as const, score: 85 },
            { criteriaId: 'c3', name: 'Embalagem', result: 'fail' as const, score: 50, notes: 'Danos menores na caixa' },
          ],
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        }
      ] as QualityInspection[];
    }
  });

  // Get audits
  const { data: audits, isLoading: isLoadingAudits } = useQuery({
    queryKey: ['/api/audits'],
    queryFn: async () => {
      // Demo data for now
      return [
        {
          id: 'audit-001',
          auditType: 'internal' as const,
          scope: 'Processo de Recebimento',
          auditDate: '2025-01-15',
          auditor: 'Maria Santos (Auditora Sénior)',
          department: 'Logística',
          warehouse: { id: 'wh-001', name: 'Armazém Principal' },
          status: 'completed' as const,
          overallRating: 'good' as const,
          findings: [
            {
              id: 'f1',
              category: 'Documentação',
              severity: 'medium' as const,
              description: 'Documentos de receção não assinados em 15% dos casos',
              correctiveAction: 'Implementar controlo obrigatório de assinatura',
              dueDate: '2025-02-15',
              status: 'in_progress' as const,
            },
            {
              id: 'f2',
              category: 'Processo',
              severity: 'low' as const,
              description: 'Atraso médio de 2 horas na conferência',
              correctiveAction: 'Optimizar fluxo de trabalho',
              dueDate: '2025-02-01',
              status: 'open' as const,
            }
          ],
          recommendations: 'Implementar sistema digital de receção para melhorar eficiência',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'audit-002',
          auditType: 'supplier' as const,
          scope: 'Avaliação de Fornecedor',
          auditDate: '2025-01-10',
          auditor: 'João Ferreira (Auditor Externo)',
          supplier: { id: 'sup-001', name: 'TechSup Angola' },
          status: 'completed' as const,
          overallRating: 'excellent' as const,
          findings: [
            {
              id: 'f3',
              category: 'Qualidade',
              severity: 'low' as const,
              description: 'Certificações ISO atualizadas e válidas',
              status: 'closed' as const,
            }
          ],
          recommendations: 'Manter parceria - fornecedor de excelência',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ] as Audit[];
    }
  });

  // Get products for forms
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<Array<{ id: string; name: string; sku: string; }>>;
    }
  });

  // Create inspection mutation
  const createInspectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof qualityInspectionSchema>) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'new-inspection', ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quality-inspections'] });
      toast({
        title: "Inspeção criada com sucesso!",
        description: "A inspeção de qualidade foi registada no sistema.",
      });
      setIsInspectionDialogOpen(false);
      inspectionForm.reset();
    },
  });

  // Create audit mutation
  const createAuditMutation = useMutation({
    mutationFn: async (data: z.infer<typeof auditSchema>) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'new-audit', ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audits'] });
      toast({
        title: "Auditoria criada com sucesso!",
        description: "A auditoria foi registada no sistema.",
      });
      setIsAuditDialogOpen(false);
      auditForm.reset();
    },
  });

  const onInspectionSubmit = (data: z.infer<typeof qualityInspectionSchema>) => {
    createInspectionMutation.mutate(data);
  };

  const onAuditSubmit = (data: z.infer<typeof auditSchema>) => {
    createAuditMutation.mutate(data);
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "pass":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case "fail":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Reprovado</Badge>;
      case "conditional":
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Condicional</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "in_progress":
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />Em Progresso</Badge>;
      case "completed":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Concluído</Badge>;
      case "reviewed":
        return <Badge variant="default"><Award className="w-3 h-3 mr-1" />Revisado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case "excellent":
        return <Badge variant="default" className="bg-green-600">Excelente</Badge>;
      case "good":
        return <Badge variant="default">Bom</Badge>;
      case "satisfactory":
        return <Badge variant="secondary">Satisfatório</Badge>;
      case "needs_improvement":
        return <Badge variant="destructive">Precisa Melhorar</Badge>;
      case "unsatisfactory":
        return <Badge variant="destructive">Insatisfatório</Badge>;
      default:
        return <Badge variant="outline">{rating}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "high":
        return <Badge variant="destructive">Alto</Badge>;
      case "medium":
        return <Badge variant="secondary">Médio</Badge>;
      case "low":
        return <Badge variant="outline">Baixo</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const filteredInspections = inspections?.filter(inspection => {
    const matchesSearch = 
      inspection.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && inspection.status === filterStatus;
  }) || [];

  const filteredAudits = audits?.filter(audit => {
    const matchesSearch = 
      audit.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audit.department || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && audit.status === filterStatus;
  }) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Controlo de Qualidade
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão de inspeções de qualidade, auditorias e conformidade
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Procurar por produto, lote, auditor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-quality"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
              <p className="text-2xl font-bold text-foreground" data-testid="approval-rate">
                94.2%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1% vs mês anterior
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Microscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inspeções Este Mês</p>
              <p className="text-2xl font-bold text-foreground" data-testid="inspections-count">
                127
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.5% vs mês anterior
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Auditorias Concluídas</p>
              <p className="text-2xl font-bold text-foreground" data-testid="audits-completed">
                15
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Meta: 12/mês
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Não Conformidades</p>
              <p className="text-2xl font-bold text-foreground" data-testid="non-conformities">
                8
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                -15% vs mês anterior
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inspections" data-testid="tab-inspections">
            <Microscope className="w-4 h-4 mr-2" />
            Inspeções de Qualidade
          </TabsTrigger>
          <TabsTrigger value="audits" data-testid="tab-audits">
            <Shield className="w-4 h-4 mr-2" />
            Auditorias
          </TabsTrigger>
        </TabsList>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-inspection-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Inspeção
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Inspeção de Qualidade</DialogTitle>
                </DialogHeader>
                <Form {...inspectionForm}>
                  <form onSubmit={inspectionForm.handleSubmit(onInspectionSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={inspectionForm.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produto</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-product">
                                  <SelectValue placeholder="Seleccione o produto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products?.map((product: any) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={inspectionForm.control}
                        name="batchNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Lote</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="BTH-2025-001" 
                                {...field} 
                                data-testid="input-batch-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={inspectionForm.control}
                      name="inspectionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Inspeção</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-inspection-type">
                                <SelectValue placeholder="Seleccione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="incoming">Receção</SelectItem>
                              <SelectItem value="in_process">Processo</SelectItem>
                              <SelectItem value="outgoing">Expedição</SelectItem>
                              <SelectItem value="random">Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Resultado da Inspeção</h4>
                      
                      <FormField
                        control={inspectionForm.control}
                        name="overallResult"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resultado Geral</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-6"
                                data-testid="radio-overall-result"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="pass" id="pass" />
                                  <Label htmlFor="pass">Aprovado</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="fail" id="fail" />
                                  <Label htmlFor="fail">Reprovado</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="conditional" id="conditional" />
                                  <Label htmlFor="conditional">Condicional</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={inspectionForm.control}
                        name="overallScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pontuação Geral (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="100" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-overall-score"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={inspectionForm.control}
                      name="correctiveActions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ações Corretivas</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva as ações corretivas necessárias..." 
                              {...field} 
                              data-testid="textarea-corrective-actions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={inspectionForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações adicionais..." 
                              {...field} 
                              data-testid="textarea-inspection-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsInspectionDialogOpen(false)}
                        data-testid="button-cancel-inspection"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createInspectionMutation.isPending}
                        data-testid="button-submit-inspection"
                      >
                        Criar Inspeção
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            {isLoadingInspections ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInspections.map((inspection) => (
                  <div 
                    key={inspection.id} 
                    className="border border-border rounded-lg p-4 space-y-3"
                    data-testid={`inspection-item-${inspection.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Microscope className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid={`inspection-product-${inspection.id}`}>
                            {inspection.product.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>SKU: {inspection.product.sku}</span>
                            <span>•</span>
                            <span>Lote: {inspection.batchNumber}</span>
                            <span>•</span>
                            <span>{inspection.inspectionType.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getResultBadge(inspection.overallResult)}
                        {getStatusBadge(inspection.status)}
                        <Badge variant="outline">{inspection.overallScore}%</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Inspetor:</span> {inspection.inspector.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Criada:</span> {new Date(inspection.createdAt).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      {inspection.reviewedBy && (
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">Revisada por:</span> {inspection.reviewedBy.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {inspection.defectsFound.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Defeitos Encontrados</h4>
                        <div className="flex flex-wrap gap-2">
                          {inspection.defectsFound.map((defect, index) => (
                            <Badge key={index} variant="destructive">{defect}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {inspection.correctiveActions && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Ações Corretivas</h4>
                        <p className="text-sm text-muted-foreground">{inspection.correctiveActions}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {inspection.completedAt && (
                          <div>Concluída: {new Date(inspection.completedAt).toLocaleString('pt-PT')}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" data-testid={`view-inspection-${inspection.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredInspections.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Microscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {searchQuery ? "Nenhuma inspeção encontrada" : "Nenhuma inspeção registada"}
                    </p>
                    <p className="text-sm">
                      {searchQuery 
                        ? "Tente ajustar os termos de pesquisa" 
                        : "Crie uma nova inspeção para começar"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-audit-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Auditoria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Auditoria</DialogTitle>
                </DialogHeader>
                <Form {...auditForm}>
                  <form onSubmit={auditForm.handleSubmit(onAuditSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={auditForm.control}
                        name="auditType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Auditoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-audit-type">
                                  <SelectValue placeholder="Seleccione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="internal">Interna</SelectItem>
                                <SelectItem value="external">Externa</SelectItem>
                                <SelectItem value="supplier">Fornecedor</SelectItem>
                                <SelectItem value="process">Processo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="auditDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data da Auditoria</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                data-testid="input-audit-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={auditForm.control}
                      name="scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âmbito da Auditoria</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Processo de Recebimento" 
                              {...field} 
                              data-testid="input-audit-scope"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={auditForm.control}
                      name="auditor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auditor</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nome do auditor" 
                              {...field} 
                              data-testid="input-auditor"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={auditForm.control}
                      name="overallRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avaliação Geral</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-overall-rating">
                                <SelectValue placeholder="Seleccione a avaliação" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excelente</SelectItem>
                              <SelectItem value="good">Bom</SelectItem>
                              <SelectItem value="satisfactory">Satisfatório</SelectItem>
                              <SelectItem value="needs_improvement">Precisa Melhorar</SelectItem>
                              <SelectItem value="unsatisfactory">Insatisfatório</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={auditForm.control}
                      name="recommendations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recomendações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Recomendações e ações sugeridas..." 
                              {...field} 
                              data-testid="textarea-recommendations"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAuditDialogOpen(false)}
                        data-testid="button-cancel-audit"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createAuditMutation.isPending}
                        data-testid="button-submit-audit"
                      >
                        Criar Auditoria
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            {isLoadingAudits ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAudits.map((audit) => (
                  <div 
                    key={audit.id} 
                    className="border border-border rounded-lg p-4 space-y-3"
                    data-testid={`audit-item-${audit.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid={`audit-scope-${audit.id}`}>
                            {audit.scope}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{audit.auditType} • {audit.auditor}</span>
                            {audit.department && (
                              <>
                                <span>•</span>
                                <span>{audit.department}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRatingBadge(audit.overallRating)}
                        {getStatusBadge(audit.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Data:</span> {new Date(audit.auditDate).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Descobertas:</span> {audit.findings.length}
                        </span>
                      </div>
                      {audit.warehouse && (
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">Armazém:</span> {audit.warehouse.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {audit.findings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Principais Descobertas</h4>
                        <div className="space-y-1">
                          {audit.findings.slice(0, 2).map((finding) => (
                            <div key={finding.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{finding.description}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getSeverityBadge(finding.severity)}
                                <Badge variant={finding.status === 'closed' ? 'default' : 'outline'}>
                                  {finding.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {audit.findings.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{audit.findings.length - 2} mais descobertas...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {audit.recommendations && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Recomendações</h4>
                        <p className="text-sm text-muted-foreground">{audit.recommendations}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {audit.completedAt && (
                          <div>Concluída: {new Date(audit.completedAt).toLocaleString('pt-PT')}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" data-testid={`view-audit-${audit.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAudits.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {searchQuery ? "Nenhuma auditoria encontrada" : "Nenhuma auditoria registada"}
                    </p>
                    <p className="text-sm">
                      {searchQuery 
                        ? "Tente ajustar os termos de pesquisa" 
                        : "Crie uma nova auditoria para começar"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}