/**
 * ValidaÍ Design System
 * Tokens de design consistentes para toda a aplicação
 */

export const designTokens = {
  // Cores principais
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Azul principal
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    }
  },

  // Bordas arredondadas
  borderRadius: {
    none: '0',
    sm: '0.375rem',    // 6px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.5rem',   // 24px
    '3xl': '2rem',     // 32px
    full: '9999px'
  },

  // Sombras para profundidade
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  },

  // Espaçamentos
  spacing: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },

  // Tipografia
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }]
  }
} as const;

// Classes utilitárias para glassmorphism
export const glassStyles = {
  card: 'backdrop-blur-sm bg-white/10 border border-white/20',
  modal: 'backdrop-blur-md bg-white/95 border border-white/30',
  button: 'backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20',
  input: 'backdrop-blur-sm bg-white/5 border border-white/10 focus:border-white/30'
} as const;

// Classes CSS para componentes consistentes
export const componentClasses = {
  card: {
    base: 'rounded-2xl shadow-lg border border-border bg-card text-card-foreground',
    elevated: 'rounded-2xl shadow-xl border border-border bg-card text-card-foreground',
    glass: `rounded-2xl shadow-glass ${glassStyles.card}`
  },
  button: {
    primary: 'rounded-xl px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 border border-primary/20',
    secondary: 'rounded-xl px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 border border-border',
    ghost: 'rounded-xl px-6 py-3 bg-transparent hover:bg-accent text-foreground font-semibold transition-all duration-200 border border-transparent hover:border-border',
    danger: 'rounded-xl px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 border border-destructive/20'
  },
  input: {
    base: 'rounded-xl px-4 py-3 border border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 shadow-sm',
    error: 'rounded-xl px-4 py-3 border border-destructive bg-destructive/5 text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20 transition-all duration-200 shadow-sm'
  },
  modal: {
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm',
    content: 'rounded-3xl shadow-2xl border border-gray-200/50 bg-white max-h-[90vh] overflow-y-auto'
  }
} as const;