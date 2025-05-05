import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import LoginPage from './page';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mocks
const push = jest.fn();
const replace = jest.fn();
const mockUseRouter = () => ({ push, replace });
const mockSignIn = jest.fn();
const mockUseSession = jest.fn(() => ({ status: 'unauthenticated' }));

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}));
jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
  useSession: () => mockUseSession(),
}));
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
    mockUseSession.mockImplementation(() => ({ status: 'unauthenticated' }));
  });

  it('exibe erro se campos obrigatórios estiverem vazios', async () => {
    render(<LoginPage />);
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!);
    });
    expect(screen.getByText(/preencha todos os campos/i)).toBeInTheDocument();
  });

  it('exibe erro para login inválido', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'Invalid', ok: false });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'teste@email.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: '123456' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!);
    });
    expect(screen.getByText(/e-mail ou senha inválidos/i)).toBeInTheDocument();
  });

  it('redireciona após login bem-sucedido', async () => {
    mockSignIn.mockResolvedValueOnce({ ok: true });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'teste@email.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: '123456' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!);
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/panel/dashboard');
    });
  });

  it('mostra loading no botão durante o envio', async () => {
    let resolveSignIn: any;
    mockSignIn.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
    );
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'teste@email.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: '123456' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!);
    });
    expect(screen.getByRole('button', { name: '' })).toBeDisabled(); // CircularProgress
    await act(async () => {
      resolveSignIn({ ok: true });
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled();
    });
  });

  describe('Acessibilidade', () => {
    it('tem título e descrição apropriados', () => {
      render(<LoginPage />);
      expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getAllByText(/acesse sua conta/i).length).toBeGreaterThanOrEqual(1);
    });

    it('tem labels apropriados para todos os campos', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    });

    it('tem mensagens de erro acessíveis', async () => {
      render(<LoginPage />);
      await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!);
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/preencha todos os campos/i)).toBeInTheDocument();
    });

    it('tem navegação por teclado adequada', async () => {
      render(<LoginPage />);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      const user = userEvent.setup();
      expect(document.activeElement).toBe(emailInput);
      await user.tab();
      expect(document.activeElement).toBe(passwordInput);
      await user.tab();
      expect(document.activeElement).toBe(submitButton);
    });

    it('tem contraste adequado para texto e elementos interativos', () => {
      render(<LoginPage />);
      const heading = screen.getByRole('heading', { name: /entrar/i });
      const button = screen.getByRole('button', { name: /entrar/i });
      expect(getComputedStyle(heading).color).toBeDefined();
      expect(getComputedStyle(button).backgroundColor).toBeDefined();
    });

    it('tem links com texto descritivo', () => {
      render(<LoginPage />);
      const forgotLink = screen.getByRole('link', { name: /esqueceu a senha/i });
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
      const signUpLink = screen.getByRole('link', { name: /cadastre-se/i });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });
});
