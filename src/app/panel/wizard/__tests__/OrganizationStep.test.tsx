import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrganizationStep from '@/components/wizard/steps/OrganizationStep';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';
import { nicheService } from '@/services';

// Mock do serviço de nichos
jest.mock('@/services', () => ({
  nicheService: {
    getNiches: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('OrganizationStep', () => {
  const mockData = {
    name: '',
    employeesCount: '',
    country: '',
    city: '',
    nicheId: '',
  };

  const mockOnChange = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    // Mock da resposta do serviço de nichos SEMPRE retorna array
    (nicheService.getNiches as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Saúde' },
      ],
    });
  });

  function renderComponent(props = {}) {
    render(
      <I18nextProvider i18n={i18n}>
        <OrganizationStep
          data={mockData}
          onChange={mockOnChange}
          onBack={mockOnBack}
          onNext={mockOnNext}
          {...props}
        />
      </I18nextProvider>
    );
  }

  it('deve renderizar todos os campos do formulário', async () => {
    renderComponent();
    expect(screen.getByTestId('organization-name')).toBeInTheDocument();
    expect(screen.getByTestId('employees-count')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('País')).toBeInTheDocument();
      expect(screen.getByText('Cidade')).toBeInTheDocument();
      expect(screen.getByText('Nicho')).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios', async () => {
    renderComponent();
    const nextButton = screen.getByText('Próximo');
    fireEvent.click(nextButton);

    // Espera pela mensagem de erro do nome
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).toBeInTheDocument();
    });
    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Nome da organização é obrigatório'
    );

    // Preenche o nome e tenta novamente
    fireEvent.change(screen.getByTestId('organization-name'), {
      target: { value: 'Empresa Teste' },
    });
    await waitFor(() => {
      expect(screen.getByTestId('organization-name')).toHaveValue('Empresa Teste');
    });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Número de funcionários é obrigatório'
      );
    });

    // Preenche o número de funcionários e tenta novamente
    fireEvent.change(screen.getByTestId('employees-count'), { target: { value: '10' } });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('País é obrigatório');
    });

    // Simula seleção do país
    const comboboxes = screen.getAllByRole('combobox');
    const countryInput = comboboxes[0];
    fireEvent.change(countryInput, { target: { value: 'Brasil' } });
    fireEvent.keyDown(countryInput, { key: 'ArrowDown' });
    fireEvent.keyDown(countryInput, { key: 'Enter' });

    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Cidade é obrigatória');
    });

    // Simula seleção da cidade
    const cityInput = comboboxes[1];
    fireEvent.change(cityInput, { target: { value: 'São Paulo' } });
    fireEvent.keyDown(cityInput, { key: 'ArrowDown' });
    fireEvent.keyDown(cityInput, { key: 'Enter' });

    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Nicho é obrigatório');
    });

    // Simula seleção do nicho
    const nicheInput = comboboxes[2];
    fireEvent.change(nicheInput, { target: { value: 'Tecnologia' } });
    fireEvent.keyDown(nicheInput, { key: 'ArrowDown' });
    fireEvent.keyDown(nicheInput, { key: 'Enter' });

    // Agora todos os campos estão preenchidos, o próximo clique deve chamar onNext
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('deve atualizar o estado quando os campos são preenchidos', () => {
    renderComponent();
    const nameInput = screen.getByTestId('organization-name');
    fireEvent.change(nameInput, { target: { value: 'Minha Empresa' } });
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Minha Empresa' }));

    const employeesInput = screen.getByTestId('employees-count');
    fireEvent.change(employeesInput, { target: { value: '100' } });
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ employeesCount: '100' }));
  });

  it('deve chamar onBack quando o botão voltar for clicado', () => {
    renderComponent();
    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('deve carregar e exibir os nichos corretamente', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Nicho')).toBeInTheDocument();
    });
  });

  it('deve estar em modo somente leitura quando readOnly for true', () => {
    renderComponent({ readOnly: true });
    const nameInput = screen.getByTestId('organization-name');
    expect(nameInput).toBeDisabled();
  });
});
