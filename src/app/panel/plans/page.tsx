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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Plan {
  id: string;
  name: string;
  price: number;
  includedUnits: number;
  maxUsers: number;
  extraUserPrice: number | null;
  maxChecklists: number | null;
  extraUnitPrice: number | null;
  isCustom: boolean;
}

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
}

export default function PlansPage() {
  const {
    data: plans,
    error: plansError,
    mutate: mutatePlans,
  } = useSWR<Plan[]>('/api/plans', fetcher);

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
      const url = selectedPlan ? `/api/plans/${selectedPlan.id}` : '/api/plans';
      const method = selectedPlan ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar plano');
      }
      await mutatePlans();
      handleCloseDialog();
      setSuccessMessage(
        selectedPlan ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!'
      );

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
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
      const response = await fetch(`/api/plans/${selectedPlan.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir plano');
      }
      await mutatePlans();
      handleCloseDeleteDialog();
      setSuccessMessage('Plano excluído com sucesso!');

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Unidades Incluídas</TableCell>
                <TableCell>Máx. Usuários</TableCell>
                <TableCell>Preço Usuário Extra</TableCell>
                <TableCell>Máx. Checklists</TableCell>
                <TableCell>Preço Unidade Extra</TableCell>
                <TableCell>Personalizado?</TableCell>
                <TableCell>Ações</TableCell>
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
                      <IconButton onClick={() => handleOpenDialog(plan)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton onClick={() => handleOpenDeleteDialog(plan)}>
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
