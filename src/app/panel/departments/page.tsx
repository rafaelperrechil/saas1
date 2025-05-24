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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import { departmentService, Department } from '@/services/department.service';
import { useSession } from 'next-auth/react';
import LoadingScreen from '@/components/common/LoadingScreen';

interface DepartmentFormData {
  id?: string;
  name: string;
  branchId: string;
}

interface ResponsibleFormData {
  name: string;
  email: string;
}

const fetcher = async (branchId: string): Promise<Department[]> => {
  const response = await departmentService.getDepartments(branchId);
  if (response.error) {
    throw new Error(response.error);
  }
  return Array.isArray(response.data) ? response.data : [];
};

export default function DepartmentsPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const branchId = session?.user?.branch?.id;

  const {
    data: departments = [],
    error: departmentsError,
    mutate: mutateDepartments,
  } = useSWR<Department[]>(branchId ? ['/api/departments', branchId] : null, () =>
    fetcher(branchId!)
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    branchId: branchId || '',
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const [openResponsibleDialog, setOpenResponsibleDialog] = useState(false);
  const [selectedDepartmentForResponsible, setSelectedDepartmentForResponsible] =
    useState<Department | null>(null);
  const [responsibleFormData, setResponsibleFormData] = useState<ResponsibleFormData>({
    name: '',
    email: '',
  });
  const [isResponsibleLoading, setIsResponsibleLoading] = useState(false);
  const [openDeleteResponsibleDialog, setOpenDeleteResponsibleDialog] = useState(false);
  const [selectedResponsible, setSelectedResponsible] = useState<any>(null);

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setSelectedDepartment(department);
      setFormData({
        id: department.id,
        name: department.name,
        branchId: department.branchId,
      });
    } else {
      setSelectedDepartment(null);
      setFormData({
        name: '',
        branchId: branchId || '',
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
    setSelectedDepartment(null);
    setFormData({
      name: '',
      branchId: branchId || '',
    });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError(t('departments.error.nameRequired'));
        return;
      }

      setIsLoading(true);
      setError('');

      const data = {
        name: formData.name.trim(),
        branchId: formData.branchId,
      };

      const response = selectedDepartment
        ? await departmentService.updateDepartment(selectedDepartment.id, data)
        : await departmentService.createDepartment(data);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateDepartments();
      handleCloseDialog();
      setSuccessMessage(
        selectedDepartment ? t('departments.success.updated') : t('departments.success.created')
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

  const handleOpenDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedDepartment(null);
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;

    try {
      setIsDeleteLoading(true);
      const response = await departmentService.deleteDepartment(selectedDepartment.id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateDepartments();
      handleCloseDeleteDialog();
      setSuccessMessage(t('departments.success.deleted'));

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleOpenResponsibleDialog = (department: Department) => {
    setSelectedDepartmentForResponsible(department);
    setResponsibleFormData({
      name: '',
      email: '',
    });
    setOpenResponsibleDialog(true);
  };

  const handleCloseResponsibleDialog = () => {
    setOpenResponsibleDialog(false);
    setSelectedDepartmentForResponsible(null);
    setResponsibleFormData({
      name: '',
      email: '',
    });
  };

  const handleSubmitResponsible = async () => {
    if (!selectedDepartmentForResponsible) return;

    try {
      setIsResponsibleLoading(true);
      setError('');

      const response = await departmentService.addResponsible(
        selectedDepartmentForResponsible.id,
        responsibleFormData
      );

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateDepartments();
      handleCloseResponsibleDialog();
      setSuccessMessage(t('departments.success.responsibleAdded'));

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsResponsibleLoading(false);
    }
  };

  const handleOpenDeleteResponsibleDialog = (responsible: any, department: Department) => {
    setSelectedResponsible(responsible);
    setSelectedDepartmentForResponsible(department);
    setOpenDeleteResponsibleDialog(true);
  };

  const handleCloseDeleteResponsibleDialog = () => {
    setOpenDeleteResponsibleDialog(false);
    setSelectedResponsible(null);
    setSelectedDepartmentForResponsible(null);
  };

  const handleDeleteResponsible = async () => {
    if (!selectedResponsible || !selectedDepartmentForResponsible) return;

    try {
      setIsDeleteLoading(true);
      const response = await departmentService.removeResponsible(
        selectedDepartmentForResponsible.id,
        selectedResponsible.id
      );

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateDepartments();
      handleCloseDeleteResponsibleDialog();
      setSuccessMessage(t('departments.success.responsibleRemoved'));

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (!branchId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t('departments.error.noBranch')}
      </Alert>
    );
  }

  if (departmentsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t('departments.error.loadData')}
      </Alert>
    );
  }

  if (!departments || !Array.isArray(departments)) {
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
          {t('departments.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('departments.newDepartment')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.dark' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                {t('departments.name')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                {t('departments.responsibles')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                {t('departments.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.name}</TableCell>
                <TableCell>
                  {department.responsibles && department.responsibles.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
                      {department.responsibles.map((responsible) => (
                        <Box
                          key={responsible.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            border: '1px solid black',
                            borderRadius: '4px',
                            padding: '8px',
                            background: '#ebebeb',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {responsible.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="small"
                              display="block"
                              fontSize="0.85em"
                              color="text.secondary"
                            >
                              {responsible.email}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleOpenDeleteResponsibleDialog(responsible, department)
                            }
                            sx={{
                              padding: '2px',
                              '&:hover': {
                                color: 'error.main',
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('departments.noResponsibles')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t('departments.tooltips.addResponsible')}>
                    <IconButton
                      onClick={() => handleOpenResponsibleDialog(department)}
                      sx={{
                        color: 'grey.600',
                        '&:hover': {
                          color: 'success.main',
                        },
                      }}
                      size="small"
                    >
                      <PersonAddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('departments.tooltips.edit')}>
                    <IconButton
                      onClick={() => handleOpenDialog(department)}
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
                  <Tooltip title={t('departments.tooltips.delete')}>
                    <IconButton
                      onClick={() => handleOpenDeleteDialog(department)}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para criar/editar departamento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogTitle>
            {selectedDepartment ? t('departments.editDepartment') : t('departments.newDepartment')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('departments.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                inputRef={nameInputRef}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? t('departments.error.nameRequired') : ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('departments.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? <CircularProgress size={24} /> : t('departments.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('departments.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('departments.confirmDeleteMessage', { name: selectedDepartment?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>{t('departments.cancel')}</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={isDeleteLoading}
          >
            {isDeleteLoading ? <CircularProgress size={24} /> : t('departments.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar responsável */}
      <Dialog
        open={openResponsibleDialog}
        onClose={handleCloseResponsibleDialog}
        maxWidth="sm"
        fullWidth
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitResponsible();
          }}
        >
          <DialogTitle>{t('departments.addResponsible')}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('departments.responsibleName')}
                value={responsibleFormData.name}
                onChange={(e) =>
                  setResponsibleFormData({ ...responsibleFormData, name: e.target.value })
                }
                margin="normal"
                required
                error={!responsibleFormData.name.trim()}
                helperText={
                  !responsibleFormData.name.trim() ? t('departments.error.nameRequired') : ''
                }
              />
              <TextField
                fullWidth
                label={t('departments.responsibleEmail')}
                value={responsibleFormData.email}
                onChange={(e) =>
                  setResponsibleFormData({ ...responsibleFormData, email: e.target.value })
                }
                margin="normal"
                required
                type="email"
                error={!responsibleFormData.email.trim()}
                helperText={
                  !responsibleFormData.email.trim() ? t('departments.error.emailRequired') : ''
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResponsibleDialog}>{t('departments.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                isResponsibleLoading ||
                !responsibleFormData.name.trim() ||
                !responsibleFormData.email.trim()
              }
            >
              {isResponsibleLoading ? <CircularProgress size={24} /> : t('departments.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmação de exclusão de responsável */}
      <Dialog open={openDeleteResponsibleDialog} onClose={handleCloseDeleteResponsibleDialog}>
        <DialogTitle>{t('departments.confirmDeleteResponsible')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('departments.confirmDeleteResponsibleMessage', {
              name: selectedResponsible?.name,
              department: selectedDepartmentForResponsible?.name,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteResponsibleDialog}>{t('departments.cancel')}</Button>
          <Button
            onClick={handleDeleteResponsible}
            variant="contained"
            color="error"
            disabled={isDeleteLoading}
          >
            {isDeleteLoading ? <CircularProgress size={24} /> : t('departments.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
