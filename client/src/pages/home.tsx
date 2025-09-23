import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { VerificationForm } from "@/components/verification-form";
import { VerificationResults } from "@/components/verification-results";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { VerificationRequest, VerificationResult } from "@shared/schema";

export default function Home() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const verificationMutation = useMutation({
    mutationFn: api.verifyContent,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: "Verificação concluída",
          description: "A análise foi realizada com sucesso.",
        });
      } else {
        toast({
          title: "Erro na verificação",
          description: response.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
      console.error("Verification error:", error);
    },
  });

  const handleVerificationSubmit = (request: VerificationRequest) => {
    setResult(null);
    verificationMutation.mutate(request);
  };

  const handleReset = () => {
    setResult(null);
    verificationMutation.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ValidaÍ</h1>
                <p className="text-sm text-muted-foreground">Verificador de Notícias</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-medium">UniBrasil 2025</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Verifique a veracidade de 
              <span className="text-primary"> notícias em tempo real</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sistema acadêmico desenvolvido pela UniBrasil para combater a desinformação. 
              Cole um texto ou link de notícia e receba uma análise completa com fontes confiáveis.
            </p>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Fontes Acadêmicas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>LGPD Compatível</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>IA Responsável</span>
            </div>
          </div>
        </section>

        {/* Verification Form */}
        <VerificationForm
          onSubmit={handleVerificationSubmit}
          isLoading={verificationMutation.isPending}
        />

        {/* Loading State */}
        {verificationMutation.isPending && (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-3 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xl font-semibold">Verificando informação...</span>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p>🔍 Consultando múltiplas fontes confiáveis</p>
                <p>📊 Analisando contexto e veracidade</p>
                <p>⚖️ Detectando possíveis vieses</p>
              </div>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Resultado da Verificação</h2>
              <Button onClick={handleReset} variant="outline" data-testid="button-reset">
                Nova Verificação
              </Button>
            </div>
            <VerificationResults result={result} />
          </div>
        )}

        {/* Error State */}
        {verificationMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro na verificação. Tente novamente em alguns minutos.
            </AlertDescription>
          </Alert>
        )}

        {/* How it Works Section */}
        <Card className="p-6 md:p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Como o ValidaÍ Funciona</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🔍</span>
              </div>
              <h4 className="font-semibold text-foreground">1. Análise da Informação</h4>
              <p className="text-sm text-muted-foreground">Processamos o texto ou link usando inteligência artificial avançada</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">📚</span>
              </div>
              <h4 className="font-semibold text-foreground">2. Consulta de Fontes</h4>
              <p className="text-sm text-muted-foreground">Buscamos em múltiplas fontes acadêmicas e jornalísticas confiáveis</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="font-semibold text-foreground">3. Relatório Completo</h4>
              <p className="text-sm text-muted-foreground">Apresentamos a classificação com explicações claras e fontes</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Sobre o ValidaÍ</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sistema acadêmico desenvolvido para o PROEX IV – IA Aplicada – UniBrasil/2025. 
                Criado com rigor científico para combater a desinformação no Brasil.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Equipe:</strong> Leonardo Bora, João Soares, Luan Constancio, Matheus Leite
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Privacidade e Segurança</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ Conforme LGPD</p>
                <p>✅ Não armazenamos conteúdo pessoal</p>
                <p>✅ Análise automatizada segura</p>
                <p>✅ Fontes acadêmicas verificadas</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            © 2025 ValidaÍ - UniBrasil Centro Universitário. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
