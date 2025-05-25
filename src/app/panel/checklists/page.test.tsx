import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChecklistListPage from './page';
import { getChecklistsByBranch, toggleChecklistStatus } from '@/services/checklist.service';
import useSWR from 'swr';

// Mock das dependências
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('@/services/checklist.service');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
jest.mock('swr');

describe('ChecklistListPage', () => {
  const mockSession = {
    user: {
      branch: {
        id: 'branch-1',
      },
    },
  };

  const mockChecklists = [
    {
      id: '1',
      name: 'Checklist 1',
      description: 'Descrição 1',
      itemCount: 5,
      completedExecutionsCount: 2,
      actived: true,
    },
    {
      id: '2',
      name: 'Checklist 2',
      description: 'Descrição 2',
      itemCount: 3,
      completedExecutionsCount: 1,
      actived: false,
    },
  ];

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: mockSession });
    (getChecklistsByBranch as jest.Mock).mockResolvedValue(mockChecklists);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a tabela de checklists quando houver dados', async () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [
        {
          id: '1',
          name: 'Checklist 1',
          description: 'Descrição 1',
          itemCount: 5,
          completedExecutionsCount: 2,
          actived: true,
        },
        {
          id: '2',
          name: 'Checklist 2',
          description: 'Descrição 2',
          itemCount: 3,
          completedExecutionsCount: 1,
          actived: false,
        },
      ],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<ChecklistListPage />);

    await waitFor(() => {
      expect(screen.getByText('Checklist 1')).toBeInTheDocument();
      expect(screen.getByText('Checklist 2')).toBeInTheDocument();
    });
  });

  it('deve mostrar loading spinner durante o carregamento', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    });
    render(<ChecklistListPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('deve chamar getChecklistsByBranch com o branchId correto', async () => {
    (useSWR as jest.Mock).mockImplementation((key, fetcher) => {
      if (fetcher) fetcher('branch-1');
      return {
        data: [
          {
            id: '1',
            name: 'Checklist 1',
            description: 'Descrição 1',
            itemCount: 5,
            completedExecutionsCount: 2,
            actived: true,
          },
          {
            id: '2',
            name: 'Checklist 2',
            description: 'Descrição 2',
            itemCount: 3,
            completedExecutionsCount: 1,
            actived: false,
          },
        ],
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      };
    });

    render(<ChecklistListPage />);

    await waitFor(() => {
      expect(getChecklistsByBranch).toHaveBeenCalledWith('branch-1');
    });
  });

  it('deve atualizar a lista após toggle de status', async () => {
    (toggleChecklistStatus as jest.Mock).mockResolvedValueOnce({});

    render(<ChecklistListPage />);

    await waitFor(() => {
      expect(screen.getByText('Checklist 1')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: 'checklists.tooltips.deactivate' });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleChecklistStatus).toHaveBeenCalledWith('1');
      expect(getChecklistsByBranch).toHaveBeenCalledTimes(2);
    });
  });

  it('deve mostrar mensagem de sucesso após toggle de status', async () => {
    (toggleChecklistStatus as jest.Mock).mockResolvedValueOnce({});

    render(<ChecklistListPage />);

    await waitFor(() => {
      expect(screen.getByText('Checklist 1')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: 'checklists.tooltips.deactivate' });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('checklists.success.statusUpdated')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem de erro quando o toggle falhar', async () => {
    (toggleChecklistStatus as jest.Mock).mockRejectedValueOnce(new Error('Erro ao atualizar'));

    render(<ChecklistListPage />);

    await waitFor(() => {
      expect(screen.getByText('Checklist 1')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: 'checklists.tooltips.deactivate' });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('checklists.error.statusUpdateError')).toBeInTheDocument();
    });
  });
});
