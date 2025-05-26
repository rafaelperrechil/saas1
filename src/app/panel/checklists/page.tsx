'use client';
import React, { useState } from 'react';
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
  Modal,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import {
  getChecklistsByBranch,
  toggleChecklistStatus,
  getChecklistById,
} from '@/services/checklist.service';
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
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  const {
    data: checklists = [],
    error,
    isLoading,
    mutate,
  } = useSWR(branchId ? ['checklists', branchId] : null, () => (branchId ? fetcher(branchId) : []));

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const router = useRouter();

  const handleChecklistClick = async (checklistId: string) => {
    try {
      setLoadingChecklist(true);
      const checklist = await getChecklistById(checklistId);
      setSelectedChecklist(checklist);
      setModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes do checklist:', error);
      setErrorMessage(t('checklists.error.loadDetailsError'));
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedChecklist(null);
  };

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
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: '#f5f5f5',
            border: '1px dashed #ccc',
            mt: 2,
          }}
        >
          <Typography color="textSecondary">
            Nenhum checklist cadastrado para esta filial.
          </Typography>
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
                    <Button
                      onClick={() => handleChecklistClick(checklist.id)}
                      sx={{ textTransform: 'none', color: 'inherit' }}
                    >
                      {checklist.name}
                    </Button>
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

      <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="checklist-details-modal">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 800,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflow: 'auto',
          }}
        >
          {loadingChecklist ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedChecklist ? (
            <>
              <Typography variant="h5" gutterBottom>
                {t('checklists.details.title')}
              </Typography>
              {selectedChecklist.description && (
                <Typography color="text.secondary" paragraph>
                  {selectedChecklist.description}
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              {selectedChecklist.sections.map((section: any) => (
                <Box key={section.id} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {section.name}
                  </Typography>
                  {section.items.map((item: any) => (
                    <Card key={item.id} sx={{ mb: 1 }}>
                      <CardContent
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="body1">{item.name}</Typography>
                          {item.description && (
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Typography variant="body2" color="success.main">
                            {item.checklistResponseType.positiveLabel}
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            {item.checklistResponseType.negativeLabel}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleCloseModal}>{t('checklists.details.close')}</Button>
              </Box>
            </>
          ) : null}
        </Box>
      </Modal>

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
