import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Share2, MessageCircle } from 'lucide-react';
import type { VerificationResult } from '@shared/schema';

interface ShareButtonProps {
  variant?: 'app' | 'result';
  result?: VerificationResult;
  content?: string;
  className?: string;
}

const getShareText = (variant: 'app' | 'result', result?: VerificationResult, content?: string) => {
  const getAppUrl = () => {
    // Use production URL if localhost, otherwise use current origin
    const currentOrigin = window.location.origin;
    return currentOrigin.includes('localhost') ? 'https://validai.app' : currentOrigin;
  };

  if (variant === 'app') {
    return `🛡️ *ValidaÍ* - Verificador de Notícias com IA

✅ Combate desinformação automaticamente
🎯 Análise baseada em múltiplas fontes
📱 Teste gratuito disponível

Acesse: ${getAppUrl()}

#ValidaÍ #CombateDesinformação`;
  }

  if (variant === 'result' && result && content) {
    const classificationEmoji = {
      'VERDADEIRO': '✅',
      'FALSO': '❌', 
      'PARCIALMENTE_VERDADEIRO': '⚠️',
      'NAO_VERIFICAVEL': '❓'
    };

    const confidenceText = result.confidence_level === 'ALTO' ? 'Alta' : 
                          result.confidence_level === 'MEDIO' ? 'Média' : 'Baixa';

    // Shorter, more focused message
    return `🛡️ *ValidaÍ - Verificação*

"${content.length > 80 ? content.substring(0, 80) + '...' : content}"

${classificationEmoji[result.classification]} *${result.classification}*
📊 Confiança: ${result.confidence_percentage}% (${confidenceText})

${result.explanation.length > 120 ? result.explanation.substring(0, 120) + '...' : result.explanation}

Verifique suas notícias: ${getAppUrl()}

#ValidaÍ #FactCheck`;
  }

  return '';
};

const shareToWhatsApp = (text: string) => {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
};

export const ShareButton: React.FC<ShareButtonProps> = ({
  variant = 'app',
  result,
  content,
  className
}) => {
  const handleShare = () => {
    const shareText = getShareText(variant, result, content);
    shareToWhatsApp(shareText);
  };

  if (variant === 'app') {
    return (
      <EnhancedButton
        onClick={handleShare}
        variant="secondary"
        size="md"
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        Compartilhar no WhatsApp
      </EnhancedButton>
    );
  }

  if (variant === 'result') {
    return (
      <EnhancedButton
        onClick={handleShare}
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 ${className}`}
      >
        <Share2 className="h-4 w-4" />
        Compartilhar Resultado
      </EnhancedButton>
    );
  }

  return null;
};