import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { VerificationRequest } from "@shared/schema";

interface VerificationFormProps {
  onSubmit: (request: VerificationRequest) => void;
  isLoading: boolean;
}

export function VerificationForm({ onSubmit, isLoading }: VerificationFormProps) {
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [textContent, setTextContent] = useState("");
  const [urlContent, setUrlContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: VerificationRequest = {
      inputType,
      content: inputType === "text" ? textContent : "",
      url: inputType === "url" ? urlContent : undefined
    };

    onSubmit(request);
  };

  const isDisabled = isLoading || 
    (inputType === "text" && !textContent.trim()) || 
    (inputType === "url" && !urlContent.trim());

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Type Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Como você quer verificar?</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={inputType === "text" ? "default" : "secondary"}
              onClick={() => setInputType("text")}
              className="p-4 h-auto font-medium"
              data-testid="button-select-text"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">📝</span>
                <span>Colar Texto</span>
              </div>
            </Button>
            <Button
              type="button"
              variant={inputType === "url" ? "default" : "secondary"}
              onClick={() => setInputType("url")}
              className="p-4 h-auto font-medium"
              data-testid="button-select-url"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">🔗</span>
                <span>Link da Notícia</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Text Input */}
        {inputType === "text" && (
          <div className="space-y-3">
            <label htmlFor="textInput" className="block text-base font-medium text-foreground">
              Cole aqui o texto da notícia
            </label>
            <Textarea
              id="textInput"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Cole aqui o texto completo da notícia que você quer verificar. Quanto mais completo, melhor será a análise..."
              className="min-h-32 resize-y text-base"
              maxLength={10000}
              data-testid="input-text-content"
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>💡 Dica: Inclua título, subtítulo e texto principal</span>
              <span data-testid="text-character-count">{textContent.length}/10.000 caracteres</span>
            </div>
          </div>
        )}

        {/* URL Input */}
        {inputType === "url" && (
          <div className="space-y-3">
            <label htmlFor="urlInput" className="block text-base font-medium text-foreground">
              Link da notícia para verificar
            </label>
            <Input
              type="url"
              id="urlInput"
              value={urlContent}
              onChange={(e) => setUrlContent(e.target.value)}
              placeholder="https://exemplo.com/noticia"
              className="text-base"
              data-testid="input-url-content"
            />
            <p className="text-sm text-muted-foreground">
              💡 Dica: Cole o link completo da página da notícia
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isDisabled}
          className="w-full font-semibold py-4 px-6 text-lg h-auto"
          data-testid="button-verify-submit"
        >
          {isLoading ? (
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Analisando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔍</span>
              <span>Verificar Agora</span>
            </div>
          )}
        </Button>
      </form>
    </Card>
  );
}
