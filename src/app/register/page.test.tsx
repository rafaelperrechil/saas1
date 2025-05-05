import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RegisterPage from './page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

// Mock para fetch
global.fetch = jest.fn();

// Mock para signIn
jest.mock('next-auth/react', () => ({
  signIn: jest.fn().mockResolvedValue({ ok: true }),
}));

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
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('exibe erro se campos obrigatórios estiverem vazios', async () => {
    const { container } = render(<RegisterPage />);
    const form = container.querySelector('form');

    // Garante que não há erro inicialmente
    expect(container.querySelector('.MuiAlert-root')).not.toBeInTheDocument();

    // Submete o formulário
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se o erro apareceu
    const alert = container.querySelector('.MuiAlert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Preencha todos os campos');
  });

  it('exibe erro quando o email já está cadastrado', async () => {
    // Mock da resposta da API indicando que o email já existe
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ exists: true }),
      })
    );

    const { container } = render(<RegisterPage />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Usuário Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se o erro apareceu
    const alert = container.querySelector('.MuiAlert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Email já cadastrado');

    // Verifica se apenas a chamada de verificação de email foi feita
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));
  });

  it('exibe erro se as senhas não coincidirem', async () => {
    const { container } = render(<RegisterPage />);

    // Preenche os campos usando IDs
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: 'diferente' },
    });

    // Garante que não há erro inicialmente
    expect(container.querySelector('.MuiAlert-root')).not.toBeInTheDocument();

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se o erro apareceu
    const alert = container.querySelector('.MuiAlert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Senhas não coincidem');
  });

  it('exibe erro se o email for inválido', async () => {
    const { container } = render(<RegisterPage />);

    // Preenche os campos com um email inválido
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'emailinvalido' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Garante que não há erro inicialmente
    expect(container.querySelector('.MuiAlert-root')).not.toBeInTheDocument();

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se o erro apareceu
    const alert = container.querySelector('.MuiAlert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Email inválido');
  });

  it('mostra estado de loading durante o registro', async () => {
    // Mock das respostas da API com delay
    (global.fetch as jest.Mock)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ exists: false }),
                }),
              100
            )
          )
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                }),
              100
            )
          )
      );

    const { container } = render(<RegisterPage />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Usuário Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Verifica estado inicial do botão
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    expect(submitButton).not.toBeDisabled();
    expect(container.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();

    // Submete o formulário
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    // Verifica estado de loading
    expect(submitButton).toBeDisabled();
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();

    // Aguarda o processo terminar
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    // Verifica estado final
    expect(submitButton).not.toBeDisabled();
    expect(container.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();
  });

  it('verifica disponibilidade da API antes do registro', async () => {
    // Mock da resposta da API de verificação
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

    const { container } = render(<RegisterPage />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Usuário Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se a API de verificação foi chamada
    expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));

    // Verifica se o registro foi bem sucedido
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
  });

  it('exibe erro quando a API de verificação está indisponível', async () => {
    // Mock de falha na API de verificação
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('API indisponível'))
    );

    const { container } = render(<RegisterPage />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Usuário Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se o erro apareceu
    const alert = container.querySelector('.MuiAlert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Erro ao criar conta');

    // Verifica se apenas a chamada de verificação foi feita
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));
  });

  it('registra com sucesso', async () => {
    // Mock das respostas da API
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

    const { container } = render(<RegisterPage />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Usuário Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se não há erro
    expect(container.querySelector('.MuiAlert-root')).not.toBeInTheDocument();

    // Verifica se as chamadas de API foram feitas corretamente
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
  });

  it('exibe erro quando o registro falha', async () => {
    // Mock das respostas da API
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

    const { container } = render(<RegisterPage />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Usuário Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se o erro apareceu
    const alert = container.querySelector('.MuiAlert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Erro ao criar conta');

    // Verifica se as chamadas de API foram feitas corretamente
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith('/api/check-email', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
  });

  it('redireciona para o dashboard após registro bem-sucedido', async () => {
    const mockRouter = {
      replace: jest.fn(),
    };
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter);

    // Mock das respostas da API
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

    const { container } = render(<RegisterPage />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Usuário Teste' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'teste@email.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: '123456' },
    });

    // Submete o formulário
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verifica se o usuário foi redirecionado
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  describe('Acessibilidade', () => {
    it('tem título e descrição apropriados', () => {
      render(<RegisterPage />);

      // Verifica se o título principal está presente
      const title = screen.getByRole('heading', { name: /criar conta/i });
      expect(title).toBeInTheDocument();

      // Verifica se a descrição está presente
      const subtitle = screen.getByText(/preencha os dados abaixo para criar sua conta/i);
      expect(subtitle).toBeInTheDocument();
    });

    it('tem labels apropriados para todos os campos', () => {
      render(<RegisterPage />);

      // Verifica labels dos campos usando IDs
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i, { selector: '#password' })).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    });

    it('tem mensagens de erro acessíveis', async () => {
      const { container } = render(<RegisterPage />);
      const form = container.querySelector('form');

      // Submete formulário vazio
      await act(async () => {
        fireEvent.submit(form!);
      });

      // Verifica se a mensagem de erro tem role="alert"
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Preencha todos os campos');
    });

    it('tem navegação por teclado adequada', () => {
      render(<RegisterPage />);

      // Verifica se todos os campos são focáveis
      const nameInput = screen.getByTestId('name');
      const emailInput = screen.getByTestId('email');
      const passwordInput = screen.getByTestId('password');
      const confirmPasswordInput = screen.getByTestId('confirmPassword');
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });

      // Verifica se os elementos são focáveis (inputs são focáveis por padrão)
      expect(nameInput).not.toHaveAttribute('tabIndex', '-1');
      expect(emailInput).not.toHaveAttribute('tabIndex', '-1');
      expect(passwordInput).not.toHaveAttribute('tabIndex', '-1');
      expect(confirmPasswordInput).not.toHaveAttribute('tabIndex', '-1');
      expect(submitButton).toHaveAttribute('tabIndex', '0');
    });

    it('tem contraste adequado para texto e elementos interativos', () => {
      render(<RegisterPage />);

      // Verifica contraste do texto principal
      const title = screen.getByRole('heading', { name: /criar conta/i });
      expect(title).toHaveStyle({ color: expect.stringMatching(/^#|^rgb/) });

      // Verifica contraste do botão
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      const buttonStyles = window.getComputedStyle(submitButton);

      // Verifica se o botão tem cores definidas
      expect(buttonStyles.backgroundColor).not.toBe('transparent');
      expect(buttonStyles.color).not.toBe('transparent');

      // Verifica se as cores são válidas (não transparentes ou vazias)
      expect(buttonStyles.backgroundColor).toMatch(/^#|^rgb/);
      expect(buttonStyles.color).toMatch(/^#|^rgb/);
    });

    it('tem links com texto descritivo', () => {
      render(<RegisterPage />);

      // Verifica se o link de login tem texto descritivo
      const loginLink = screen.getByRole('link', { name: /auth\.register\.signIn/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});
