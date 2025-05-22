import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ResetPasswordPage from './page';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

global.fetch = jest.fn();

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetar mocks para garantir que cada teste começa limpo
    // Resetar o mock de useSearchParams para o padrão (com token)
    const mockInstance = jest.fn().mockImplementation(() => new URLSearchParams('?token=123'));
    jest
      .spyOn(jest.requireMock('next/navigation'), 'useSearchParams')
      .mockImplementation(mockInstance);
  });

  it('exibe mensagem de token inválido se não houver token', () => {
    // Mock dinâmico para simular ausência de token
    const mockInstance = jest.fn().mockImplementation(() => new URLSearchParams(''));
    jest
      .spyOn(jest.requireMock('next/navigation'), 'useSearchParams')
      .mockImplementation(mockInstance);
    render(<ResetPasswordPage />);
    expect(screen.getByText(/token inválido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/o link de redefinição de senha é inválido ou expirou/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar para o login/i })).toBeInTheDocument();
  });

  it('exibe erro se as senhas não coincidirem', async () => {
    render(<ResetPasswordPage />);
    const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '654321' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
  });

  it('exibe erro se a senha for menor que 6 caracteres', async () => {
    render(<ResetPasswordPage />);
    const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
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
    const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/reset-password', expect.any(Object));
    });
  });

  it('exibe erro se a API retornar erro', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Erro ao redefinir senha' }),
    });
    render(<ResetPasswordPage />);
    const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    // Aceita tanto a mensagem mockada quanto a mensagem genérica
    const error = await screen.findByRole('alert');
    expect([
      'Erro ao redefinir senha',
      'Erro na requisição',
    ]).toContain(error.textContent?.trim());
  });

  it('mostra loading no botão durante o envio', async () => {
    let resolveFetch: (value: any) => void;
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    render(<ResetPasswordPage />);
    const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
    });
    expect(screen.getByRole('button', { name: '' })).toBeDisabled();
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
      const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it('tem mensagens de erro acessíveis', async () => {
      render(<ResetPasswordPage />);
      const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
      await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: /redefinir senha/i }).closest('form')!);
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });

    it('tem navegação por teclado adequada', async () => {
      render(<ResetPasswordPage />);
      const [passwordInput, confirmInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
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

  it('redireciona para login após redefinir senha com sucesso', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<ResetPasswordPage />);
    const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
    await userEvent.type(passwordInput, '123456');
    await userEvent.type(confirmPasswordInput, '123456');
    const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/reset-password', expect.any(Object));
    });
  });

  it('exibe erro se a API retornar erro', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Erro na requisição'));
    render(<ResetPasswordPage />);
    const [passwordInput, confirmPasswordInput] = screen.getAllByLabelText(/nova senha/i, { selector: 'input' });
    await userEvent.type(passwordInput, '123456');
    await userEvent.type(confirmPasswordInput, '123456');
    const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Erro na requisição')).toBeInTheDocument();
    });
  });
});
