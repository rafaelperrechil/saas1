import React from 'react';
// Mock do next/navigation ANTES de importar o componente
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(() => Promise.resolve()),
  }),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnvironmentsStep from '@/components/wizard/steps/EnvironmentsStep';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';
import { wizardService } from '@/services';

// Mock do serviço do wizard
jest.mock('@/services/wizard.service', () => ({
  wizardService: {
    saveWizardData: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ data: { success: true } })),
  },
}));

// Mock do next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '123',
      },
    },
  }),
}));

// Mock do hook useTranslation do react-i18next
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'wizard.environments.title': 'Ambientes',
        'wizard.environments.subtitle': 'Configure os ambientes da sua organização',
        'wizard.environments.addEnvironment': 'Adicionar Ambiente',
        'wizard.environments.finish': 'Finalizar',
        'wizard.environments.back': 'Voltar',
        'wizard.environments.errors.emptyNames': 'Preencha todos os nomes',
        'wizard.environments.errors.duplicateNames': 'Nome duplicado',
        'wizard.environments.errors.noEnvironments': 'Adicione pelo menos um ambiente',
        'common.saving': 'Salvando...',
        'common.back': 'Voltar',
        'common.finish': 'Finalizar',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'pt',
      changeLanguage: jest.fn(),
    },
  }),
}));

const mockWizardData = {
  organization: {
    name: 'Empresa Teste',
    employeesCount: '100',
    country: 'Brasil',
    city: 'São Paulo',
    nicheId: '1',
  },
  branch: {
    name: 'Filial Principal',
  },
  departments: [
    {
      name: 'TI',
      responsibles: [{ email: 'ti@empresa.com', status: 'PENDING' }],
    },
  ],
};

function Wrapper({ initialData, onBack = jest.fn(), onNext = jest.fn() }) {
  const [envs, setEnvs] = React.useState(initialData);
  return (
    <I18nextProvider i18n={i18n}>
      <EnvironmentsStep
        data={envs}
        onChange={setEnvs}
        onBack={onBack}
        onNext={onNext}
        wizardData={mockWizardData}
      />
    </I18nextProvider>
  );
}

describe('EnvironmentsStep', () => {
  const initialData = [
    { id: 1, name: 'Produção' },
    { id: 2, name: 'Homologação' },
  ];

  it('deve renderizar a lista de ambientes', () => {
    render(<Wrapper initialData={initialData} />);
    expect(screen.getByDisplayValue('Produção')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Homologação')).toBeInTheDocument();
  });

  it('deve adicionar novo ambiente', () => {
    render(<Wrapper initialData={initialData} />);
    const addButton = screen.getByRole('button', { name: 'Adicionar Ambiente' });
    fireEvent.click(addButton);
    expect(screen.getAllByPlaceholderText('Nome do ambiente').length).toBe(3);
  });

  it('deve remover ambiente', async () => {
    render(<Wrapper initialData={initialData} />);
    const deleteButtons = screen.getAllByRole('button');
    // O terceiro botão é o de deletar do primeiro ambiente
    fireEvent.click(deleteButtons[2]);
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Produção')).toBeNull();
    });
  });

  it('deve validar ambiente sem nome', async () => {
    render(<Wrapper initialData={initialData} />);
    const addButton = screen.getByRole('button', { name: 'Adicionar Ambiente' });
    fireEvent.click(addButton);
    const nextButton = screen.getByRole('button', { name: 'Finalizar' });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText('Preencha todos os nomes')).toBeInTheDocument();
    });
  });

  it('deve validar nomes duplicados', async () => {
    render(<Wrapper initialData={initialData} />);
    const addButton = screen.getByRole('button', { name: 'Adicionar Ambiente' });
    fireEvent.click(addButton);
    // Preencher o novo ambiente com nome duplicado
    const inputs = screen.getAllByPlaceholderText('Nome do ambiente');
    fireEvent.change(inputs[2], { target: { value: 'Produção' } });
    const nextButton = screen.getByRole('button', { name: 'Finalizar' });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText('Nome duplicado')).toBeInTheDocument();
    });
  });

  it('deve chamar onBack quando o botão voltar for clicado', () => {
    const onBack = jest.fn();
    render(<Wrapper initialData={initialData} onBack={onBack} />);
    const backButton = screen.getByRole('button', { name: 'Voltar' });
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('deve salvar dados e chamar onNext quando concluído', async () => {
    const onNext = jest.fn();
    render(<Wrapper initialData={initialData} onNext={onNext} />);
    const nextButton = screen.getByRole('button', { name: 'Finalizar' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(wizardService.saveWizardData).toHaveBeenCalledWith(
        expect.objectContaining({
          organization: mockWizardData.organization,
          branch: mockWizardData.branch,
          departments: mockWizardData.departments,
          environments: expect.arrayContaining([
            expect.objectContaining({ name: 'Produção' }),
            expect.objectContaining({ name: 'Homologação' }),
          ]),
        })
      );
    });

    await waitFor(() => {
      expect(onNext).toHaveBeenCalled();
    });
  });

  it('deve mostrar erro quando falhar ao salvar', async () => {
    const errorMessage = 'Erro ao salvar';
    const { wizardService } = require('@/services/wizard.service');
    (wizardService.saveWizardData as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<Wrapper initialData={initialData} />);
    const nextButton = screen.getByRole('button', { name: 'Finalizar' });
    fireEvent.click(nextButton);

    await waitFor(
      () => {
        expect(screen.getByText((content) => content.includes(errorMessage))).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
