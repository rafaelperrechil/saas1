'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  ListSubheader,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/common/LoadingScreen';

interface Branch {
  id: string;
  name: string;
  wizardCompleted: boolean;
}

interface Organization {
  id: string;
  name: string;
  profile: { id: string; name: string };
  branches: Branch[];
}

export default function BranchSelector() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedBranchObj, setSelectedBranchObj] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/branches/organization');
        const result = await response.json();

        if (result.error) {
          console.error('Erro ao carregar organizações:', result.error);
          return;
        }

        const orgsData: Organization[] = result.data || [];
        setOrganizations(orgsData);

        // Seleciona o branch atual da sessão, ou o primeiro disponível
        let branchId = session?.user?.branch?.id;
        let branchObj = null;
        let orgObj = null;
        if (!branchId && orgsData.length > 0) {
          orgObj = orgsData[0];
          branchObj = orgObj.branches[0];
          branchId = branchObj?.id;
        } else {
          for (const org of orgsData) {
            const found = org.branches.find((b) => b.id === branchId);
            if (found) {
              branchObj = found;
              orgObj = org;
              break;
            }
          }
        }
        setSelectedBranch(branchId || '');
        setSelectedBranchObj(branchObj);
        setSelectedOrg(orgObj);
      } catch (error) {
        console.error('Erro ao carregar organizações:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchOrganizations();
    }
    // eslint-disable-next-line
  }, [session]);

  const handleBranchChange = async (event: SelectChangeEvent<string>) => {
    setLoading(true);
    const branchId = event.target.value;
    setSelectedBranch(branchId);
    let branchObj = null;
    let orgObj = null;
    for (const org of organizations) {
      const found = org.branches.find((b) => b.id === branchId);
      if (found) {
        branchObj = found;
        orgObj = org;
        break;
      }
    }
    setSelectedBranchObj(branchObj);
    setSelectedOrg(orgObj);

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
        email: session?.user?.email,
        branchId: branchObj?.id,
        trigger: 'update',
      });

      // Recarrega a página para atualizar o estado global
      router.refresh();

      // Redireciona para o dashboard
      router.push('/panel/dashboard');
    } catch (error) {
      setLoading(false);
      console.error('Erro ao atualizar filial:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'primary.dark',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingScreen />
      </Box>
    );
  }

  if (loading || organizations.length === 0) {
    return null;
  }

  return (
    <FormControl size="small" sx={{ minWidth: 250 }}>
      <Select
        value={selectedBranch}
        onChange={handleBranchChange}
        displayEmpty
        renderValue={() =>
          selectedBranchObj && selectedOrg
            ? `${selectedBranchObj.name} — ${selectedOrg.name} (${selectedOrg.profile.name})`
            : t('Selecione uma filial')
        }
      >
        {organizations.map((org) => [
          <ListSubheader key={org.id}>{`${org.name} (${org.profile.name})`}</ListSubheader>,
          org.branches.map((branch) => (
            <MenuItem key={branch.id} value={branch.id} sx={{ pl: 4 }}>
              {branch.name}
            </MenuItem>
          )),
        ])}
      </Select>
    </FormControl>
  );
}
