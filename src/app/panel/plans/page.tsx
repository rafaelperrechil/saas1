'use client';
import React from 'react';
import { useState } from 'react';
import useSWR from 'swr';
import {
  Box,
  Container,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { planService } from '@/services';
import { Plan } from '@/services/api.types';

interface PlanFormData {
  id?: string;
  name: string;
  price: number;
  includedUnits: number;
  maxUsers: number;
  extraUserPrice: number | null;
  maxChecklists: number | null;
  extraUnitPrice: number | null;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const fetcher = async (): Promise<Plan[]> => {
  const response = await planService.getPlans();
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

export default function PlansPage() {
  const {
    data: plans,
    error: plansError,
    mutate: mutatePlans,
  } = useSWR<Plan[]>('/api/plans', fetcher, {
    revalidateOnFocus: false,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: 0,
    includedUnits: 1,
    maxUsers: 1,
    extraUserPrice: null,
    maxChecklists: null,
    extraUnitPrice: null,
    isCustom: false,
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        includedUnits: plan.includedUnits,
        maxUsers: plan.maxUsers,
        extraUserPrice: plan.extraUserPrice,
        maxChecklists: plan.maxChecklists,
        extraUnitPrice: plan.extraUnitPrice,
        isCustom: plan.isCustom,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: '',
        price: 0,
        includedUnits: 1,
        maxUsers: 1,
        extraUserPrice: null,
        maxChecklists: null,
        extraUnitPrice: null,
        isCustom: false,
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlan(null);
    setFormData({
      name: '',
      price: 0,
      includedUnits: 1,
      maxUsers: 1,
      extraUserPrice: null,
      maxChecklists: null,
      extraUnitPrice: null,
      isCustom: false,
    });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const planData = {
        ...formData,
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = selectedPlan
        ? await planService.updatePlan(selectedPlan.id, planData)
        : await planService.createPlan(planData);

      if (response.data) {
        await mutatePlans();
        handleCloseDialog();
        setSuccessMessage(
          selectedPlan ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!'
        );

        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        throw new Error(response.error || 'Erro ao salvar plano');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPlan(null);
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    try {
      setIsDeleting(true);
      const response = await planService.deletePlan(selectedPlan.id);

      if (response.data) {
        await mutatePlans();
        handleCloseDeleteDialog();
        setSuccessMessage('Plano excluído com sucesso!');

        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        throw new Error(response.error || 'Erro ao excluir plano');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!plans) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (plansError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Erro ao carregar planos
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Planos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Plano
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Paper>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.dark' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Preço</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Unidades Incluídas
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Máx. Usuários</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Preço Usuário Extra
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Máx. Checklists</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Preço Unidade Extra
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Personalizado?</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.price}</TableCell>
                  <TableCell>{plan.includedUnits}</TableCell>
                  <TableCell>{plan.maxUsers}</TableCell>
                  <TableCell>{plan.extraUserPrice ?? '-'}</TableCell>
                  <TableCell>{plan.maxChecklists ?? '-'}</TableCell>
                  <TableCell>{plan.extraUnitPrice ?? '-'}</TableCell>
                  <TableCell>{plan.isCustom ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => handleOpenDialog(plan)}
                        sx={{
                          color: 'grey.600',
                          '&:hover': {
                            color: '#1976d2',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(plan)}
                        sx={{
                          color: 'grey.600',
                          '&:hover': {
                            color: 'error.main',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Dialog de criar/editar plano */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Nome"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isSaving}
          />
          <TextField
            margin="normal"
            label="Preço"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            disabled={isSaving}
          />
          <TextField
            margin="normal"
            label="Unidades Incluídas"
            type="number"
            fullWidth
            value={formData.includedUnits}
            onChange={(e) => setFormData({ ...formData, includedUnits: Number(e.target.value) })}
            disabled={isSaving}
          />
          <TextField
            margin="normal"
            label="Máx. Usuários"
            type="number"
            fullWidth
            value={formData.maxUsers}
            onChange={(e) => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
            disabled={isSaving}
          />
          <TextField
            margin="normal"
            label="Preço Usuário Extra"
            type="number"
            fullWidth
            value={formData.extraUserPrice ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                extraUserPrice: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            disabled={isSaving}
          />
          <TextField
            margin="normal"
            label="Máx. Checklists"
            type="number"
            fullWidth
            value={formData.maxChecklists ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxChecklists: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            disabled={isSaving}
          />
          <TextField
            margin="normal"
            label="Preço Unidade Extra"
            type="number"
            fullWidth
            value={formData.extraUnitPrice ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                extraUnitPrice: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            disabled={isSaving}
          />
          <Box sx={{ mt: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.isCustom}
                onChange={(e) => setFormData({ ...formData, isCustom: e.target.checked })}
                disabled={isSaving}
              />{' '}
              Personalizado
            </label>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de confirmação de exclusão */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Excluir Plano</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir o plano "{selectedPlan?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
