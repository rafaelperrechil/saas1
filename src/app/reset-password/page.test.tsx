import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ResetPasswordPage from './page';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock global para useRouter e useSearchParams
const push = jest.fn();
const mockUseRouter = () => ({ push });
const mockUseSearchParamsWithToken = () => ({
  get: (key: string) => (key === 'token' ? 'valid-token' : null),
});
const mockUseSearchParamsNoToken = () => ({ get: () => null });

// Mock global que retorna token válido por padrão
jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  useSearchParams: () => mockUseSearchParamsWithToken(),
}));

global.fetch = jest.fn();

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetar mocks para garantir que cada teste começa limpo
    (push as jest.Mock).mockClear();
    // Resetar o mock de useSearchParams para o padrão (com token)
    const navigation = require('next/navigation');
    jest
      .spyOn(navigation, 'useSearchParams')
      .mockImplementation(() => mockUseSearchParamsWithToken());
  });

  it('exibe mensagem de token inválido se não houver token', () => {
    // Mock dinâmico para simular ausência de token
    const navigation = require('next/navigation');
    jest
      .spyOn(navigation, 'useSearchParams')
      .mockImplementation(() => mockUseSearchParamsNoToken());
    render(<ResetPasswordPage />);
    expect(screen.getByText(/token inválido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/o link de redefinição de senha é inválido ou expirou/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar para o login/i })).toBeInTheDocument();
  });

  it('exibe erro se as senhas não coincidirem', async () => {
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/nova senha/i, { selector: '#password' }), {
      target: { value: '123456' },
    });
    fireEvent.change(
      screen.getByLabelText(/confirmar nova senha/i, { selector: '#confirmPassword' }),
      {
        target: { value: '654321' },
      }
    );
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
  });

  it('exibe erro se a senha for menor que 6 caracteres', async () => {
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/nova senha/i, { selector: '#password' }), {
      target: { value: '123' },
    });
    fireEvent.change(
      screen.getByLabelText(/confirmar nova senha/i, { selector: '#confirmPassword' }),
      {
        target: { value: '123' },
      }
    );
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    expect(screen.getByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
  });

  it('redefine a senha com sucesso', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/nova senha/i, { selector: '#password' }), {
      target: { value: '123456' },
    });
    fireEvent.change(
      screen.getByLabelText(/confirmar nova senha/i, { selector: '#confirmPassword' }),
      {
        target: { value: '123456' },
      }
    );
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/reset-password', expect.any(Object));
      expect(push).toHaveBeenCalledWith('/login');
    });
  });

  it('exibe erro se a API retornar erro', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Erro ao redefinir senha' }),
    });
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/nova senha/i, { selector: '#password' }), {
      target: { value: '123456' },
    });
    fireEvent.change(
      screen.getByLabelText(/confirmar nova senha/i, { selector: '#confirmPassword' }),
      {
        target: { value: '123456' },
      }
    );
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    expect(await screen.findByText(/erro ao redefinir senha/i)).toBeInTheDocument();
  });

  it('mostra loading no botão durante o envio', async () => {
    let resolveFetch: any;
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/nova senha/i, { selector: '#password' }), {
      target: { value: '123456' },
    });
    fireEvent.change(
      screen.getByLabelText(/confirmar nova senha/i, { selector: '#confirmPassword' }),
      {
        target: { value: '123456' },
      }
    );
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    expect(screen.getByRole('button', { name: '' })).toBeDisabled(); // Botão mostra CircularProgress
    // Finaliza o fetch
    await act(async () => {
      resolveFetch({ ok: true, json: async () => ({ success: true }) });
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeEnabled();
    });
  });

  describe('Acessibilidade', () => {
    it('tem título e descrição apropriados', () => {
      render(<ResetPasswordPage />);
      expect(screen.getByRole('heading', { name: /redefinir senha/i })).toBeInTheDocument();
    });

    it('tem labels apropriados para todos os campos', () => {
      render(<ResetPasswordPage />);
      expect(screen.getByLabelText(/nova senha/i, { selector: '#password' })).toBeInTheDocument();
      expect(
        screen.getByLabelText(/confirmar nova senha/i, { selector: '#confirmPassword' })
      ).toBeInTheDocument();
    });

    it('tem mensagens de erro acessíveis', async () => {
      render(<ResetPasswordPage />);
      fireEvent.change(screen.getByLabelText(/nova senha/i, { selector: '#password' }), {
        target: { value: '123' },
      });
      fireEvent.change(
        screen.getByLabelText(/confirmar nova senha/i, { selector: '#confirmPassword' }),
        {
          target: { value: '123' },
        }
      );
      await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });

    it('tem navegação por teclado adequada', async () => {
      render(<ResetPasswordPage />);
      const passwordInput = screen.getByLabelText(/nova senha/i, { selector: '#password' });
      const confirmInput = screen.getByLabelText(/confirmar nova senha/i, {
        selector: '#confirmPassword',
      });
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i });

      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(passwordInput);
      await user.tab();
      expect(document.activeElement).toBe(confirmInput);
      await user.tab();
      expect(document.activeElement).toBe(submitButton);
    });

    it('tem contraste adequado para texto e elementos interativos', () => {
      render(<ResetPasswordPage />);
      const heading = screen.getByRole('heading', { name: /redefinir senha/i });
      const button = screen.getByRole('button', { name: /redefinir senha/i });

      expect(getComputedStyle(heading).color).toBeDefined();
      expect(getComputedStyle(button).backgroundColor).toBeDefined();
    });

    it('tem links com texto descritivo', () => {
      render(<ResetPasswordPage />);
      const backLink = screen.getByRole('link', { name: /voltar para o login/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/login');
    });
  });
});
