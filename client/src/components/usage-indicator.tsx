import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

interface UsageIndicatorProps {
  className?: string;
}

export function UsageIndicator({ className = "" }: UsageIndicatorProps) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["usage"],
    queryFn: api.getUsage,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-500">Carregando...</span>
      </div>
    );
  }

  if (error || !response?.success) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 ${className}`}>
              <AlertCircle className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Uso diário</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Erro ao carregar informações de uso</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const usage = response.data;
  const { remaining, limit } = usage;

  // Determine color based on remaining verifications
  const getVariant = (): "default" | "secondary" | "destructive" => {
    if (remaining > 6) return "default"; // Green
    if (remaining >= 3) return "secondary"; // Yellow  
    return "destructive"; // Red
  };

  const getIndicatorColor = () => {
    if (remaining > 6) return "bg-green-500";
    if (remaining >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getMessage = () => {
    if (remaining === 0) return "Limite diário atingido";
    if (remaining === 1) return `${remaining} consulta restante`;
    return `${remaining} consultas restantes`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${getIndicatorColor()}`} />
            <Badge variant={getVariant()} className="text-xs font-medium">
              {remaining}/{limit}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-center">
            <p className="font-medium">{getMessage()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Limite diário: {limit} verificações
            </p>
            {remaining <= 3 && remaining > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Poucas consultas restantes
              </p>
            )}
            {remaining === 0 && (
              <p className="text-xs text-red-600 mt-1">
                🚫 Limite diário atingido
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}