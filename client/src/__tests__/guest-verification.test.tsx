import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import AuthPage from '../pages/auth-page';

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    verifyGuestContent: jest.fn(),
  }
}));

// Mock wouter
jest.mock('wouter', () => ({
  Redirect: jest.fn(() => null),
}));

// Mock auth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    loginMutation: { mutate: jest.fn(), isPending: false },
    registerMutation: { mutate: jest.fn(), isPending: false }
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Guest Verification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render guest verification section', () => {
    renderWithProviders(<AuthPage />);
    
    expect(screen.getByText('Teste Gratuito')).toBeInTheDocument();
    expect(screen.getByText(/Experimente agora! Verifique uma notícia sem precisar se cadastrar/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Exemplo: O Brasil é o maior país/)).toBeInTheDocument();
  });

  it('should disable submit button when content is too short', () => {
    renderWithProviders(<AuthPage />);
    
    const submitButton = screen.getByText('Testar Agora (Gratuito)');
    expect(submitButton).toBeDisabled();
    
    // Type short content
    const textarea = screen.getByPlaceholderText(/Exemplo: O Brasil é o maior país/);
    fireEvent.change(textarea, { target: { value: 'curto' } });
    
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when content is long enough', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);
    
    const textarea = screen.getByPlaceholderText(/Exemplo: O Brasil é o maior país/);
    const submitButton = screen.getByText('Testar Agora (Gratuito)');
    
    await user.type(textarea, 'Este é um conteúdo longo o suficiente para testar');
    
    expect(submitButton).not.toBeDisabled();
  });

  it('should show character count', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);
    
    const textarea = screen.getByPlaceholderText(/Exemplo: O Brasil é o maior país/);
    
    await user.type(textarea, 'Teste');
    
    expect(screen.getByText('5/1000')).toBeInTheDocument();
  });

  it('should call API when form is submitted', async () => {
    const mockApi = require('@/lib/api').api;
    mockApi.verifyGuestContent.mockResolvedValue({
      success: true,
      data: {
        classification: 'VERDADEIRO',
        confidence_percentage: 85,
        confidence_level: 'ALTO',
        explanation: 'Informação verificada como verdadeira',
        sources: []
      }
    });

    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);
    
    const textarea = screen.getByPlaceholderText(/Exemplo: O Brasil é o maior país/);
    const submitButton = screen.getByText('Testar Agora (Gratuito)');
    
    await user.type(textarea, 'O Brasil é o maior país da América do Sul');
    await user.click(submitButton);
    
    expect(mockApi.verifyGuestContent).toHaveBeenCalledWith('O Brasil é o maior país da América do Sul');
  });

  it('should show loading state during verification', async () => {
    const mockApi = require('@/lib/api').api;
    mockApi.verifyGuestContent.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);
    
    const textarea = screen.getByPlaceholderText(/Exemplo: O Brasil é o maior país/);
    const submitButton = screen.getByText('Testar Agora (Gratuito)');
    
    await user.type(textarea, 'Teste de verificação');
    await user.click(submitButton);
    
    expect(screen.getByText('Analisando...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analisando/ })).toBeDisabled();
  });

  it('should display results after successful verification', async () => {
    const mockApi = require('@/lib/api').api;
    mockApi.verifyGuestContent.mockResolvedValue({
      success: true,
      data: {
        classification: 'VERDADEIRO',
        confidence_percentage: 90,
        confidence_level: 'ALTO',
        explanation: 'Esta informação foi verificada como verdadeira',
        temporal_context: 'Atual',
        detected_bias: 'Nenhum viés detectado',
        sources: [
          { name: 'Fonte Confiável', description: 'Fonte oficial' }
        ]
      }
    });

    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);
    
    const textarea = screen.getByPlaceholderText(/Exemplo: O Brasil é o maior país/);
    const submitButton = screen.getByText('Testar Agora (Gratuito)');
    
    await user.type(textarea, 'Informação para testar');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Esta informação foi verificada como verdadeira/)).toBeInTheDocument();
    });
  });
});