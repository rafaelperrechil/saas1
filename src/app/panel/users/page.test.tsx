import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersPage from './page';
import { SWRConfig } from 'swr';

// Mock do módulo date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => '01 de janeiro de 2024'),
}));

// Mock dos dados
const mockUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    profile: { id: '1', name: 'Admin' },
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@exemplo.com',
    profile: { id: '2', name: 'Usuário' },
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockProfiles = [
  { id: '1', name: 'Admin' },
  { id: '2', name: 'Usuário' },
];

// Mock do fetch global
global.fetch = jest.fn();

const mockFetch = (data: any) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

const renderComponent = () => {
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        fallback: {
          '/api/users': mockUsers,
          '/api/profiles': mockProfiles,
        },
      }}
    >
      <UsersPage />
    </SWRConfig>
  );
};

describe('ADMIN - Users CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/users') return mockFetch(mockUsers);
      if (url === '/api/profiles') return mockFetch(mockProfiles);
      return mockFetch({});
    });
  });

  it('deve renderizar a lista de usuários', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  it('deve abrir o diálogo de criação ao clicar no botão Novo Usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const novoButton = screen.getByRole('button', { name: /novo usuário/i });
    await userEvent.click(novoButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /nome/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });
  });

  it('deve criar um novo usuário com sucesso', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Configura o mock para a criação
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetch({ name: 'Novo Usuário', email: 'novo@exemplo.com', profile: mockProfiles[0] })
    );

    // Abre o diálogo de criação
    const novoButton = screen.getByRole('button', { name: /novo usuário/i });
    await user.click(novoButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Preenche o formulário
    await user.type(screen.getByRole('textbox', { name: /nome/i }), 'Novo Usuário');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'novo@exemplo.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');

    // Seleciona o perfil
    const perfilSelect = screen.getByRole('combobox', { name: /perfil/i });
    await user.click(perfilSelect);
    const adminOption = await screen.findByRole('option', { name: /admin/i });
    await user.click(adminOption);

    // Salva o formulário
    const salvarButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(salvarButton);

    // Verifica se a mensagem de sucesso aparece
    await waitFor(() => {
      expect(screen.getByText('Usuário criado com sucesso!')).toBeInTheDocument();
    });
  });

  it('deve editar um usuário existente', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Aguarda a lista de usuários ser carregada
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Configura o mock para a edição
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/users') return mockFetch(mockUsers);
      if (url === '/api/profiles') return mockFetch(mockProfiles);
      if (url === '/api/users/1') {
        return mockFetch({ ...mockUsers[0], name: 'João Silva Modificado' });
      }
      return mockFetch({});
    });

    // Clica no botão de editar
    const editButton = screen.getAllByRole('button', { name: /editar/i })[0];
    await user.click(editButton);

    // Aguarda o diálogo abrir e os campos serem preenchidos
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /nome/i })).toHaveValue('João Silva');
    });

    // Edita o nome
    const nomeInput = screen.getByRole('textbox', { name: /nome/i });
    await user.clear(nomeInput);
    await user.type(nomeInput, 'João Silva Modificado');

    // Salva o formulário
    const salvarButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(salvarButton);

    // Verifica se a mensagem de sucesso aparece
    await waitFor(() => {
      expect(screen.getByText('Usuário editado com sucesso!')).toBeInTheDocument();
    });
  });

  it('deve excluir um usuário', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button', { name: /excluir/i })[0];
    await user.click(deleteButton);

    const confirmarButton = screen.getByRole('button', { name: /excluir/i });
    await user.click(confirmarButton);

    await waitFor(() => {
      expect(screen.getByText('Usuário excluído com sucesso!')).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios na criação', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Abre o diálogo de criação
    const novoButton = screen.getByRole('button', { name: /novo usuário/i });
    await user.click(novoButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Configura o mock para retornar erro
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Todos os campos são obrigatórios' }),
      })
    );

    // Tenta salvar sem preencher os campos
    const salvarButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(salvarButton);

    // Verifica se a mensagem de erro aparece
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Todos os campos são obrigatórios');
    });
  });
});
