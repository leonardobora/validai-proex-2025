import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useTheme, useSystemTheme } from '@/hooks/use-theme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, setTheme } = useTheme();
  const systemTheme = useSystemTheme();

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getCurrentIcon = () => {
    return theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-9 w-9 px-0 ${className}`}
          data-testid="theme-toggle"
          title={`Tema atual: ${theme === 'light' ? 'Claro' : 'Escuro'}`}
        >
          {getCurrentIcon()}
          {showLabel && (
            <span className="ml-2 hidden sm:inline">
              {theme === 'light' ? 'Claro' : 'Escuro'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="flex items-center space-x-2 cursor-pointer"
          data-testid="theme-light"
        >
          <Sun className="h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="flex items-center space-x-2 cursor-pointer"
          data-testid="theme-dark"
        >
          <Moon className="h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(systemTheme)}
          className="flex items-center space-x-2 cursor-pointer"
          data-testid="theme-system"
        >
          <Monitor className="h-4 w-4" />
          <span>Sistema ({systemTheme === 'dark' ? 'Escuro' : 'Claro'})</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Versão simplificada para toggle direto (sem dropdown)
export const SimpleThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      className={`h-9 w-9 px-0 ${className}`}
      data-testid="simple-theme-toggle"
      title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {showLabel && (
        <span className="ml-2 hidden sm:inline">
          {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        </span>
      )}
    </Button>
  );
};