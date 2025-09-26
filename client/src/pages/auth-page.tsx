import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card as EnhancedCard, CardContent as EnhancedCardContent, CardHeader as EnhancedCardHeader } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput, EnhancedTextarea } from "@/components/ui/enhanced-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, CheckCircle, Users, TrendingUp, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { VerificationResults } from "@/components/verification-results";
import { ShareButton } from "@/components/share-button";
import { api } from "@/lib/api";
import type { VerificationResult } from "@shared/schema";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Registration form schema
const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// Guest verification component
function GuestVerification() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  const guestVerifyMutation = useMutation({
    mutationFn: api.verifyGuestContent,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setResult(response.data);
        // Show signup dialog after successful test
        setTimeout(() => setShowSignupDialog(true), 2000);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) return;
    
    setResult(null);
    guestVerifyMutation.mutate(content.trim());
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <EnhancedTextarea
            label="Cole aqui o texto da notícia para verificar"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Exemplo: O Brasil é o maior país da América do Sul em território..."
            className="border-blue-200"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-blue-600 font-medium">
              💡 Teste gratuito: apenas verificação de texto
            </span>
            <span className={`text-xs font-medium ${
              content.length < 10 ? 'text-red-500' : 'text-blue-600'
            }`}>
              {content.length}/1000
            </span>
          </div>
        </div>
        
        <EnhancedButton 
          type="submit" 
          disabled={content.trim().length < 10 || guestVerifyMutation.isPending}
          variant="primary"
          size="lg"
          className="w-full"
        >
            {guestVerifyMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Testar Agora (Gratuito)
            </>
          )}
        </EnhancedButton>
        
        {guestVerifyMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao processar verificação. Tente novamente.
            </AlertDescription>
          </Alert>
        )}
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-white dark:bg-gray-950">
          <VerificationResults result={result} originalContent={content} />
        </div>
      )}

      {/* Signup Incentive Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Teste Concluído!
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Gostou do ValidaÍ? Crie sua conta gratuita para acessar:</p>
              <ul className="text-sm space-y-1 text-left">
                <li>✅ Verificação de URLs de notícias</li>
                <li>✅ Histórico completo de verificações</li>
                <li>✅ 10 verificações por dia</li>
                <li>✅ Fontes detalhadas e confiáveis</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowSignupDialog(false)}
              className="flex-1"
            >
              Mais Tarde
            </Button>
            <Button 
              onClick={() => {
                setShowSignupDialog(false);
                // Focus on register tab
                (document.querySelector('[data-testid="tab-register"]') as HTMLElement)?.click();
              }}
              className="flex-1"
            >
              Criar Conta
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero/Branding Section */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 text-3xl lg:text-4xl font-bold text-white mb-6">
            <Shield className="h-10 w-10 lg:h-12 lg:w-12" />
            ValidaÍ
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Combata a desinformação com
            <span className="text-blue-200 block"> inteligência artificial</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed">
            Sistema avançado de verificação de notícias usando IA para distinguir 
            fatos de fake news com explicações claras e fontes confiáveis.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <span className="text-blue-100">Análise automática com IA avançada</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-300 flex-shrink-0" />
              <span className="text-blue-100">Histórico pessoal de verificações</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-300 flex-shrink-0" />
              <span className="text-blue-100">Múltiplas fontes confiáveis</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm text-blue-100">
                <span className="font-semibold text-white">Projeto acadêmico UniBrasil</span><br/>
                PROEX IV – Inteligência Artificial Aplicada 2025
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <ShareButton variant="app" className="bg-white/20 hover:bg-white/30 text-white border-white/30" />
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <ArrowRight className="h-4 w-4" />
                <span>Ajude a democratizar o acesso à informação</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Authentication Forms */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Header for mobile */}
          <div className="text-center lg:hidden">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bem-vindo ao ValidaÍ
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Faça login ou teste gratuitamente
            </p>
          </div>

          {/* Guest Verification Section */}
          <EnhancedCard variant="elevated" className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
            <EnhancedCardHeader className="border-blue-200/30">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Teste Gratuito</h2>
              </div>
              <p className="text-gray-600 mt-2 leading-relaxed">
                Experimente agora! Verifique uma notícia sem precisar se cadastrar.
              </p>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <GuestVerification />
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                ou acesse sua conta
              </span>
            </div>
          </div>

          {/* Authentication Forms */}
          <EnhancedCard variant="elevated" className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300/50" data-testid="auth-forms-container">
            <EnhancedCardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="tab-login" className="font-medium">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register" className="font-medium">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4 mt-0">
                  <div className="space-y-2 text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Entrar na sua conta
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Acesse verificação de URLs e histórico completo
                    </p>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" data-testid="form-login">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="seu@email.com" 
                                className="h-11"
                                data-testid="input-login-email"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Senha</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Sua senha" 
                                className="h-11"
                                data-testid="input-login-password"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <EnhancedButton 
                        type="submit" 
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login-submit"
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          "Entrar"
                        )}
                      </EnhancedButton>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4 mt-0">
                  <div className="space-y-2 text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Criar nova conta
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Junte-se ao ValidaÍ gratuitamente
                    </p>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4" data-testid="form-register">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Nome completo</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                placeholder="Seu nome completo" 
                                className="h-11"
                                data-testid="input-register-name"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="seu@email.com" 
                                className="h-11"
                                data-testid="input-register-email"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Senha</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Mínimo 6 caracteres" 
                                className="h-11"
                                data-testid="input-register-password"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <EnhancedButton 
                        type="submit" 
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-register-submit"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          "Criar Conta"
                        )}
                      </EnhancedButton>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}