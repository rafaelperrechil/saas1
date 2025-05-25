import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AddChecklistPage from './page';
import { getChecklistResponseTypes } from '@/services/checklist_response_type.service';
import { departmentService } from '@/services/department.service';
import { userService } from '@/services/user.service';
import { environmentService } from '@/services/environment.service';

// Mock das dependências
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('@/services/checklist_response_type.service');
jest.mock('@/services/department.service');
jest.mock('@/services/user.service');
jest.mock('@/services/environment.service');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AddChecklistPage', () => {
  const mockSession = {
    user: {
      branch: {
        id: 'branch-1',
        organizationId: 'org-1',
      },
    },
  };

  const mockResponseTypes = [
    { id: '1', name: 'Binário', positiveLabel: 'Sim', negativeLabel: 'Não' },
    { id: '2', name: 'Customizado', positiveLabel: 'OK', negativeLabel: 'Falha' },
  ];

  const mockDepartments = [
    { id: '1', name: 'Departamento 1' },
    { id: '2', name: 'Departamento 2' },
  ];

  const mockUsers = [
    { id: '1', name: 'Usuário 1', email: 'user1@test.com' },
    { id: '2', name: 'Usuário 2', email: 'user2@test.com' },
  ];

  const mockEnvironments = [
    { id: '1', name: 'Ambiente 1', position: 1 },
    { id: '2', name: 'Ambiente 2', position: 2 },
  ];

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: mockSession });
    (getChecklistResponseTypes as jest.Mock).mockResolvedValue(mockResponseTypes);
    (departmentService.getDepartmentsByBranch as jest.Mock).mockResolvedValue(mockDepartments);
    (userService.getUsersByOrganization as jest.Mock).mockResolvedValue(mockUsers);
    (environmentService.getEnvironments as jest.Mock).mockResolvedValue({ data: mockEnvironments });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve validar campos obrigatórios', async () => {
    render(<AddChecklistPage />);

    const nextButton = screen.getByTestId('next-step-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      try {
        expect(screen.getByText(/checklists\.errors\.nameRequired/i)).toBeInTheDocument();
        expect(screen.getByText(/checklists\.errors\.responsiblesRequired/i)).toBeInTheDocument();
        expect(screen.getByText(/checklists\.errors\.environmentRequired/i)).toBeInTheDocument();
        expect(screen.getByText(/checklists\.errors\.weekdaysRequired/i)).toBeInTheDocument();
      } catch (e) {
        const allText = Array.from(document.querySelectorAll('body *'))
          .map((el) => el.textContent)
          .join('\n');
        // eslint-disable-next-line no-console
        throw e;
      }
    });
  });

  it('deve permitir avançar para próximo passo com campos válidos', async () => {
    render(<AddChecklistPage />);

    // Preencher campos obrigatórios
    const nameInput = screen.getByTestId('checklist-name-input');
    fireEvent.change(nameInput, {
      target: { value: 'Novo Checklist' },
    });

    // Buscar select de ambiente
    const environmentSelect = screen.getByTestId('environment-select');
    if (!environmentSelect) throw new Error('Select de ambiente não encontrado');
    fireEvent.mouseDown(environmentSelect);
    const envOption = await screen.findByText('Ambiente 1');
    fireEvent.click(envOption);

    // Selecionar responsáveis
    const autocomplete = screen.getByTestId('responsibles-autocomplete');
    if (!autocomplete) throw new Error('Autocomplete de responsáveis não encontrado');
    const input = autocomplete.querySelector('input');
    if (!input) throw new Error('Input do autocomplete não encontrado');
    fireEvent.mouseDown(input);
    const userOption = await screen.findByText(/Usuário 1/i);
    fireEvent.click(userOption);

    // Selecionar frequência
    const frequencySelect = screen.getByTestId('frequency-select');
    if (!frequencySelect) throw new Error('Select de frequência não encontrado');
    fireEvent.mouseDown(frequencySelect);
    const freqOption = await screen.findByText(/checklists\.frequencies\.daily/i);
    fireEvent.click(freqOption);

    // Selecionar dias da semana (pega o primeiro checkbox)
    const allCheckboxes = screen.getAllByRole('checkbox');
    const mondayCheckbox = allCheckboxes[0];
    if (!mondayCheckbox) throw new Error('Checkbox de segunda-feira não encontrado');
    fireEvent.click(mondayCheckbox);

    // Definir horário
    const timeInput = screen.getByTestId('execution-time-input');
    if (!timeInput) throw new Error('Input de horário não encontrado');
    fireEvent.change(timeInput, {
      target: { value: '08:00' },
    });

    const nextButton = screen.getByTestId('next-step-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      const checklistSteps = screen.getAllByText(/checklists\.steps\.checklist/i);
      expect(checklistSteps.length).toBeGreaterThan(0);
    });
  }, 10000);
});
