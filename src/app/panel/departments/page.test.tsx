import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepartmentsPage from './page';
import { departmentService } from '@/services/department.service';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

// Mock dos módulos
jest.mock('next-auth/react');
jest.mock('react-i18next');
jest.mock('@/services/department.service');
jest.mock('swr');

// Mock dos dados
const mockDepartments = [
  {
    id: '1',
    name: 'Departamento 1',
    branchId: 'branch1',
    responsibles: [{ id: '1', name: 'Responsável 1', email: 'responsavel1@test.com' }],
  },
  {
    id: '2',
    name: 'Departamento 2',
    branchId: 'branch1',
    responsibles: [],
  },
];

const mockSession = {
  user: {
    branch: {
      id: 'branch1',
    },
  },
};

describe('DepartmentsPage', () => {
  beforeEach(() => {
    // Mock do useSession
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    // Mock do useTranslation
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    // Mock do SWR
    jest.requireMock('swr').default.mockReturnValue({
      data: mockDepartments,
      error: null,
      mutate: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Testes de Listagem
  it('deve listar todos os departamentos do branch do usuário', async () => {
    render(<DepartmentsPage />);

    expect(screen.getByText('Departamento 1')).toBeInTheDocument();
    expect(screen.getByText('Departamento 2')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não houver departamentos', async () => {
    jest.requireMock('swr').default.mockReturnValue({
      data: [],
      error: null,
      mutate: jest.fn(),
    });

    render(<DepartmentsPage />);

    expect(screen.getByTestId('no-departments-message')).toBeInTheDocument();
    expect(screen.getByTestId('no-departments-message')).toHaveTextContent(
      'departments.noDepartments'
    );
  });

  // Testes de Criação
  it('deve validar campos obrigatórios ao criar departamento', async () => {
    render(<DepartmentsPage />);

    const addButton = screen.getByText('departments.newDepartment');
    fireEvent.click(addButton);

    const saveButton = screen.getByText('departments.save');
    fireEvent.click(saveButton);

    expect(screen.getByText('departments.error.nameRequired')).toBeInTheDocument();
  });

  it('deve criar um novo departamento com sucesso', async () => {
    const mockMutate = jest.fn();
    jest.requireMock('swr').default.mockReturnValue({
      data: mockDepartments,
      error: null,
      mutate: mockMutate,
    });

    (departmentService.createDepartment as jest.Mock).mockResolvedValue({
      data: { id: '3', name: 'Novo Departamento', branchId: 'branch1' },
      error: null,
    });

    render(<DepartmentsPage />);

    const addButton = screen.getByText('departments.newDepartment');
    fireEvent.click(addButton);

    const nameInput = screen.getByRole('textbox', { name: /departments\.name/i });
    await userEvent.type(nameInput, 'Novo Departamento');

    const saveButton = screen.getByText('departments.save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(departmentService.createDepartment).toHaveBeenCalledWith({
        name: 'Novo Departamento',
        branchId: 'branch1',
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  // Testes de Edição
  it('deve editar um departamento existente', async () => {
    const mockMutate = jest.fn();
    jest.requireMock('swr').default.mockReturnValue({
      data: mockDepartments,
      error: null,
      mutate: mockMutate,
    });

    (departmentService.updateDepartment as jest.Mock).mockResolvedValue({
      data: { id: '1', name: 'Departamento Editado', branchId: 'branch1' },
      error: null,
    });

    render(<DepartmentsPage />);

    const editButtons = screen.getAllByTestId('EditIcon');
    fireEvent.click(editButtons[0]);

    const nameInput = screen.getByRole('textbox', { name: /departments\.name/i });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Departamento Editado');

    const saveButton = screen.getByText('departments.save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(departmentService.updateDepartment).toHaveBeenCalledWith('1', {
        name: 'Departamento Editado',
        branchId: 'branch1',
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  // Testes de Exclusão
  it('deve excluir um departamento', async () => {
    const mockMutate = jest.fn();
    jest.requireMock('swr').default.mockReturnValue({
      data: mockDepartments,
      error: null,
      mutate: mockMutate,
    });

    (departmentService.deleteDepartment as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });

    render(<DepartmentsPage />);

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);

    const confirmDeleteButton = screen.getByText('departments.delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(departmentService.deleteDepartment).toHaveBeenCalledWith('1');
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  // Testes de Gerenciamento de Responsáveis
  it('deve adicionar um novo responsável', async () => {
    const mockMutate = jest.fn();
    jest.requireMock('swr').default.mockReturnValue({
      data: mockDepartments,
      error: null,
      mutate: mockMutate,
    });

    (departmentService.addResponsible as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });

    render(<DepartmentsPage />);

    const addResponsibleButtons = screen.getAllByTestId('PersonAddIcon');
    fireEvent.click(addResponsibleButtons[0]);

    const nameInput = screen.getByRole('textbox', { name: /departments\.responsibleName/i });
    const emailInput = screen.getByRole('textbox', { name: /departments\.responsibleEmail/i });

    await userEvent.type(nameInput, 'Novo Responsável');
    await userEvent.type(emailInput, 'novo@test.com');

    const saveButton = screen.getByText('departments.save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(departmentService.addResponsible).toHaveBeenCalledWith('1', {
        name: 'Novo Responsável',
        email: 'novo@test.com',
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('deve remover um responsável', async () => {
    const mockMutate = jest.fn();
    jest.requireMock('swr').default.mockReturnValue({
      data: mockDepartments,
      error: null,
      mutate: mockMutate,
    });

    (departmentService.removeResponsible as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });

    render(<DepartmentsPage />);

    const closeButtons = screen.getAllByTestId('CloseIcon');
    fireEvent.click(closeButtons[0]);

    const confirmDeleteButton = screen.getByText('departments.delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(departmentService.removeResponsible).toHaveBeenCalledWith('1', '1');
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
