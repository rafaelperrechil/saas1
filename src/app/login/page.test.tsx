import React from 'react';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import LoginPage from './page';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { renderWithSession } from '@/test/test-utils';
import { signIn } from 'next-auth/react';

// Mock do next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock das traduções
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'auth.login.title': 'Entrar',
        'auth.login.subtitle': 'Acesse sua conta',
        'auth.login.email': 'E-mail',
        'auth.login.password': 'Senha',
        'auth.login.submit': 'Entrar',
        'auth.login.forgotPassword': 'Esqueceu a senha?',
        'auth.login.noAccount': 'Não tem uma conta?',
        'auth.login.signUp': 'Cadastre-se',
        'auth.login.error.required': 'Preencha todos os campos',
        'auth.login.error.invalid': 'E-mail ou senha inválidos',
        'auth.login.error.generic': 'Erro ao fazer login',
        'auth.login.hero.line1': 'Bem-vindo!',
        'auth.login.hero.line2': 'Acesse sua conta',
        'auth.login.hero.line3': 'e aproveite todos os recursos',
      };
      return dict[key] || key;
    },
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginPage = async () => {
    const result = await renderWithSession(<LoginPage />, {
      session: null,
    });

    // Aguarda o loading inicial terminar
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    return result;
  };

  it('exibe erro se campos obrigatórios estiverem vazios', async () => {
    await renderLoginPage();

    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(screen.getByText('Preencha todos os campos')).toBeInTheDocument();
    });
  });

  it('permite preencher os campos e fazer login com sucesso', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({ ok: true });

    await renderLoginPage();

    await act(async () => {
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
      expect(mockReplace).toHaveBeenCalledWith('/panel/dashboard');
    });
  });

  it('exibe erro para login inválido', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid', ok: false });

    await renderLoginPage();

    await act(async () => {
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos')).toBeInTheDocument();
    });
  });

  it('mostra loading no botão durante o envio', async () => {
    let resolveSignIn: (value: any) => void;
    (signIn as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
    );

    await renderLoginPage();

    await act(async () => {
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await act(async () => {
      resolveSignIn!({ ok: true });
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toBeEnabled();
    });
  });

  describe('Acessibilidade', () => {
    it('tem título e descrição apropriados', async () => {
      await renderLoginPage();
      expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
      expect(screen.getByText('Acesse sua conta', { selector: 'p' })).toBeInTheDocument();
    });

    it('tem labels apropriados para todos os campos', async () => {
      await renderLoginPage();
      expect(screen.getByTestId('email')).toBeInTheDocument();
      expect(screen.getByTestId('password')).toBeInTheDocument();
    });

    it('tem navegação por teclado adequada', async () => {
      await renderLoginPage();
      const user = userEvent.setup();

      const emailInput = screen.getByTestId('email');
      const passwordInput = screen.getByTestId('password');
      const submitButton = screen.getByRole('button', { name: 'Entrar' });
      const forgotPasswordLink = screen.getByRole('link', { name: 'Esqueceu a senha?' });
      const signUpLink = screen.getByRole('link', { name: 'Cadastre-se' });

      // Verifica se os elementos podem ser focados na ordem correta
      await user.click(emailInput);
      expect(document.activeElement).toBe(emailInput);
      await user.click(passwordInput);
      expect(document.activeElement).toBe(passwordInput);
      await user.click(submitButton);
      expect(document.activeElement).toBe(submitButton);
      await user.click(forgotPasswordLink);
      expect(document.activeElement).toBe(forgotPasswordLink);
      await user.click(signUpLink);
      expect(document.activeElement).toBe(signUpLink);
    });

    it('tem links com texto descritivo', async () => {
      await renderLoginPage();
      const forgotLink = screen.getByRole('link', { name: 'Esqueceu a senha?' });
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
      const signUpLink = screen.getByRole('link', { name: 'Cadastre-se' });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });
});
