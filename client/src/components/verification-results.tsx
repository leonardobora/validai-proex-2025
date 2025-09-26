import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import type { VerificationResult } from "@shared/schema";

interface VerificationResultsProps {
  result: VerificationResult;
  originalContent?: string;
}

export function VerificationResults({ result, originalContent }: VerificationResultsProps) {
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
      <div className="text-center space-y-4">
        {getClassificationBadge()}
        <div className="flex justify-center">
          <ShareButton 
            variant="result" 
            result={result} 
            content={originalContent}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          />
        </div>
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

        {/* Key Insights (Compact) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
            <span className="text-xl">🔍</span>
            <span>Principais Insights</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">🗓️</span>
                <div>
                  <h4 className="font-medium text-blue-800 text-sm">Contexto</h4>
                  <p className="text-blue-700 text-sm" data-testid="text-temporal-context">
                    {result.temporal_context?.substring(0, 100)}...
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="text-orange-600">⚖️</span>
                <div>
                  <h4 className="font-medium text-orange-800 text-sm">Viés</h4>
                  <p className="text-orange-700 text-sm" data-testid="text-detected-bias">
                    {result.detected_bias?.substring(0, 100)}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Sources */}
        {result.sources && result.sources.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="text-xl">📚</span>
                <span>Fontes Principais</span>
              </span>
              <Badge variant="secondary" className="text-xs">
                {result.sources.length} fonte{result.sources.length > 1 ? 's' : ''} consultada{result.sources.length > 1 ? 's' : ''}
              </Badge>
            </h3>
            <div className="grid gap-3">
              {result.sources.slice(0, 3).map((source, index) => (
                <div key={index} className="border border-border rounded-md p-3 hover:bg-gray-50 transition-colors" data-testid={`source-${index}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate" data-testid={`source-name-${index}`}>
                        {source.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1" data-testid={`source-description-${index}`}>
                        {source.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {source.year && (
                        <Badge variant="outline" className="text-xs" data-testid={`source-year-${index}`}>
                          {source.year}
                        </Badge>
                      )}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 p-1"
                          data-testid={`link-source-${index}`}
                          title="Acessar fonte"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {result.sources.length > 3 && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    +{result.sources.length - 3} fontes adicionais analisadas
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important Notes */}
        {result.observations && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center space-x-2 text-sm">
              <span>⚠️</span>
              <span>Observações</span>
            </h4>
            <p className="text-yellow-700 text-sm leading-relaxed" data-testid="text-observations">
              {result.observations}
            </p>
          </div>
        )}

        {/* System Attribution */}
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">
            ✨ Sistema ValidaÍ - Desenvolvido por{' '}
            <span className="font-medium">Leonardo Bora, João Soares, Luan Constancio e Matheus Leite</span>
            {' '}para UniBrasil 2025
          </p>
        </div>
      </Card>
    </div>
  );
}
