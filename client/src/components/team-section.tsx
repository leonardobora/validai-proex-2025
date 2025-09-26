import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ExternalLink, Users, Github, Linkedin, GraduationCap } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Leonardo Bora',
    role: 'Arquiteto de IA',
    linkedin: 'https://linkedin.com/in/leonardobora',
    github: 'https://github.com/leonardobora',
    avatar: 'LB',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 2,
    name: 'Luan Constancio',
    role: 'QA Engineer',
    linkedin: 'https://www.linkedin.com/in/luanconstancio/',
    avatar: 'LC',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 3,
    name: 'Matheus Leite',
    role: 'Frontend & Designer',
    linkedin: 'https://www.linkedin.com/in/matheusleite1337/',
    avatar: 'ML',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 4,
    name: 'João Vitor Soares',
    role: 'Full-Stack Developer',
    linkedin: 'https://www.linkedin.com/in/joão-vitor-soares-da-silva-756229230/',
    avatar: 'JV',
    gradient: 'from-orange-500 to-red-600'
  }
];

interface TeamSectionProps {
  showHeader?: boolean;
  className?: string;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ 
  showHeader = true, 
  className = '' 
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {showHeader && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Nossa Equipe</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Conheça os desenvolvedores por trás do ValidaÍ, estudantes da UniBrasil 
            dedicados a combater a desinformação através da tecnologia.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <GraduationCap className="h-4 w-4" />
            <span>PROEX IV – Inteligência Artificial Aplicada 2025</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} variant="elevated" className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="border-b-0 pb-4">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">{member.avatar}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-sm font-semibold text-blue-600">{member.role}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(member.linkedin, '_blank')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </EnhancedButton>
                
                {member.github && (
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(member.github, '_blank')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </EnhancedButton>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <Card variant="base" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 inline-block">
          <CardContent className="py-6 px-8">
            <div className="flex items-center gap-3 text-blue-700">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">V</span>
              </div>
              <div>
                <p className="font-semibold text-lg">ValidaÍ</p>
                <p className="text-sm text-blue-600">Combatendo desinformação com IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};