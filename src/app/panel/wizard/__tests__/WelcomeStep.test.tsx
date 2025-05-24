import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeStep from '@/components/wizard/steps/WelcomeStep';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';

describe('WelcomeStep', () => {
  const mockOnNext = jest.fn();

  beforeEach(() => {
    render(
      <I18nextProvider i18n={i18n}>
        <WelcomeStep onNext={mockOnNext} />
      </I18nextProvider>
    );
  });

  it('deve renderizar o título e descrição corretamente', () => {
    expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo ao assistente de configuração')).toBeInTheDocument();
  });

  it('deve chamar onNext quando o botão próximo for clicado', () => {
    const nextButton = screen.getByText('Próximo');
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('deve ter o botão próximo com a cor correta', () => {
    const nextButton = screen.getByText('Próximo');
    expect(nextButton).toHaveStyle({ backgroundColor: '#2AB7CA' });
  });
});
