import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Wizard from '@/components/wizard/Wizard';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { nicheService } from '@/services';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock do serviço de nichos para garantir array sempre
jest.mock('@/services', () => ({
  nicheService: {
    getNiches: jest.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Saúde' },
      ],
    }),
  },
}));

describe('Wizard', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSession = {
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue(mockSession);
    jest.clearAllMocks();
  });

  it('deve redirecionar para dashboard se wizard já foi completado', async () => {
    (useSession as jest.Mock).mockReturnValue({
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          wizardCompleted: true,
        },
      },
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith('/panel/dashboard');
      },
      { timeout: 3000 }
    );
  });

  it('deve carregar os passos do wizard quando não completado', async () => {
    (useSession as jest.Mock).mockReturnValue({
      ...mockSession,
      data: {
        ...mockSession.data,
        wizardCompleted: false,
      },
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao assistente de configuração')).toBeInTheDocument();
    });
  });

  it('deve mostrar tela de carregamento durante a verificação', () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'loading',
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('deve lidar com erro ao carregar dados', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'error',
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });
});
