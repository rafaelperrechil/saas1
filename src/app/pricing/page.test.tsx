import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import PricingPage from './page';
import { planService } from '@/services';
import { I18nextProvider } from 'react-i18next';

// Mock do next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock do planService
jest.mock('@/services', () => ({
  planService: {
    getPlans: jest.fn(),
    getCurrentPlan: jest.fn(),
    createCheckoutSession: jest.fn(),
  },
}));

// Mock do router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock do fetch global
global.fetch = jest.fn();

// Mock do window.location
const mockLocation = {
  href: 'http://localhost/',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Suprimir erros de console
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock do i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pricing.title': 'Escolha o plano ideal para manter seu negocio sob controle total!',
        'pricing.subtitle': 'Checklists automatizados, inpeções organizadas e operação impecável.',
        'pricing.perMonth': '/mês',
        'pricing.currentPlan': 'Plano Atual',
        'pricing.includedUnits': 'Unidades inclusas',
        'pricing.maxUsers': 'Usuários',
        'pricing.maxChecklists': 'Checklists',
        'pricing.extraUserPrice': 'Preço por usuário extra',
        'pricing.extraUnitPrice': 'Preço por unidade extra',
        'pricing.signInToGetStarted': 'Entre para começar',
        'pricing.planActivated': 'Plano Ativado',
        'pricing.upgradeNow': 'Assinar Agora',
      };
      return translations[key] || key;
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PricingPage', () => {
  // Mock dos planos
  const mockPlans = [
    {
      id: '1',
      name: 'Plano Básico',
      price: 99.9,
      includedUnits: 1,
      maxUsers: 5,
      maxChecklists: 10,
      extraUserPrice: 19.9,
      extraUnitPrice: 29.9,
      isCustom: false,
    },
    {
      id: '2',
      name: 'Plano Pro',
      price: 199.9,
      includedUnits: 3,
      maxUsers: 10,
      maxChecklists: 20,
      extraUserPrice: 29.9,
      extraUnitPrice: 39.9,
      isCustom: false,
    },
  ];

  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlans),
    });
    (planService.getCurrentPlan as jest.Mock).mockResolvedValue({ data: null });
  });

  const renderWithI18n = (component: React.ReactNode) => {
    return render(component);
  };

  // Testes de Renderização Básica
  describe('Renderização Básica', () => {
    it('deve exibir o título principal', async () => {
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText(/Escolha o plano ideal/i)).toBeInTheDocument();
      });
    });

    it('deve exibir o subtítulo', async () => {
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText(/Checklists automatizados/i)).toBeInTheDocument();
      });
    });

    it('deve mostrar loading durante o carregamento', () => {
      renderWithI18n(<PricingPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('deve exibir mensagem de erro quando falhar', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar planos/i)).toBeInTheDocument();
      });
    });
  });

  // Testes de Carregamento de Planos
  describe('Carregamento de Planos', () => {
    it('deve carregar e exibir os planos corretamente', async () => {
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText('Plano Básico')).toBeInTheDocument();
        expect(screen.getByText('Plano Pro')).toBeInTheDocument();
      });
    });

    it('deve exibir detalhes do plano corretamente', async () => {
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText(/R\$\s*99[\.,]9[0-9]?/)).toBeInTheDocument();
        const unidadesInclusas = screen.getAllByText(/Unidades inclusas/);
        const usuarios = screen.getAllByText(/Usuários/);
        expect(unidadesInclusas.length).toBeGreaterThan(0);
        expect(usuarios.length).toBeGreaterThan(0);
      });
    });

    it('deve exibir preços extras quando disponíveis', async () => {
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const extraUserPrices = screen.getAllByText(/Preço por usuário extra/);
        const extraUnitPrices = screen.getAllByText(/Preço por unidade extra/);
        expect(extraUserPrices.length).toBeGreaterThan(0);
        expect(extraUnitPrices.length).toBeGreaterThan(0);
      });
    });

    it('deve exibir limites corretamente', async () => {
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const checklists = screen.getAllByText(/Checklists/);
        expect(checklists.length).toBeGreaterThan(0);
      });
    });
  });

  // Testes de Estado do Usuário
  describe('Estado do Usuário', () => {
    it('deve destacar o plano atual quando usuário está logado', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.getCurrentPlan as jest.Mock).mockResolvedValue({ data: mockPlans[0] });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText('Plano Atual')).toBeInTheDocument();
      });
    });

    it('deve exibir "Assinar Agora" para usuários não logados', async () => {
      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', {
          name: /Assinar Agora|Entre para começar/i,
        });
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('deve exibir "Plano Ativado" para o plano atual', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.getCurrentPlan as jest.Mock).mockResolvedValue({ data: mockPlans[0] });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText('Plano Ativado')).toBeInTheDocument();
      });
    });

    it('deve exibir "Upgrade" para planos superiores', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.getCurrentPlan as jest.Mock).mockResolvedValue({ data: mockPlans[0] });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        expect(screen.getByText('Assinar Agora')).toBeInTheDocument();
      });
    });
  });

  // Testes de Interação
  describe('Interação', () => {
    it('deve redirecionar para login quando não autenticado', async () => {
      const mockRouter = { push: jest.fn() };
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter);

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', {
          name: /Assinar Agora|Entre para começar/i,
        });
        fireEvent.click(buttons[0]);
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('deve iniciar checkout quando autenticado', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.createCheckoutSession as jest.Mock).mockResolvedValue({
        data: { url: 'https://stripe.com/checkout' },
      });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const buttons = screen.getAllByText('Assinar Agora');
        fireEvent.click(buttons[0]);
        expect(planService.createCheckoutSession).toHaveBeenCalled();
      });
    });

    it('deve desabilitar botão do plano atual', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.getCurrentPlan as jest.Mock).mockResolvedValue({ data: mockPlans[0] });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const button = screen.getByText('Plano Ativado').closest('button');
        expect(button).toBeDisabled();
      });
    });

    it('deve habilitar botões de upgrade', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.getCurrentPlan as jest.Mock).mockResolvedValue({ data: mockPlans[0] });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const button = screen.getByText('Assinar Agora').closest('button');
        expect(button).not.toBeDisabled();
      });
    });
  });

  // Testes de Integração com Stripe
  describe('Integração com Stripe', () => {
    it('deve criar sessão de checkout corretamente', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.createCheckoutSession as jest.Mock).mockResolvedValue({
        data: { url: 'https://stripe.com/checkout' },
      });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const buttons = screen.getAllByText('Assinar Agora');
        fireEvent.click(buttons[0]);
        expect(planService.createCheckoutSession).toHaveBeenCalledWith(expect.any(String));
      });
    });

    it('deve enviar metadados corretos para o Stripe', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.createCheckoutSession as jest.Mock).mockResolvedValue({
        data: { url: 'https://stripe.com/checkout' },
      });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const buttons = screen.getAllByText('Assinar Agora');
        fireEvent.click(buttons[0]);
        expect(planService.createCheckoutSession).toHaveBeenCalledWith('1');
      });
    });

    it('deve redirecionar para o Stripe após criar sessão', async () => {
      const mockUrl = 'https://stripe.com/checkout';
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.createCheckoutSession as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
      });

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const buttons = screen.getAllByText('Assinar Agora');
        fireEvent.click(buttons[0]);
        expect(mockLocation.href).toBe(mockUrl);
      });
    });

    it('deve tratar erro ao criar sessão do Stripe', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      });
      (planService.createCheckoutSession as jest.Mock).mockRejectedValue(new Error('Stripe Error'));

      renderWithI18n(<PricingPage />);
      await waitFor(() => {
        const buttons = screen.getAllByText('Assinar Agora');
        fireEvent.click(buttons[0]);
        expect(consoleSpy).toHaveBeenCalled();
      });
    });
  });
});
