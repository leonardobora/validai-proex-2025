import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SourceBiasDistribution as BiasDistribution } from "@shared/schema";

interface SourceBiasDistributionProps {
  distribution: BiasDistribution;
  totalSources: number;
}

export function SourceBiasDistribution({ distribution, totalSources }: SourceBiasDistributionProps) {
  const { esquerda, centro, direita, desconhecido } = distribution;

  // Só mostra a distribuição se houver fontes identificadas
  const hasIdentifiedSources = esquerda + centro + direita > 0;

  if (!hasIdentifiedSources) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="bias-distribution">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Espectro Político das Fontes
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                data-testid="tooltip-bias-info"
              >
                <Info className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-4">
              <p className="text-sm">
                Esta visualização mostra a distribuição política dos veículos de comunicação que foram usados como fonte nesta verificação. 
                A classificação é baseada na linha editorial histórica de cada veículo.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {totalSources} {totalSources === 1 ? 'fonte consultada' : 'fontes consultadas'}
        </p>

        {/* Barra de distribuição estilo Ground News */}
        <div className="w-full h-8 flex rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          {/* Esquerda */}
          {esquerda > 0 && (
            <div
              className="bg-red-400 dark:bg-red-500 flex items-center justify-center text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ width: `${esquerda}%` }}
              data-testid="bar-esquerda"
            >
              {esquerda >= 15 && `${esquerda}%`}
            </div>
          )}

          {/* Centro */}
          {centro > 0 && (
            <div
              className="bg-blue-400 dark:bg-blue-500 flex items-center justify-center text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ width: `${centro}%` }}
              data-testid="bar-centro"
            >
              {centro >= 15 && `${centro}%`}
            </div>
          )}

          {/* Direita */}
          {direita > 0 && (
            <div
              className="bg-yellow-500 dark:bg-yellow-600 flex items-center justify-center text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ width: `${direita}%` }}
              data-testid="bar-direita"
            >
              {direita >= 15 && `${direita}%`}
            </div>
          )}

          {/* Desconhecido (se houver) */}
          {desconhecido > 0 && (
            <div
              className="bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-sm font-semibold transition-all hover:opacity-90"
              style={{ width: `${desconhecido}%` }}
              data-testid="bar-desconhecido"
            >
              {desconhecido >= 15 && `${desconhecido}%`}
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 text-sm mt-4">
          {esquerda > 0 && (
            <div className="flex items-center gap-2" data-testid="legend-esquerda">
              <div className="w-4 h-4 bg-red-400 dark:bg-red-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Esquerda: {esquerda}%
              </span>
            </div>
          )}

          {centro > 0 && (
            <div className="flex items-center gap-2" data-testid="legend-centro">
              <div className="w-4 h-4 bg-blue-400 dark:bg-blue-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Centro: {centro}%
              </span>
            </div>
          )}

          {direita > 0 && (
            <div className="flex items-center gap-2" data-testid="legend-direita">
              <div className="w-4 h-4 bg-yellow-500 dark:bg-yellow-600 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Direita: {direita}%
              </span>
            </div>
          )}

          {desconhecido > 0 && (
            <div className="flex items-center gap-2" data-testid="legend-desconhecido">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Desconhecido: {desconhecido}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Explicação educativa */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          O que significa "viés político da fonte"?
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Cada veículo de comunicação tem uma linha editorial que tende para a esquerda, centro ou direita do espectro político. 
          Isso NÃO significa que a notícia é falsa ou verdadeira - apenas mostra a diversidade de perspectivas das fontes consultadas.
          Uma boa verificação geralmente usa fontes de diferentes vieses políticos.
        </p>
      </div>
    </div>
  );
}
