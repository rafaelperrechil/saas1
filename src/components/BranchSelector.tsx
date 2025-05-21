'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  name: string;
  wizardCompleted: boolean;
}

export default function BranchSelector() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches/organization');
        const result = await response.json();

        if (result.error) {
          console.error('Erro ao carregar filiais:', result.error);
          return;
        }

        const branchesData = result.data || [];
        setBranches(branchesData);

        // Só define a filial selecionada depois que as filiais forem carregadas
        const currentBranchId = session?.user?.branch?.id;
        if (
          currentBranchId &&
          branchesData.some((branch: Branch) => branch.id === currentBranchId)
        ) {
          console.log('Definindo filial inicial:', currentBranchId);
          setSelectedBranch(currentBranchId);
        }
      } catch (error) {
        console.error('Erro ao carregar filiais:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchBranches();
    }
  }, [session]);

  const handleBranchChange = async (event: SelectChangeEvent<string>) => {
    const branchId = event.target.value;
    setSelectedBranch(branchId);

    try {
      const response = await fetch('/api/branches/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branchId }),
      });

      if (!response.ok) throw new Error('Erro ao trocar filial');

      const { branch } = await response.json();

      // Atualiza o JWT/session do NextAuth
      await signIn('credentials', {
        redirect: false,
        branch,
        trigger: 'update',
      });

      // Recarrega a página para atualizar o estado global
      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar filial:', error);
    }
  };

  if (loading) {
    return null;
  }

  if (branches.length === 0) {
    return null;
  }

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <Select
        value={selectedBranch}
        onChange={handleBranchChange}
        displayEmpty
        sx={{
          '& .MuiSelect-select': {
            py: 1,
          },
        }}
      >
        <MenuItem value="" disabled>
          {t('Selecione uma filial')}
        </MenuItem>
        {branches.map((branch) => (
          <MenuItem key={branch.id} value={branch.id}>
            {branch.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
