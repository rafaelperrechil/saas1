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
  Snackbar,
  Tooltip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import { getChecklistsByBranch, toggleChecklistStatus } from '@/services/checklist.service';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const fetcher = async (branchId: string) => {
  if (!branchId) return [];
  const data = await getChecklistsByBranch(branchId);
  return data || [];
};

export default function ChecklistListPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const branchId = session?.user?.branch?.id;
  const {
    data: checklists = [],
    error,
    isLoading,
    mutate,
  } = useSWR(branchId ? ['checklists', branchId] : null, () => (branchId ? fetcher(branchId) : []));

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const router = useRouter();
  const handleToggleStatus = async (checklistId: string) => {
    try {
      await toggleChecklistStatus(checklistId);
      await mutate();
      setSuccessMessage(t('checklists.success.statusUpdated'));
    } catch (error) {
      console.error('Erro ao atualizar status do checklist:', error);
      setErrorMessage(t('checklists.error.statusUpdateError'));
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('checklists.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href="/panel/checklists/add"
        >
          {t('checklists.newChecklist')}
        </Button>
      </Box>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('checklists.error.loadError')}
        </Alert>
      )}
      {!isLoading && checklists.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
          <Typography color="text.secondary">{t('checklists.noChecklists')}</Typography>
        </Paper>
      )}
      {!isLoading && checklists.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.dark' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  {t('checklists.table.name')}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  {t('checklists.table.description')}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                  {t('checklists.table.questionsCount')}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                  {t('checklists.table.responses')}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                  {t('checklists.table.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklists.map((checklist: any) => (
                <TableRow key={checklist.id}>
                  <TableCell>
                    <Link
                      href={`/panel/checklists/edit/${checklist.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {checklist.name}
                    </Link>
                  </TableCell>
                  <TableCell>{checklist.description}</TableCell>
                  <TableCell align="center">{checklist.itemCount}</TableCell>
                  <TableCell align="center">{checklist.completedExecutionsCount}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('checklists.tooltips.edit')}>
                      <IconButton
                        onClick={() => router.push(`/panel/checklists/edit/${checklist.id}`)}
                        sx={{
                          color: 'grey.600',
                          '&:hover': {
                            color: '#1976d2',
                          },
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        checklist.actived
                          ? t('checklists.tooltips.deactivate')
                          : t('checklists.tooltips.activate')
                      }
                    >
                      <IconButton
                        onClick={() => handleToggleStatus(checklist.id)}
                        sx={{
                          color: checklist.actived ? 'success.main' : 'grey.600',
                          '&:hover': {
                            color: checklist.actived ? 'grey.600' : 'success.main',
                          },
                        }}
                        size="small"
                      >
                        {checklist.actived ? <ToggleOnIcon /> : <ToggleOffIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
