import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import RegisterPage from './page';
import '@testing-library/jest-dom';
import { renderWithSession } from '@/test/test-utils';
import { signIn } from 'next-auth/react';

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
      };
      return translations[key] || key;
    },
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const renderRegisterPage = async () => {
    const result = await renderWithSession(<RegisterPage />, {
      session: null,
    });

    // Aguarda o loading inicial terminar
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
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
      fireEvent.submit(screen.getByRole('form'));
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
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Email já cadastrado')).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));
    });
  });

  it('exibe erro se as senhas não coincidirem', async () => {
    await renderRegisterPage();
    await fillForm({ confirmPassword: 'diferente' });

    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('exibe erro se o email for inválido', async () => {
    await renderRegisterPage();
    await fillForm({ email: 'emailinvalido' });

    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('registra com sucesso e redireciona', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ exists: false }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

    (signIn as jest.Mock).mockResolvedValueOnce({ ok: true });

    await renderRegisterPage();
    await fillForm();

    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
      expect(signIn).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/panel/dashboard');
    });
  });

  it('exibe erro quando o registro falha', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ exists: false }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'Erro ao criar conta' }),
        })
      );

    await renderRegisterPage();
    await fillForm();

    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Erro ao criar conta')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('tem título e descrição apropriados', async () => {
      await renderRegisterPage();
      expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeInTheDocument();
      expect(screen.getByText('Preencha os dados abaixo para criar sua conta')).toBeInTheDocument();
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
      const loginLink = screen.getByRole('link', { name: 'auth.register.signIn' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});
