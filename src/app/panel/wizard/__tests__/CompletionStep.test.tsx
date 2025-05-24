import { render, screen } from '@testing-library/react';
import CompletionStep from '@/components/wizard/steps/CompletionStep';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test';

describe('CompletionStep', () => {
  beforeEach(() => {
    render(
      <I18nextProvider i18n={i18n}>
        <CompletionStep />
      </I18nextProvider>
    );
  });

  it('deve renderizar o ícone de sucesso', () => {
    const icon = screen.getByTestId('CheckCircleOutlineIcon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: '#2AB7CA' });
  });

  it('deve renderizar o título de conclusão', () => {
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('deve renderizar a mensagem de sucesso', () => {
    expect(screen.getByText('Configuração concluída com sucesso')).toBeInTheDocument();
  });

  it('deve renderizar a mensagem de redirecionamento', () => {
    expect(screen.getByText('Redirecionando...')).toBeInTheDocument();
  });

  it('deve ter o alerta de sucesso com a cor correta', () => {
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-colorSuccess');
  });
});
