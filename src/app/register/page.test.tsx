import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import RegisterPage from './page';
import '@testing-library/jest-dom';
import { renderWithSession } from '@/test/test-utils';
import { signIn } from 'next-auth/react';
import { authService } from '@/services/auth.service';

// Mock do next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock do next-auth/react
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    __esModule: true,
    ...originalModule,
    useSession: () => ({ data: null, status: 'unauthenticated' }),
    signIn: jest.fn(),
  };
});

// Mock das traduções
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.register.error.required': 'Preencha todos os campos',
        'auth.register.error.passwordMismatch': 'Senhas não coincidem',
        'auth.register.error.invalidEmail': 'Email inválido',
        'auth.register.error.emailExists': 'Email já cadastrado',
        'auth.register.error.generic': 'Erro ao criar conta',
        'auth.register.error.checkEmail': 'Erro ao verificar email',
        'auth.register.submit': 'Cadastrar',
        'auth.register.name': 'Nome',
        'auth.register.email': 'E-mail',
        'auth.register.password': 'Senha',
        'auth.register.confirmPassword': 'Confirmar senha',
        'auth.register.title': 'Criar conta',
        'auth.register.subtitle': 'Preencha os dados abaixo para criar sua conta',
        'auth.register.alreadyHaveAccount': 'Já tem uma conta?',
        'auth.register.signIn': 'Faça login',
      };
      return translations[key] || key;
    },
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock) = jest.fn();
  });

  const renderRegisterPage = async () => {
    const result = await renderWithSession(<RegisterPage />, {
      session: null,
    });

    // Aguarda o loading inicial terminar
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Aguarda o formulário ser renderizado
    await waitFor(() => {
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
    });

    return result;
  };

  const fillForm = async (customValues = {}) => {
    const defaultValues = {
      name: 'Usuário Teste',
      email: 'teste@email.com',
      password: '123456',
      confirmPassword: '123456',
      ...customValues,
    };

    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: defaultValues.name },
      });
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: defaultValues.email },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: defaultValues.password },
      });
      fireEvent.change(screen.getByTestId('confirmPassword'), {
        target: { value: defaultValues.confirmPassword },
      });
    });
  };

  it('exibe erro se campos obrigatórios estiverem vazios', async () => {
    await renderRegisterPage();

    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Preencha todos os campos')).toBeInTheDocument();
    });
  });

  it('exibe erro quando o email já está cadastrado', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ exists: true }),
      })
    );

    await renderRegisterPage();
    await fillForm();

    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(screen.getAllByText('Email já cadastrado').length).toBeGreaterThan(0);
      expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));
    });
  });

  it('exibe erro se as senhas não coincidirem', async () => {
    await renderRegisterPage();
    await fillForm({ confirmPassword: 'diferente' });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('exibe erro se o email for inválido', async () => {
    await renderRegisterPage();
    await fillForm({ email: 'emailinvalido' });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('registra com sucesso e redireciona', async () => {
    // Mockar authService.register e authService.login para simular sucesso
    jest.spyOn(authService, 'register').mockResolvedValue({ data: { success: true } });
    jest.spyOn(authService, 'login').mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'teste@email.com',
          name: 'Usuário Teste',
          profile: null
        }
      }
    });
    jest.spyOn(authService, 'checkEmail').mockResolvedValue({ data: { exists: false } });

    await renderRegisterPage();
    await fillForm();

    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(authService.checkEmail).toHaveBeenCalledWith('teste@email.com');
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Usuário Teste',
        email: 'teste@email.com',
        password: '123456',
        confirmPassword: '123456'
      });
      expect(authService.login).toHaveBeenCalledWith({
        email: 'teste@email.com',
        password: '123456'
      });
      expect(mockRouter.replace).toHaveBeenCalledWith('/panel/dashboard');
    });
  });

  it('exibe erro quando o registro falha', async () => {
    // Mockar authService para simular erro
    jest.spyOn(authService, 'checkEmail').mockResolvedValue({ data: { exists: false } });
    jest.spyOn(authService, 'register').mockResolvedValue({ 
      error: 'Erro ao criar conta',
      data: { success: false }
    });

    await renderRegisterPage();
    await fillForm();

    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Erro ao criar conta')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('tem título e descrição apropriados', async () => {
      await renderRegisterPage();
      expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
      expect(screen.getByText(/preencha os dados abaixo para criar sua conta/i)).toBeInTheDocument();
    });

    it('tem labels apropriados para todos os campos', async () => {
      await renderRegisterPage();
      expect(screen.getByTestId('name')).toBeInTheDocument();
      expect(screen.getByTestId('email')).toBeInTheDocument();
      expect(screen.getByTestId('password')).toBeInTheDocument();
      expect(screen.getByTestId('confirmPassword')).toBeInTheDocument();
    });

    it('tem links com texto descritivo', async () => {
      await renderRegisterPage();
      const loginLink = screen.getByRole('link', { name: /faça login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});
