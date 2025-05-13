'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  name: string;
  wizardCompleted: boolean;
}

export default function BranchSelector() {
  const { data: session, update } = useSession();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    // Carregar as filiais da organização do usuário
    const fetchBranches = async () => {
      try {
        const response = await fetch(`/api/branches/organization`);
        const data: Branch[] = await response.json();
        console.log('Filiais carregadas:', data);
        setBranches(data);

        // Só define a filial selecionada depois que as filiais forem carregadas
        const currentBranchId = session?.user?.branch?.id;
        if (currentBranchId && data.some((branch) => branch.id === currentBranchId)) {
          console.log('Definindo filial inicial:', currentBranchId);
          setSelectedBranch(currentBranchId);
        }
      } catch (error) {
        console.error('Erro ao carregar filiais:', error);
      }
    };

    if (session?.user) {
      fetchBranches();
    }
  }, [session]);

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const branchId = event.target.value;
    console.log('Tentando selecionar filial:', branchId);

    try {
      const response = await fetch('/api/branches/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branchId }),
      });

      if (!response.ok) throw new Error('Erro ao trocar filial');

      const branchData: Branch = await response.json();
      console.log('Dados da filial recebidos:', branchData);

      // Primeiro atualiza o estado local
      setSelectedBranch(branchData.id);
      console.log('Estado local atualizado para:', branchData.id);

      // Depois atualiza a sessão com todos os dados da filial
      if (session?.user) {
        const result = await update({
          ...session,
          user: {
            ...session.user,
            branch: branchData,
          },
        });
        console.log('Resultado da atualização da sessão:', result);

        // Redireciona para o wizard se necessário
        if (!branchData.wizardCompleted) {
          router.push('/panel/wizard');
        } else {
          router.push('/panel/dashboard');
        }
      }
    } catch (error) {
      console.error('Erro ao trocar filial:', error);
      // Reverter a seleção em caso de erro
      const currentBranchId = session?.user?.branch?.id;
      if (currentBranchId && branches.some((branch) => branch.id === currentBranchId)) {
        setSelectedBranch(currentBranchId);
      } else {
        setSelectedBranch('');
      }
    }
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <Select
        value={selectedBranch}
        onChange={handleChange}
        displayEmpty
        sx={{
          backgroundColor: 'white',
          '& .MuiSelect-select': {
            py: 1,
          },
        }}
      >
        <MenuItem disabled value="">
          {t('wizard.branch.select')}
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
