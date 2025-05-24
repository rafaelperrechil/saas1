'use client';
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { environmentService } from '@/services';
import { Environment } from '@/services/api.types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LoadingScreen from '@/components/common/LoadingScreen';

interface EnvironmentFormData {
  id?: string;
  name: string;
  position: number;
}

const fetcher = async (): Promise<Environment[]> => {
  const response = await environmentService.getEnvironments();
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

// Componente de linha arrastável
function SortableTableRow({
  environment,
  onEdit,
  onDelete,
}: {
  environment: Environment;
  onEdit: (environment: Environment) => void;
  onDelete: (environment: Environment) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: environment.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            sx={{ cursor: 'move', padding: 0.5 }}
          >
            <DragIndicatorIcon />
          </IconButton>
          {environment.name}
        </Box>
      </TableCell>
      <TableCell align="right">
        <Tooltip title={t('environments.tooltips.edit')}>
          <IconButton
            onClick={() => onEdit(environment)}
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
        <Tooltip title={t('environments.tooltips.delete')}>
          <IconButton
            onClick={() => onDelete(environment)}
            sx={{
              color: 'grey.600',
              '&:hover': {
                color: 'error.main',
              },
            }}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default function EnvironmentsPage() {
  const { t } = useTranslation();
  const {
    data: environments = [],
    error: environmentsError,
    mutate: mutateEnvironments,
  } = useSWR<Environment[]>('/api/environments', fetcher);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<EnvironmentFormData>({
    name: '',
    position: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      try {
        const oldIndex = environments.findIndex((env) => env.id === active.id);
        const newIndex = environments.findIndex((env) => env.id === over.id);

        // Criar nova lista com a ordem atualizada
        const newEnvironments = arrayMove(environments, oldIndex, newIndex);

        // Atualizar as posições no backend primeiro
        await Promise.all(
          newEnvironments.map((env, index) =>
            environmentService.updateEnvironment(env.id, {
              name: env.name,
              position: index + 1,
            })
          )
        );

        // Atualizar o estado local com a nova ordem
        await mutateEnvironments(newEnvironments, { revalidate: false });

        setSuccessMessage(t('environments.success.orderUpdated'));
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } catch (error: any) {
        console.error('Erro ao atualizar ordem:', error);
        setError(error.message || t('environments.error.updateOrder'));
        // Forçar revalidação em caso de erro
        mutateEnvironments();
      }
    }
  };

  const handleOpenDialog = (environment?: Environment) => {
    if (environment) {
      setSelectedEnvironment(environment);
      setFormData({
        id: environment.id,
        name: environment.name,
        position: environment.position,
      });
    } else {
      setSelectedEnvironment(null);
      setFormData({
        name: '',
        position: environments.length + 1,
      });
    }
    setOpenDialog(true);
    setError('');
  };

  useEffect(() => {
    if (openDialog) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [openDialog]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEnvironment(null);
    setFormData({
      name: '',
      position: environments.length + 1,
    });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError(t('environments.error.nameRequired'));
        return;
      }

      setIsLoading(true);
      setError('');

      const data = {
        name: formData.name.trim(),
        position: selectedEnvironment ? selectedEnvironment.position : environments.length + 1,
      };

      const response = selectedEnvironment
        ? await environmentService.updateEnvironment(selectedEnvironment.id, data)
        : await environmentService.createEnvironment(data);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateEnvironments();
      handleCloseDialog();
      setSuccessMessage(
        selectedEnvironment ? t('environments.success.updated') : t('environments.success.created')
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteDialog = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEnvironment(null);
  };

  const handleDelete = async () => {
    if (!selectedEnvironment) return;

    try {
      setIsDeleteLoading(true);
      const response = await environmentService.deleteEnvironment(selectedEnvironment.id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateEnvironments();
      handleCloseDeleteDialog();
      setSuccessMessage(t('environments.success.deleted'));

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (environmentsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t('environments.error.loadData')}
      </Alert>
    );
  }

  if (!environments) {
    return <LoadingScreen />;
  }

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('environments.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('environments.newEnvironment')}
        </Button>
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.dark' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  {t('environments.name')}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                  {t('environments.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <SortableContext items={environments.map((env) => env.id)}>
                {environments.map((environment) => (
                  <SortableTableRow
                    key={environment.id}
                    environment={environment}
                    onEdit={handleOpenDialog}
                    onDelete={handleOpenDeleteDialog}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>

      {/* Dialog para criar/editar ambiente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogTitle>
            {selectedEnvironment
              ? t('environments.editEnvironment')
              : t('environments.newEnvironment')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('environments.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                inputRef={nameInputRef}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? t('environments.error.nameRequired') : ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('environments.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? <CircularProgress size={24} /> : t('environments.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('environments.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('environments.confirmDeleteMessage', { name: selectedEnvironment?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>{t('environments.cancel')}</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={isDeleteLoading}
          >
            {isDeleteLoading ? <CircularProgress size={24} /> : t('environments.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
