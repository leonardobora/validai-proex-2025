import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { VerificationResult } from "@shared/schema";
import { SourceBiasDistribution } from "@/components/SourceBiasDistribution";
import { SourceCard } from "@/components/SourceCard";

interface VerificationResultsProps {
  result: VerificationResult;
}

export function VerificationResults({ result }: VerificationResultsProps) {
  const getClassificationBadge = () => {
    const { classification } = result;
    
    const badges = {
      VERDADEIRO: {
        icon: "✅",
        text: "INFORMAÇÃO VERDADEIRA",
        className: "bg-green-100 text-green-800 border-green-200"
      },
      FALSO: {
        icon: "❌", 
        text: "INFORMAÇÃO FALSA",
        className: "bg-red-100 text-red-800 border-red-200"
      },
      PARCIALMENTE_VERDADEIRO: {
        icon: "⚠️",
        text: "PARCIALMENTE VERDADEIRA", 
        className: "bg-orange-100 text-orange-800 border-orange-200"
      },
      NAO_VERIFICAVEL: {
        icon: "❓",
        text: "NÃO VERIFICÁVEL",
        className: "bg-gray-100 text-gray-800 border-gray-200"
      }
    };

    const badge = badges[classification];
    
    return (
      <div className={`inline-flex items-center px-8 py-4 rounded-full text-xl font-bold border-2 ${badge.className}`} data-testid={`badge-classification-${classification.toLowerCase()}`}>
        <span className="text-2xl mr-3">{badge.icon}</span>
        <span>{badge.text}</span>
      </div>
    );
  };

  const getConfidenceBadge = () => {
    const { confidence_percentage } = result;
    
    if (confidence_percentage >= 80) {
      return <Badge className="bg-green-100 text-green-800" data-testid="badge-confidence-high">Alta Confiança</Badge>;
    } else if (confidence_percentage >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800" data-testid="badge-confidence-medium">Média Confiança</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800" data-testid="badge-confidence-low">Baixa Confiança</Badge>;
    }
  };

  const getProgressColor = () => {
    const { confidence_percentage } = result;
    if (confidence_percentage >= 80) return "bg-green-500";
    if (confidence_percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Classification Badge */}
      <div className="text-center">
        {getClassificationBadge()}
      </div>

      {/* Detailed Analysis */}
      <Card className="p-6 md:p-8 space-y-8">
        {/* Confidence Level */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <span>Nível de Confiança da Análise</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground" data-testid="text-confidence-percentage">
                {result.confidence_percentage}% de confiança
              </span>
              {getConfidenceBadge()}
            </div>
            <div className="w-full">
              <Progress 
                value={result.confidence_percentage} 
                className="h-4"
                data-testid="progress-confidence"
              />
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <span className="text-2xl">📝</span>
            <span>Explicação Detalhada</span>
          </h3>
          <div className="prose prose-lg max-w-none">
            <p className="text-foreground leading-relaxed text-base" data-testid="text-explanation">
              {result.explanation}
            </p>
          </div>
        </div>

        {/* Additional Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <span className="text-xl">🗓️</span>
              <span>Contexto Temporal</span>
            </h4>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-temporal-context">
              {result.temporal_context}
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <span className="text-xl">⚖️</span>
              <span>Viés Detectado</span>
            </h4>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-detected-bias">
              {result.detected_bias}
            </p>
          </div>
        </div>

        {/* Political Bias Distribution */}
        {result.source_bias_distribution && result.total_sources && result.total_sources > 0 && (
          <SourceBiasDistribution 
            distribution={result.source_bias_distribution}
            totalSources={result.total_sources}
          />
        )}

        {/* Sources */}
        {result.sources && result.sources.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
              <span className="text-2xl">📚</span>
              <span>Fontes Consultadas</span>
            </h3>
            <div className="grid gap-4">
              {result.sources.map((source, index) => (
                <SourceCard key={index} source={source} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Important Notes */}
        {result.observations && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center space-x-2">
              <span className="text-xl">⚠️</span>
              <span>Observações Importantes</span>
            </h4>
            <p className="text-yellow-700 leading-relaxed" data-testid="text-observations">
              {result.observations}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
