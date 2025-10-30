import { ExternalLink, Building2, GraduationCap, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Source, PoliticalBias } from "@shared/schema";

interface SourceCardProps {
  source: Source;
  index: number;
}

const BIAS_CONFIG: Record<
  PoliticalBias,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  ESQUERDA: {
    label: "Esquerda",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  CENTRO: {
    label: "Centro",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  DIREITA: {
    label: "Direita",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  DESCONHECIDO: {
    label: "Não classificado",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-50 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
  },
};

function getSourceIcon(name: string, url?: string) {
  if (!url) return <Globe className="h-5 w-5" />;
  
  if (url.includes('.gov.br')) {
    return <Building2 className="h-5 w-5" />;
  }
  
  if (url.includes('.edu.br')) {
    return <GraduationCap className="h-5 w-5" />;
  }
  
  return <Globe className="h-5 w-5" />;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const bias = source.political_bias || "DESCONHECIDO";
  const config = BIAS_CONFIG[bias];
  const hasUrl = source.url && source.url.length > 0;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} transition-all hover:shadow-md`}
      data-testid={`source-card-${index}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Ícone */}
          <div className={`mt-1 ${config.color}`}>
            {getSourceIcon(source.name, source.url)}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                {source.name}
              </h4>
              <Badge
                variant="outline"
                className={`${config.color} ${config.borderColor} text-xs`}
                data-testid={`badge-bias-${bias.toLowerCase()}`}
              >
                {config.label}
              </Badge>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {source.description}
            </p>

            {source.year && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ano: {source.year}
              </p>
            )}
          </div>
        </div>

        {/* Link externo */}
        {hasUrl && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors group"
            data-testid={`link-source-${index}`}
            aria-label={`Abrir ${source.name} em nova aba`}
          >
            <ExternalLink className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </a>
        )}
      </div>
    </div>
  );
}
