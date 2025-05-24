import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Wizard from '@/components/wizard/Wizard';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { nicheService } from '@/services';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock do serviço de nichos para garantir array sempre
jest.mock('@/services', () => ({
  nicheService: {
    getNiches: jest.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Saúde' },
      ],
    }),
  },
}));

describe('Wizard', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSession = {
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue(mockSession);
    jest.clearAllMocks();
  });

  it('deve redirecionar para dashboard se wizard já foi completado', async () => {
    (useSession as jest.Mock).mockReturnValue({
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          wizardCompleted: true,
        },
      },
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith('/panel/dashboard');
      },
      { timeout: 3000 }
    );
  });

  it('deve carregar os passos do wizard quando não completado', async () => {
    (useSession as jest.Mock).mockReturnValue({
      ...mockSession,
      data: {
        ...mockSession.data,
        wizardCompleted: false,
      },
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao assistente de configuração')).toBeInTheDocument();
    });
  });

  it('deve mostrar tela de carregamento durante a verificação', () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'loading',
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('deve lidar com erro ao carregar dados', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'error',
    });
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });

  it('deve navegar entre os passos corretamente', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );

    // Avança do passo de boas-vindas
    const nextButton = screen.getByText('Próximo');
    fireEvent.click(nextButton);

    // Aguarda o carregamento do passo da organização
    await waitFor(() => {
      expect(screen.getByText('Organização')).toBeInTheDocument();
    });

    // Preenche os dados da organização
    const nameInput = screen.getByTestId('organization-name');
    const employeesInput = screen.getByTestId('employees-count');
    fireEvent.change(nameInput, { target: { value: 'Empresa Teste' } });
    fireEvent.change(employeesInput, { target: { value: '100' } });

    // Simula seleção do país
    const comboboxes = screen.getAllByRole('combobox');
    const countryInput = comboboxes[0];
    fireEvent.change(countryInput, { target: { value: 'Brasil' } });
    fireEvent.keyDown(countryInput, { key: 'ArrowDown' });
    fireEvent.keyDown(countryInput, { key: 'Enter' });

    // Simula seleção da cidade
    const cityInput = comboboxes[1];
    fireEvent.change(cityInput, { target: { value: 'São Paulo' } });
    fireEvent.keyDown(cityInput, { key: 'ArrowDown' });
    fireEvent.keyDown(cityInput, { key: 'Enter' });

    // Simula seleção do nicho
    const nicheInput = comboboxes[2];
    fireEvent.change(nicheInput, { target: { value: 'Tecnologia' } });
    fireEvent.keyDown(nicheInput, { key: 'ArrowDown' });
    fireEvent.keyDown(nicheInput, { key: 'Enter' });

    // Avança para o próximo passo
    const nextButton2 = screen.getByText('Próximo');
    fireEvent.click(nextButton2);

    // Aguarda o carregamento do passo da filial
    await waitFor(() => {
      expect(screen.getByTestId('branch-name')).toBeInTheDocument();
    });

    // Preenche os dados da filial
    const branchNameInput = screen.getByTestId('branch-name');
    fireEvent.change(branchNameInput, { target: { value: 'Filial SP' } });

    // Avança para o próximo passo
    const nextButton3 = screen.getByText('Próximo');
    fireEvent.click(nextButton3);

    // Aguarda o carregamento do passo dos departamentos
    await waitFor(() => {
      expect(screen.getByText('Adicionar Departamento')).toBeInTheDocument();
    });
  });

  it('deve salvar dados e redirecionar ao completar', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Wizard />
      </I18nextProvider>
    );

    // Avança do passo de boas-vindas
    const nextButton = screen.getByText('Próximo');
    fireEvent.click(nextButton);

    // Aguarda o carregamento do passo da organização
    await waitFor(() => {
      expect(screen.getByText('Organização')).toBeInTheDocument();
    });

    // Preenche os dados da organização
    const nameInput = screen.getByTestId('organization-name');
    const employeesInput = screen.getByTestId('employees-count');
    fireEvent.change(nameInput, { target: { value: 'Empresa Teste' } });
    fireEvent.change(employeesInput, { target: { value: '100' } });

    // Simula seleção do país
    const comboboxes = screen.getAllByRole('combobox');
    const countryInput = comboboxes[0];
    fireEvent.change(countryInput, { target: { value: 'Brasil' } });
    fireEvent.keyDown(countryInput, { key: 'ArrowDown' });
    fireEvent.keyDown(countryInput, { key: 'Enter' });

    // Simula seleção da cidade
    const cityInput = comboboxes[1];
    fireEvent.change(cityInput, { target: { value: 'São Paulo' } });
    fireEvent.keyDown(cityInput, { key: 'ArrowDown' });
    fireEvent.keyDown(cityInput, { key: 'Enter' });

    // Simula seleção do nicho
    const nicheInput = comboboxes[2];
    fireEvent.change(nicheInput, { target: { value: 'Tecnologia' } });
    fireEvent.keyDown(nicheInput, { key: 'ArrowDown' });
    fireEvent.keyDown(nicheInput, { key: 'Enter' });

    // Avança para o próximo passo
    const nextButton2 = screen.getByText('Próximo');
    fireEvent.click(nextButton2);

    // Aguarda o carregamento do passo da filial
    await waitFor(() => {
      expect(screen.getByTestId('branch-name')).toBeInTheDocument();
    });

    // Preenche os dados da filial
    const branchNameInput = screen.getByTestId('branch-name');
    fireEvent.change(branchNameInput, { target: { value: 'Filial SP' } });

    // Avança para o próximo passo
    const nextButton3 = screen.getByText('Próximo');
    fireEvent.click(nextButton3);

    // Aguarda o carregamento do passo dos departamentos
    await waitFor(() => {
      expect(screen.getByText('Adicionar Departamento')).toBeInTheDocument();
    });

    // Adiciona um departamento
    const addDepartmentButton = screen.getByText('Adicionar Departamento');
    fireEvent.click(addDepartmentButton);

    // Preenche o nome do departamento
    const departmentNameInput = await screen.findByLabelText('wizard.departments.name');
    fireEvent.change(departmentNameInput, { target: { value: 'TI' } });

    // Preenche o e-mail do responsável
    const emailInputs = await screen.findAllByLabelText('E-mail do Responsável');
    fireEvent.change(emailInputs[0], { target: { value: 'ti@empresa.com' } });

    // Salva o departamento
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);

    // Aguarda o botão próximo ficar habilitado
    const nextButton4 = await screen.findByTestId('next-button');
    await waitFor(() => expect(nextButton4).not.toBeDisabled());
    fireEvent.click(nextButton4);

    // Aguarda o redirecionamento
    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith('/panel/dashboard');
      },
      { timeout: 3000 }
    );
  });
});
