import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  ExternalLink,
  Calendar,
  FileText,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Home,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface VerificationHistoryItem {
  id: string;
  inputType: "text" | "url";
  content: string;
  url?: string;
  createdAt: string;
  result?: {
    id: string;
    classification: "VERDADEIRO" | "FALSO" | "PARCIALMENTE_VERDADEIRO" | "NAO_VERIFICAVEL";
    confidencePercentage: number;
    confidenceLevel: "ALTO" | "MEDIO" | "BAIXO";
    explanation: string;
    temporalContext: string;
    detectedBias: string;
    sources: Array<{
      name: string;
      url?: string;
      description: string;
      year?: number;
    }>;
    observations?: string;
    processingTimeMs?: number;
    createdAt: string;
  };
}

interface HistoryResponse {
  verifications: VerificationHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

function getClassificationIcon(classification: string) {
  switch (classification) {
    case "VERDADEIRO":
      return <CheckCircle className="h-4 w-4 text-green-600" data-testid="icon-verdadeiro" />;
    case "FALSO":
      return <XCircle className="h-4 w-4 text-red-600" data-testid="icon-falso" />;
    case "PARCIALMENTE_VERDADEIRO":
      return <AlertCircle className="h-4 w-4 text-yellow-600" data-testid="icon-parcial" />;
    case "NAO_VERIFICAVEL":
      return <HelpCircle className="h-4 w-4 text-gray-600" data-testid="icon-nao-verificavel" />;
    default:
      return <HelpCircle className="h-4 w-4 text-gray-600" data-testid="icon-default" />;
  }
}

function getClassificationLabel(classification: string) {
  switch (classification) {
    case "VERDADEIRO":
      return "Verdadeiro";
    case "FALSO":
      return "Falso";
    case "PARCIALMENTE_VERDADEIRO":
      return "Parcialmente Verdadeiro";
    case "NAO_VERIFICAVEL":
      return "Não Verificável";
    default:
      return "Desconhecido";
  }
}

function getClassificationVariant(classification: string): "default" | "secondary" | "destructive" | "outline" {
  switch (classification) {
    case "VERDADEIRO":
      return "default";
    case "FALSO":
      return "destructive";
    case "PARCIALMENTE_VERDADEIRO":
      return "secondary";
    case "NAO_VERIFICAVEL":
      return "outline";
    default:
      return "outline";
  }
}

export default function HistoryPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedItem, setSelectedItem] = useState<VerificationHistoryItem | null>(null);

  // Fetch verification history
  const { data: historyData, isLoading, error } = useQuery<{ success: boolean; data: HistoryResponse }>({
    queryKey: ["/api/history", page, search, classification === "all" ? undefined : classification, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      if (classification !== "all") params.append("classification", classification);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      
      const url = `/api/history?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: true
  });

  // Delete verification mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/history/${id}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "Verificação removida",
        description: "A verificação foi removida do seu histórico com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
    onError: () => {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a verificação. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setSearch("");
    setClassification("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6" data-testid="history-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando histórico de verificações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6" data-testid="history-error">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar histórico</h3>
              <p className="text-muted-foreground">Não foi possível carregar seu histórico de verificações. Tente novamente.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const verifications = historyData?.data.verifications || [];
  const pagination = historyData?.data.pagination;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4" data-testid="link-home">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">ValidaÍ</h1>
                  <p className="text-sm text-muted-foreground">Verificador de Notícias</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <Badge variant="secondary" className="font-medium">UniBrasil 2025</Badge>
              </div>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:block">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/" className="flex items-center space-x-2 w-full" data-testid="link-home-menu">
                        <Home className="h-4 w-4" />
                        <span>Início</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="flex items-center space-x-2"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6" data-testid="history-page">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
              Histórico de Verificações
            </h1>
            <p className="text-muted-foreground" data-testid="page-description">
              Veja e gerencie suas verificações anteriores
            </p>
          </div>
          {pagination && (
            <div className="text-sm text-muted-foreground" data-testid="results-count">
              {pagination.total > 0 ? (
                `${pagination.total} verificação${pagination.total === 1 ? "" : "ões"} encontrada${pagination.total === 1 ? "" : "s"}`
              ) : (
                "Nenhuma verificação encontrada"
              )}
            </div>
          )}
        </div>

        {/* Filters Section */}
        <Card data-testid="filters-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por conteúdo ou URL..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Classificação</label>
              <Select value={classification} onValueChange={setClassification}>
                <SelectTrigger data-testid="select-classification">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="VERDADEIRO">Verdadeiro</SelectItem>
                  <SelectItem value="FALSO">Falso</SelectItem>
                  <SelectItem value="PARCIALMENTE_VERDADEIRO">Parcialmente Verdadeiro</SelectItem>
                  <SelectItem value="NAO_VERIFICAVEL">Não Verificável</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data inicial</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="input-date-from"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data final</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="input-date-to"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} data-testid="button-search">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={handleClearFilters} data-testid="button-clear-filters">
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification History List */}
      <div className="space-y-4" data-testid="verifications-list">
        {verifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma verificação encontrada</h3>
                <p className="text-muted-foreground">
                  {search || classification !== "all" || dateFrom || dateTo
                    ? "Tente ajustar os filtros para encontrar verificações."
                    : "Você ainda não realizou nenhuma verificação."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          verifications.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow" data-testid={`verification-card-${item.id}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header with type and date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {item.inputType === "url" ? (
                        <LinkIcon className="h-4 w-4" data-testid="icon-url" />
                      ) : (
                        <FileText className="h-4 w-4" data-testid="icon-text" />
                      )}
                      <span>{item.inputType === "url" ? "URL" : "Texto"}</span>
                      <Calendar className="h-4 w-4 ml-auto" />
                      <span data-testid={`date-${item.id}`}>
                        {format(new Date(item.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Content preview */}
                    <div>
                      {item.inputType === "url" && item.url ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">URL verificada:</p>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all"
                            data-testid={`url-link-${item.id}`}
                          >
                            {item.url}
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Conteúdo verificado:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`content-preview-${item.id}`}>
                            {item.content.substring(0, 200)}
                            {item.content.length > 200 && "..."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Result */}
                    {item.result && (
                      <div className="flex items-center gap-2">
                        {getClassificationIcon(item.result.classification)}
                        <Badge 
                          variant={getClassificationVariant(item.result.classification)}
                          data-testid={`classification-badge-${item.id}`}
                        >
                          {getClassificationLabel(item.result.classification)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Confiança: {item.result.confidencePercentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                          data-testid={`button-view-${item.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Verificação</DialogTitle>
                          <DialogDescription>
                            Verificação realizada em {selectedItem && format(new Date(selectedItem.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedItem && (
                          <div className="space-y-6">
                            {/* Content */}
                            <div>
                              <h4 className="font-semibold mb-2">Conteúdo Verificado</h4>
                              {selectedItem.inputType === "url" && selectedItem.url ? (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">URL:</p>
                                  <a 
                                    href={selectedItem.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all"
                                  >
                                    {selectedItem.url}
                                  </a>
                                </div>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap">{selectedItem.content}</p>
                              )}
                            </div>

                            {/* Result */}
                            {selectedItem.result && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  {getClassificationIcon(selectedItem.result.classification)}
                                  <Badge variant={getClassificationVariant(selectedItem.result.classification)}>
                                    {getClassificationLabel(selectedItem.result.classification)}
                                  </Badge>
                                  <span className="text-sm">
                                    Confiança: {selectedItem.result.confidencePercentage}% ({selectedItem.result.confidenceLevel})
                                  </span>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Explicação</h4>
                                  <p className="text-sm whitespace-pre-wrap">{selectedItem.result.explanation}</p>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Contexto Temporal</h4>
                                  <p className="text-sm">{selectedItem.result.temporalContext}</p>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Viés Detectado</h4>
                                  <p className="text-sm">{selectedItem.result.detectedBias}</p>
                                </div>

                                {selectedItem.result.sources.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Fontes</h4>
                                    <div className="space-y-2">
                                      {selectedItem.result.sources.map((source, index) => (
                                        <div key={index} className="border rounded p-3">
                                          <p className="font-medium">{source.name}</p>
                                          <p className="text-sm text-muted-foreground">{source.description}</p>
                                          {source.url && (
                                            <a 
                                              href={source.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                            >
                                              Ver fonte
                                            </a>
                                          )}
                                          {source.year && (
                                            <p className="text-sm text-muted-foreground">Ano: {source.year}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {selectedItem.result.observations && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Observações</h4>
                                    <p className="text-sm">{selectedItem.result.observations}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover verificação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover esta verificação do seu histórico? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(item.id)}
                            data-testid="button-confirm-delete"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2" data-testid="pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => setPage(page - 1)}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === pagination.page;
              
              return (
                <Button
                  key={pageNum}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {pagination.totalPages > 5 && (
              <>
                <span className="text-muted-foreground px-2">...</span>
                <Button
                  variant={pagination.totalPages === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pagination.totalPages)}
                  data-testid={`button-page-${pagination.totalPages}`}
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => setPage(page + 1)}
            data-testid="button-next-page"
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}