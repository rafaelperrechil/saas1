import { render, screen, fireEvent } from '@testing-library/react';
import UnitStep from '@/components/wizard/steps/UnitStep';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';

describe('UnitStep', () => {
  const mockData = {
    name: '',
  };

  const mockOnChange = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    render(
      <I18nextProvider i18n={i18n}>
        <UnitStep data={mockData} onChange={mockOnChange} onBack={mockOnBack} onNext={mockOnNext} />
      </I18nextProvider>
    );
  });

  it('deve renderizar o campo de nome da filial', () => {
    expect(screen.getByTestId('branch-name')).toBeInTheDocument();
  });

  it('deve atualizar o estado quando o campo é preenchido', () => {
    const nameInput = screen.getByTestId('branch-name');
    fireEvent.change(nameInput, { target: { value: 'Filial Principal' } });
    expect(mockOnChange).toHaveBeenCalledWith({ name: 'Filial Principal' });
  });

  it('deve chamar onBack quando o botão voltar for clicado', () => {
    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onNext quando o formulário for válido', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <UnitStep
          data={{ name: 'Filial Principal' }}
          onChange={mockOnChange}
          onBack={mockOnBack}
          onNext={mockOnNext}
        />
      </I18nextProvider>
    );
    const nextButton = screen.getByText('Próximo');
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar o botão próximo se o campo estiver vazio', () => {
    const nextButton = screen.getByText('Próximo');
    expect(nextButton).toBeDisabled();
  });
});
