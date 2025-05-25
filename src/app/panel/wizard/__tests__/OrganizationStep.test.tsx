import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrganizationStep from '@/components/wizard/steps/OrganizationStep';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';
import { nicheService } from '@/services';

// Mock do serviço de nichos
jest.mock('@/services', () => ({
  nicheService: {
    getNiches: jest.fn(),
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
    jest.clearAllMocks();
    // Mock da resposta do serviço de nichos SEMPRE retorna array
    (nicheService.getNiches as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Saúde' },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
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
