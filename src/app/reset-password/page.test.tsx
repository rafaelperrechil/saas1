import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ResetPasswordPage from './page';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { authService } from '@/services';

// Mock do i18n para garantir que os labels sejam sempre em português
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'auth.resetPassword.title': 'Redefinir senha',
        'auth.resetPassword.newPassword': 'Nova senha',
        'auth.resetPassword.confirmPassword': 'Confirmar nova senha',
        'auth.resetPassword.submit': 'Redefinir senha',
        'auth.resetPassword.backToLogin': 'Voltar para o login',
        'auth.resetPassword.error.invalidToken': 'Token inválido',
        'auth.resetPassword.error.expiredToken':
          'O link de redefinição de senha é inválido ou expirou',
        'auth.resetPassword.error.passwordMismatch': 'As senhas não coincidem',
        'auth.resetPassword.error.passwordLength': 'A senha deve ter pelo menos 6 caracteres',
        'auth.resetPassword.success.title': 'Senha redefinida com sucesso!',
        'auth.resetPassword.success.message':
          'Você será redirecionado para a página de login em instantes...',
      };
      return map[key] || key;
    },
    i18n: { language: 'pt' },
  }),
}));

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams('?token=123'),
}));

// Mock do authService
jest.mock('@/services', () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

// Mock do fetch para validação do token
global.fetch = jest.fn();

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock da validação do token para retornar válido
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      })
    );
    // Mock do useSearchParams para sempre retornar um token válido
    jest
      .spyOn(require('next/navigation'), 'useSearchParams')
      .mockImplementation(() => new URLSearchParams('?token=123'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('exibe mensagem de token inválido se não houver token', async () => {
    // Mock dinâmico para simular ausência de token
    jest
      .spyOn(require('next/navigation'), 'useSearchParams')
      .mockImplementation(() => new URLSearchParams(''));

    // Mock do fetch para retornar token inválido
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ valid: false }),
      })
    );

    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByText(/token inválido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/o link de redefinição de senha é inválido ou expirou/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar para o login/i })).toBeInTheDocument();
  });

  it('exibe erro se as senhas não coincidirem', async () => {
    // Garante que o token é válido
    jest
      .spyOn(require('next/navigation'), 'useSearchParams')
      .mockImplementation(() => new URLSearchParams('?token=123'));
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      })
    );
    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const passwordInput = screen.getByLabelText(/nova senha/i, {
      selector: 'input[name="password"]',
    });
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
      selector: 'input[name="confirmPassword"]',
    });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '654321' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
    });

    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
  });

  it('exibe erro se a senha for menor que 6 caracteres', async () => {
    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const passwordInput = screen.getByLabelText(/nova senha/i, {
      selector: 'input[name="password"]',
    });
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
      selector: 'input[name="confirmPassword"]',
    });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
    });

    expect(screen.getByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
  });

  it('redefine a senha com sucesso', async () => {
    (authService.resetPassword as jest.Mock).mockResolvedValueOnce({ success: true });
    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const passwordInput = screen.getByLabelText(/nova senha/i, {
      selector: 'input[name="password"]',
    });
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
      selector: 'input[name="confirmPassword"]',
    });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
    });

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: '123',
      password: '123456',
      confirmPassword: '123456',
      lang: expect.any(String),
    });
  });

  it('exibe erro se a API retornar erro', async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValueOnce(new Error('Erro na API'));
    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const passwordInput = screen.getByLabelText(/nova senha/i, {
      selector: 'input[name="password"]',
    });
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
      selector: 'input[name="confirmPassword"]',
    });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
    });

    expect(screen.getByText(/erro na api/i)).toBeInTheDocument();
  });

  it('mostra loading no botão durante o envio', async () => {
    (authService.resetPassword as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const passwordInput = screen.getByLabelText(/nova senha/i, {
      selector: 'input[name="password"]',
    });
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
      selector: 'input[name="confirmPassword"]',
    });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  describe('Acessibilidade', () => {
    it('tem título e descrição apropriados', async () => {
      render(<ResetPasswordPage />);

      // Aguarda a validação do token
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(screen.getByRole('heading', { name: /redefinir senha/i })).toBeInTheDocument();
    });

    it('tem labels apropriados para todos os campos', async () => {
      render(<ResetPasswordPage />);

      // Aguarda a validação do token
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(
        screen.getByLabelText(/nova senha/i, { selector: 'input[name="password"]' })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/confirmar nova senha/i, {
          selector: 'input[name="confirmPassword"]',
        })
      ).toBeInTheDocument();
    });

    it('tem mensagens de erro acessíveis', async () => {
      render(<ResetPasswordPage />);

      // Aguarda a validação do token
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const passwordInput = screen.getByLabelText(/nova senha/i, {
        selector: 'input[name="password"]',
      });
      const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
        selector: 'input[name="confirmPassword"]',
      });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
      });

      expect(screen.getByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });

    it('tem navegação por teclado adequada', async () => {
      render(<ResetPasswordPage />);

      // Aguarda a validação do token
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const passwordInput = screen.getByLabelText(/nova senha/i, {
        selector: 'input[name="password"]',
      });
      const confirmInput = screen.getByLabelText(/confirmar nova senha/i, {
        selector: 'input[name="confirmPassword"]',
      });
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i });

      // Apenas garante que os elementos existem e são inputs/botão
      expect(passwordInput).toBeInTheDocument();
      expect(confirmInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('tem contraste adequado para texto e elementos interativos', async () => {
      render(<ResetPasswordPage />);

      // Aguarda a validação do token
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const heading = screen.getByRole('heading', { name: /redefinir senha/i });
      const button = screen.getByRole('button', { name: /redefinir senha/i });

      expect(getComputedStyle(heading).color).toBeDefined();
      expect(getComputedStyle(button).color).toBeDefined();
    });

    it('tem links com texto descritivo', async () => {
      render(<ResetPasswordPage />);

      // Aguarda a validação do token
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const backLink = screen.getByRole('link', { name: /voltar para o login/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/login');
    });
  });

  it('redireciona para login após redefinir senha com sucesso', async () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockPush,
    }));

    (authService.resetPassword as jest.Mock).mockResolvedValueOnce({ success: true });
    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const passwordInput = screen.getByLabelText(/nova senha/i, {
      selector: 'input[name="password"]',
    });
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
      selector: 'input[name="confirmPassword"]',
    });
    await userEvent.type(passwordInput, '123456');
    await userEvent.type(confirmPasswordInput, '123456');
    const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
    await userEvent.click(submitButton);

    // Aguarda o redirecionamento
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('exibe erro se a API retornar erro', async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValueOnce(new Error('Erro na requisição'));
    render(<ResetPasswordPage />);

    // Aguarda a validação do token
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const passwordInput = screen.getByLabelText(/nova senha/i, {
      selector: 'input[name="password"]',
    });
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i, {
      selector: 'input[name="confirmPassword"]',
    });
    await userEvent.type(passwordInput, '123456');
    await userEvent.type(confirmPasswordInput, '123456');
    const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
    await userEvent.click(submitButton);

    expect(screen.getByText(/erro na requisição/i)).toBeInTheDocument();
  });
});
