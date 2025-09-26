import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ExternalLink, TrendingUp, Clock, Newspaper } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category: 'futebol' | 'politica' | 'tecnologia' | 'geral';
}

interface TrendingNewsSidebarProps {
  className?: string;
}

// API function to fetch Brazilian news
async function fetchBrazilianNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      console.error('Failed to fetch news:', data.error);
      return getMockNews();
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockNews();
  }
}

// Fallback mock news
function getMockNews(): NewsItem[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return [
    {
      id: '1',
      title: 'Flamengo vence clássico brasileiro no Maracanã',
      description: 'Partida histórica marca a rodada do Campeonato Brasileiro',
      url: undefined,
      publishedAt: `${today}T${String(now.getHours()-1).padStart(2, '0')}:30:00Z`,
      source: { name: 'Globo Esporte' },
      category: 'futebol'
    },
    {
      id: '2',
      title: 'Startup brasileira cria solução inovadora de IA',
      description: 'Nova tecnologia desenvolvida no país para fact-checking',
      url: undefined,
      publishedAt: `${today}T${String(now.getHours()-2).padStart(2, '0')}:15:00Z`,
      source: { name: 'TechCrunch Brasil' },
      category: 'tecnologia'
    },
    {
      id: '3',
      title: 'Congresso aprova nova medida econômica',
      description: 'Projeto de lei tem impacto direto na economia brasileira',
      url: undefined,
      publishedAt: `${today}T${String(now.getHours()-3).padStart(2, '0')}:00:00Z`,
      source: { name: 'Folha de S.Paulo' },
      category: 'politica'
    },
    {
      id: '4',
      title: 'Brasil lidera ranking de energias renováveis',
      description: 'País se destaca em investimentos sustentáveis na região',
      url: undefined,
      publishedAt: `${today}T${String(now.getHours()-4).padStart(2, '0')}:45:00Z`,
      source: { name: 'Estado de S.Paulo' },
      category: 'geral'
    }
  ];
}

const getCategoryColor = (category: NewsItem['category']) => {
  switch (category) {
    case 'futebol':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'politica':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'tecnologia':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'geral':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getCategoryLabel = (category: NewsItem['category']) => {
  switch (category) {
    case 'futebol':
      return '⚽ Futebol';
    case 'politica':
      return '🏛️ Política';
    case 'tecnologia':
      return '💻 Tecnologia';
    case 'geral':
      return '📰 Geral';
    default:
      return '📰 Notícias';
  }
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const publishedDate = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Agora';
  if (diffInHours === 1) return '1 hora atrás';
  if (diffInHours < 24) return `${diffInHours} horas atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 dia atrás';
  return `${diffInDays} dias atrás`;
};

export const TrendingNewsSidebar: React.FC<TrendingNewsSidebarProps> = ({ className }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const newsData = await fetchBrazilianNews();
        setNews(newsData);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar notícias');
        setNews(getMockNews()); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) {
    return (
      <Card className={`w-80 h-fit ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-red-600" />
            Trending Brasil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const isDesktop = !className?.includes('w-full');

  return (
    <Card className={`shadow-lg border ${className?.includes('w-full') ? 'w-full' : 'w-80'} h-fit ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-red-600" />
          Trending Brasil
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className={isDesktop ? "h-[600px]" : "h-[400px]"}>
          <div className={isDesktop ? "space-y-0" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"}>
            {news.map((item, index) => (
              <React.Fragment key={item.id}>
                <div 
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (item.url) {
                      window.open(item.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <div className="space-y-2">
                    {/* Category Badge */}
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(item.category)}`}
                    >
                      {getCategoryLabel(item.category)}
                    </Badge>
                    
                    {/* Title */}
                    <h3 className="font-medium text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Newspaper className="h-3 w-3" />
                        <span className="truncate max-w-20">{item.source.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(item.publishedAt)}</span>
                      </div>
                      
                      {item.url && (
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                </div>
                
                {(isDesktop || (index < news.length - 1 && (index + 1) % (isDesktop ? 1 : 3) === 0)) && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-3 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            📰 Principais notícias do Brasil
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingNewsSidebar;