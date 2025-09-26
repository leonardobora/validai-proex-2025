import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Shield, BarChart3, Settings, Crown, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalVerifications: number;
  totalRequests: number;
  tokenUsage: {
    totalTokens: number;
    totalCost: number;
    avgTokensPerRequest: number;
    requestsCount: number;
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/stats', { credentials: 'include' })
      ]);

      if (usersResponse.ok && statsResponse.ok) {
        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();
        
        setUsers(usersData.data);
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados admin:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados administrativos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      setUpdating(userId);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAdmin })
      });

      if (response.ok) {
        await fetchData(); // Reload data
        toast({
          title: 'Sucesso',
          description: `Usuário ${isAdmin ? 'promovido a' : 'removido de'} administrador`,
        });
      } else {
        throw new Error('Falha ao atualizar usuário');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do usuário',
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  // Redirect if not admin
  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Você não tem privilégios de administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-yellow-600" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">ValidaÍ Admin Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total de Usuários</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Administradores</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.totalAdmins}</p>
                    </div>
                    <Crown className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Verificações</p>
                      <p className="text-2xl font-bold text-green-900">{stats.totalVerifications}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Requisições</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalRequests}</p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Token Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card variant="elevated" className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">Tokens Processados</p>
                      <p className="text-2xl font-bold text-indigo-900">{stats.tokenUsage.totalTokens.toLocaleString()}</p>
                    </div>
                    <Settings className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600">Custo Total</p>
                      <p className="text-2xl font-bold text-emerald-900">${stats.tokenUsage.totalCost.toFixed(4)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-600">Tokens/Requisição</p>
                      <p className="text-2xl font-bold text-cyan-900">{stats.tokenUsage.avgTokensPerRequest}</p>
                    </div>
                    <Users className="h-8 w-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-rose-600">Req. com IA</p>
                      <p className="text-2xl font-bold text-rose-900">{stats.tokenUsage.requestsCount}</p>
                    </div>
                    <Crown className="h-8 w-8 text-rose-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Users Management */}
        <Card variant="elevated">
          <CardHeader>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Usuários
            </h2>
            <p className="text-muted-foreground">
              Visualize e gerencie privilégios administrativos dos usuários
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((userItem) => (
                <div
                  key={userItem.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {userItem.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{userItem.name}</h3>
                      <p className="text-sm text-muted-foreground">{userItem.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Membro desde {new Date(userItem.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={userItem.isAdmin ? "default" : "secondary"}
                      className={userItem.isAdmin ? "bg-yellow-100 text-yellow-800" : ""}
                    >
                      {userItem.isAdmin ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        'Usuário'
                      )}
                    </Badge>
                    
                    {userItem.id !== user?.id && (
                      <EnhancedButton
                        variant={userItem.isAdmin ? "danger" : "secondary"}
                        size="sm"
                        onClick={() => updateUserAdminStatus(userItem.id, !userItem.isAdmin)}
                        disabled={updating === userItem.id}
                      >
                        {updating === userItem.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : userItem.isAdmin ? (
                          <UserX className="h-3 w-3 mr-1" />
                        ) : (
                          <UserCheck className="h-3 w-3 mr-1" />
                        )}
                        {userItem.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                      </EnhancedButton>
                    )}
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}