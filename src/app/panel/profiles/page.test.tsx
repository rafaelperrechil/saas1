import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfilesPage from './page';

// Mock do next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock da função fetch global
global.fetch = jest.fn();

describe('ADMIN - Profiles CRUD', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const mockProfiles = [
    { id: '1', name: 'Administrador' },
    { id: '2', name: 'Usuário' },
  ];

  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();

    // Mock do router
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock da sessão autenticada por padrão
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User', email: 'test@example.com' } },
      status: 'authenticated',
    });

    // Mock do fetch para carregar perfis
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/profiles') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfiles),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  describe('Autenticação e Autorização', () => {
    it('deve redirecionar para login se não estiver autenticado', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<ProfilesPage />);
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });

    it('deve mostrar loading enquanto verifica autenticação', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<ProfilesPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Listagem de Perfis', () => {
    it('deve renderizar a lista de perfis corretamente', async () => {
      render(<ProfilesPage />);

      await waitFor(() => {
        mockProfiles.forEach((profile) => {
          expect(screen.getByText(profile.name)).toBeInTheDocument();
        });
      });
    });

    it('deve mostrar mensagem de erro se falhar ao carregar perfis', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Erro ao carregar'));

      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
      });
    });
  });

  describe('Criação de Perfil', () => {
    it('deve abrir modal de criação ao clicar no botão novo perfil', async () => {
      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /novo perfil/i });
      fireEvent.click(addButton);

      expect(screen.getByRole('heading', { name: /novo perfil/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/nome do perfil/i)).toBeInTheDocument();
    });

    it('deve validar campos obrigatórios', async () => {
      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /novo perfil/i });
      fireEvent.click(addButton);

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/nome é obrigatório/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('deve criar um novo perfil com sucesso', async () => {
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: '3', name: 'Novo Perfil' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfiles),
        });
      });

      render(<ProfilesPage />);

      // Espera os perfis carregarem
      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /novo perfil/i });
      fireEvent.click(addButton);

      fireEvent.change(screen.getByLabelText(/nome do perfil/i), {
        target: { value: 'Novo Perfil' },
      });

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/perfil criado com sucesso/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edição de Perfil', () => {
    it('deve abrir modal de edição com dados corretos', async () => {
      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTestId('edit-button');
      fireEvent.click(editButtons[0]);

      expect(screen.getByDisplayValue('Administrador')).toBeInTheDocument();
    });

    it('deve atualizar um perfil com sucesso', async () => {
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: '1', name: 'Admin Editado' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfiles),
        });
      });

      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTestId('edit-button');
      fireEvent.click(editButtons[0]);

      fireEvent.change(screen.getByLabelText(/nome do perfil/i), {
        target: { value: 'Admin Editado' },
      });
      fireEvent.click(screen.getByText('Salvar'));

      await waitFor(() => {
        expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument();
      });
    });
  });

  describe('Exclusão de Perfil', () => {
    it('deve mostrar confirmação antes de excluir', async () => {
      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTestId('delete-button');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText(/tem certeza/i)).toBeInTheDocument();
    });

    it('deve excluir um perfil com sucesso', async () => {
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfiles),
        });
      });

      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTestId('delete-button');
      fireEvent.click(deleteButtons[0]);

      const confirmDeleteButton = screen.getByRole('button', { name: /excluir$/i });
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(screen.getByText(/perfil excluído com sucesso/i)).toBeInTheDocument();
      });
    });

    it('não deve excluir se cancelar a confirmação', async () => {
      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTestId('delete-button');
      fireEvent.click(deleteButtons[0]);

      fireEvent.click(screen.getByText('Cancelar'));

      expect(screen.queryByText(/perfil excluído com sucesso/i)).not.toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/profiles\/\d+/),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar loading ao salvar perfil', async () => {
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'POST') {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ id: '3', name: 'Novo Perfil' }),
                }),
              100
            )
          );
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfiles),
        });
      });

      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /novo perfil/i });
      fireEvent.click(addButton);

      fireEvent.change(screen.getByLabelText(/nome do perfil/i), {
        target: { value: 'Novo Perfil' },
      });

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      fireEvent.click(saveButton);

      expect(screen.getByText(/salvando/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    });

    it('deve mostrar loading ao excluir perfil', async () => {
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'DELETE') {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                }),
              100
            )
          );
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfiles),
        });
      });

      render(<ProfilesPage />);

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTestId('delete-button');
      fireEvent.click(deleteButtons[0]);

      const confirmDeleteButton = screen.getByRole('button', { name: /excluir$/i });
      fireEvent.click(confirmDeleteButton);

      expect(screen.getByText(/excluindo/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /excluindo/i })).toBeDisabled();
    });
  });
});
