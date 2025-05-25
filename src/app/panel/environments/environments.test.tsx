import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnvironmentsPage from './page';
import { environmentService } from '@/services';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';
import { useSession } from 'next-auth/react';
import { cache } from 'swr/_internal';
import { SWRConfig } from 'swr';

jest.mock('@/services', () => ({
  environmentService: {
    getEnvironments: jest.fn(),
    createEnvironment: jest.fn(),
    updateEnvironment: jest.fn(),
    deleteEnvironment: jest.fn(),
  },
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { branch: { id: 'branch-1' } } } }),
}));

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
    </SWRConfig>
  );
};

describe('CRUD de Ambientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    if (cache.clear) cache.clear();
  });

  describe('Cadastro', () => {
    it('deve criar um novo ambiente com dados válidos', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({ data: [] });
      (environmentService.createEnvironment as jest.Mock).mockResolvedValue({
        data: { id: '1', name: 'Ambiente Teste', position: 1, branchId: 'branch-1' },
      });
      renderWithI18n(<EnvironmentsPage />);
      fireEvent.click(screen.getByRole('button', { name: /novo ambiente/i }));
      fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Ambiente Teste' } });
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
      await waitFor(() => {
        expect(environmentService.createEnvironment).toHaveBeenCalledWith({
          name: 'Ambiente Teste',
          position: 1,
          branchId: 'branch-1',
        });
      });
    });

    it('deve garantir que o nome do ambiente seja único (se aplicável)', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({
        data: [{ id: '1', name: 'Ambiente Teste', position: 1, branchId: 'branch-1' }],
      });
      (environmentService.createEnvironment as jest.Mock).mockResolvedValue({
        error: 'Nome já existe',
      });
      renderWithI18n(<EnvironmentsPage />);
      fireEvent.click(screen.getByRole('button', { name: /novo ambiente/i }));
      fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Ambiente Teste' } });
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
      await waitFor(() => {
        expect(screen.getByText(/já existe/i)).toBeInTheDocument();
      });
    });

    it('deve validar campos obrigatórios ao criar (ex: nome vazio)', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({ data: [] });
      renderWithI18n(<EnvironmentsPage />);
      fireEvent.click(screen.getByRole('button', { name: /novo ambiente/i }));
      fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
      expect(await screen.findByText(/obrigatório/i)).toBeInTheDocument();
      expect(environmentService.createEnvironment).not.toHaveBeenCalled();
    });
  });

  describe('Listagem', () => {
    it('deve listar todos os ambientes existentes', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({
        data: [
          { id: '1', name: 'Ambiente 1', position: 1, branchId: 'branch-1' },
          { id: '2', name: 'Ambiente 2', position: 2, branchId: 'branch-1' },
        ],
      });
      renderWithI18n(<EnvironmentsPage />);
      await waitFor(() => {
        expect(screen.getByTestId('env-name-1')).toHaveTextContent('Ambiente 1');
        expect(screen.getByTestId('env-name-2')).toHaveTextContent('Ambiente 2');
      });
    });
    // O teste de buscar pelo ID do branch do usuário depende da lógica de filtro, que normalmente é feita no backend ou hook.
  });

  describe('Edição', () => {
    it('deve atualizar um ambiente existente com dados válidos', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({
        data: [{ id: '1', name: 'Ambiente 1', position: 1, branchId: 'branch-1' }],
      });
      (environmentService.updateEnvironment as jest.Mock).mockResolvedValue({
        data: { id: '1', name: 'Ambiente Editado', position: 1, branchId: 'branch-1' },
      });
      renderWithI18n(<EnvironmentsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('env-name-1')).toHaveTextContent('Ambiente 1');
      });

      const editButton = screen.getAllByTestId('EditIcon')[0];
      fireEvent.click(editButton);

      fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Ambiente Editado' } });
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

      await waitFor(() => {
        expect(environmentService.updateEnvironment).toHaveBeenCalledWith('1', {
          name: 'Ambiente Editado',
          position: 1,
          branchId: 'branch-1',
        });
      });
    });

    it('não deve atualizar ambiente com dados inválidos', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({
        data: [{ id: '1', name: 'Ambiente 1', position: 1, branchId: 'branch-1' }],
      });
      renderWithI18n(<EnvironmentsPage />);
      const editButtons = await screen.findAllByLabelText('Editar', { selector: 'button' });
      fireEvent.click(editButtons[0]);
      fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
      expect(await screen.findByText(/obrigatório/i)).toBeInTheDocument();
      expect(environmentService.updateEnvironment).not.toHaveBeenCalled();
    });

    it('deve validar campos obrigatórios ao atualizar', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({
        data: [{ id: '1', name: 'Ambiente 1', position: 1, branchId: 'branch-1' }],
      });
      renderWithI18n(<EnvironmentsPage />);
      const editButtons = await screen.findAllByLabelText('Editar', { selector: 'button' });
      fireEvent.click(editButtons[0]);
      fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
      expect(await screen.findByText(/obrigatório/i)).toBeInTheDocument();
    });
  });

  describe('Exclusão', () => {
    it('deve deletar um ambiente existente', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({
        data: [{ id: '1', name: 'Ambiente 1', position: 1, branchId: 'branch-1' }],
      });
      (environmentService.deleteEnvironment as jest.Mock).mockResolvedValue({ data: {} });
      renderWithI18n(<EnvironmentsPage />);
      const deleteButton = await screen.findByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);
      fireEvent.click(screen.getByRole('button', { name: /excluir/i }));
      await waitFor(() => {
        expect(environmentService.deleteEnvironment).toHaveBeenCalledWith('1');
      });
    });

    it('deve retornar erro ao tentar deletar ambiente inexistente', async () => {
      (environmentService.getEnvironments as jest.Mock).mockResolvedValue({
        data: [{ id: '1', name: 'Ambiente 1', position: 1, branchId: 'branch-1' }],
      });
      (environmentService.deleteEnvironment as jest.Mock).mockResolvedValue({
        error: 'Não encontrado',
      });
      renderWithI18n(<EnvironmentsPage />);
      const deleteButton = await screen.findByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);
      fireEvent.click(screen.getByRole('button', { name: /excluir/i }));
      await waitFor(() => {
        expect(screen.getByText(/não encontrado/i)).toBeInTheDocument();
      });
    });
  });
});
