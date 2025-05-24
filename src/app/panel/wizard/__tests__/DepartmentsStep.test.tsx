import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DepartmentsStep from '@/components/wizard/steps/DepartmentsStep';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';

describe('DepartmentsStep', () => {
  const mockData = [
    {
      id: 1,
      name: 'TI',
      responsibles: [{ email: 'ti@empresa.com', status: 'PENDING' }],
    },
  ];

  const mockOnChange = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    render(
      <I18nextProvider i18n={i18n}>
        <DepartmentsStep
          data={mockData}
          onChange={mockOnChange}
          onBack={mockOnBack}
          onNext={mockOnNext}
        />
      </I18nextProvider>
    );
  });

  it('deve renderizar a lista de departamentos', () => {
    expect(screen.getByText('TI')).toBeInTheDocument();
    expect(screen.getByText('ti@empresa.com')).toBeInTheDocument();
  });

  it('deve abrir o modal ao clicar em adicionar departamento', () => {
    const addButton = screen.getByRole('button', { name: /adicionar departamento/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Novo Departamento')).toBeInTheDocument();
  });

  it('deve validar e-mail inválido', async () => {
    const addButton = screen.getByRole('button', { name: /adicionar departamento/i });
    fireEvent.click(addButton);

    const emailInput = screen.getByRole('textbox', { name: /e-mail do responsável/i });
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });

    const addResponsibleButton = screen.getByRole('button', { name: /adicionar/i });
    fireEvent.click(addResponsibleButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('deve remover departamento', () => {
    const deleteButton = screen.getByRole('button', { name: /deletar departamento/i });
    fireEvent.click(deleteButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('deve chamar onBack quando o botão voltar for clicado', () => {
    const backButton = screen.getByRole('button', { name: /voltar/i });
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onNext quando o formulário for válido', () => {
    const nextButton = screen.getByRole('button', { name: /próximo/i });
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('deve validar departamento sem nome', async () => {
    const addButton = screen.getByRole('button', { name: /adicionar departamento/i });
    fireEvent.click(addButton);

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Nome do departamento é obrigatório')).toBeInTheDocument();
    });
  });
});
