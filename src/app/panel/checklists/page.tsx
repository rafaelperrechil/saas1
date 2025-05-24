'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import { getChecklistsByBranch } from '@/services/checklist.service';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

const fetcher = async (branchId: string) => {
  if (!branchId) return [];
  const data = await getChecklistsByBranch(branchId);
  return data || [];
};

export default function ChecklistListPage() {
  const { data: session } = useSession();
  const branchId = session?.user?.branch?.id;
  const {
    data: checklists = [],
    error,
    isLoading,
  } = useSWR(branchId ? ['checklists', branchId] : null, () => fetcher(branchId));

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Checklists
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href="/panel/checklists/add"
        >
          Novo Checklist
        </Button>
      </Box>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar checklists
        </Alert>
      )}
      {!isLoading && checklists.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
          <Typography color="text.secondary">
            Nenhum checklist cadastrado para esta filial.
          </Typography>
        </Paper>
      )}
      {!isLoading && checklists.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.dark' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ativo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklists.map((checklist: any) => (
                <TableRow key={checklist.id}>
                  <TableCell>{checklist.name}</TableCell>
                  <TableCell>{checklist.description}</TableCell>
                  <TableCell>{checklist.actived ? 'Sim' : 'Não'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => alert('Editar ' + checklist.id)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => alert('Excluir ' + checklist.id)}
                    >
                      <DeleteIcon />
                    </Button>
                    <Button
                      size="small"
                      color={checklist.actived ? 'success' : 'inherit'}
                      onClick={() => alert('Ativar/Desativar ' + checklist.id)}
                    >
                      {checklist.actived ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
