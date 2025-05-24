'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Chip,
  Grid,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack,
  ArrowForward,
  PersonAdd,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Department {
  id: number;
  name: string;
  responsibles: Array<{ email: string; status: 'PENDING' }>;
}

interface DepartmentsStepProps {
  data: Department[];
  onChange: (data: Department[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function DepartmentsStep({ data, onChange, onBack, onNext }: DepartmentsStepProps) {
  const { t } = useTranslation();
  const [openDepartmentDialog, setOpenDepartmentDialog] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newResponsibles, setNewResponsibles] = useState<string[]>([]);
  const [currentResponsibleEmail, setCurrentResponsibleEmail] = useState('');
  const [departmentNameError, setDepartmentNameError] = useState('');
  const [responsibleEmailError, setResponsibleEmailError] = useState('');
  const [error, setError] = useState('');

  const handleOpenDepartmentDialog = () => {
    setNewDepartmentName('');
    setNewResponsibles([]);
    setCurrentResponsibleEmail('');
    setDepartmentNameError('');
    setResponsibleEmailError('');
    setOpenDepartmentDialog(true);
  };

  const handleCloseDepartmentDialog = () => {
    setOpenDepartmentDialog(false);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const addResponsibleToList = () => {
    if (!currentResponsibleEmail.trim()) {
      setResponsibleEmailError('Email do responsável é obrigatório');
      return;
    }

    if (!validateEmail(currentResponsibleEmail)) {
      setResponsibleEmailError('Email inválido');
      return;
    }

    if (newResponsibles.includes(currentResponsibleEmail.trim())) {
      setResponsibleEmailError('Este email já foi adicionado');
      return;
    }

    setNewResponsibles([...newResponsibles, currentResponsibleEmail.trim()]);
    setCurrentResponsibleEmail('');
    setResponsibleEmailError('');
  };

  const removeResponsibleFromList = (email: string) => {
    setNewResponsibles(newResponsibles.filter((r) => r !== email));
  };

  const addDepartment = (andAddAnother: boolean = false) => {
    if (!newDepartmentName.trim()) {
      setDepartmentNameError('Nome do departamento é obrigatório');
      return;
    }
    if (newResponsibles.length === 0) {
      setResponsibleEmailError('Adicione pelo menos um responsável');
      return;
    }
    if (data.some((dept) => dept.name.toLowerCase() === newDepartmentName.trim().toLowerCase())) {
      setDepartmentNameError('Este departamento já existe');
      return;
    }
    const newDepartment: Department = {
      id: Date.now(),
      name: newDepartmentName.trim(),
      responsibles: newResponsibles.map((email) => ({ email, status: 'PENDING' as const })),
    };
    onChange([...data, newDepartment]);
    if (andAddAnother) {
      setNewDepartmentName('');
      setNewResponsibles([]);
      setCurrentResponsibleEmail('');
      setDepartmentNameError('');
      setResponsibleEmailError('');
    } else {
      handleCloseDepartmentDialog();
    }
  };

  const removeDepartment = (id: number) => {
    onChange(data.filter((dept) => dept.id !== id));
  };

  const updateDepartment = (id: number, name: string) => {
    const updatedDepartments = data.map((dept) => (dept.id === id ? { ...dept, name } : dept));
    onChange(updatedDepartments);
    if (error) setError('');
  };

  const addResponsible = (departmentId: number) => {
    const updatedDepartments = data.map((dept) =>
      dept.id === departmentId
        ? {
            ...dept,
            responsibles: [...dept.responsibles, { email: '', status: 'PENDING' as const }],
          }
        : dept
    );
    onChange(updatedDepartments);
  };

  const updateResponsible = (departmentId: number, responsibleIndex: number, email: string) => {
    const updatedDepartments = data.map((dept) =>
      dept.id === departmentId
        ? {
            ...dept,
            responsibles: dept.responsibles.map((resp, index) =>
              index === responsibleIndex ? { ...resp, email } : resp
            ),
          }
        : dept
    );
    onChange(updatedDepartments);
  };

  const removeResponsible = (departmentId: number, responsibleIndex: number) => {
    const updatedDepartments = data.map((dept) =>
      dept.id === departmentId
        ? {
            ...dept,
            responsibles: dept.responsibles.filter((_, index) => index !== responsibleIndex),
          }
        : dept
    );
    onChange(updatedDepartments);
  };

  const validate = () => {
    if (data.length === 0) {
      return false;
    }

    // Verifica se todos os departamentos têm nome e pelo menos um responsável
    return data.every(
      (dept) =>
        dept.name.trim() &&
        dept.responsibles.length > 0 &&
        dept.responsibles.every((r) => r.email.trim())
    );
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('wizard.departments.title')}
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {t('wizard.departments.subtitle')}
      </Typography>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">{t('wizard.departments.title')}</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDepartmentDialog}
              color="primary"
              size="small"
              aria-label="Adicionar Departamento"
            >
              {t('wizard.departments.addDepartment')}
            </Button>
          </Box>

          {data.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: '#f5f5f5',
                border: '1px dashed #ccc',
              }}
            >
              <Typography color="textSecondary">
                Nenhum departamento adicionado. Clique no botão acima para adicionar.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell width="50px">ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Responsáveis</TableCell>
                    <TableCell width="120px" align="center">
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((dept, index) => (
                    <TableRow key={dept.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {dept.responsibles.map((responsible, responsibleIndex) => (
                            <Chip
                              key={responsible.email}
                              label={responsible.email}
                              color="primary"
                              variant="outlined"
                              size="small"
                              onDelete={() => removeResponsible(dept.id, responsibleIndex)}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeDepartment(dept.id)}
                          aria-label="Deletar Departamento"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack} aria-label="Voltar">
            {t('common.back')}
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={onNext}
            disabled={!validate()}
            aria-label="Próximo"
            data-testid="next-button"
          >
            {t('common.next')}
          </Button>
        </Box>
      </Box>

      {/* Enhanced Add Department Dialog */}
      <Dialog
        open={openDepartmentDialog}
        onClose={handleCloseDepartmentDialog}
        maxWidth="sm"
        fullWidth
        role="dialog"
      >
        <DialogTitle>{t('wizard.departments.newDepartment')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('wizard.departments.name')}
            value={newDepartmentName}
            onChange={(e) => {
              setNewDepartmentName(e.target.value);
              if (departmentNameError) setDepartmentNameError('');
            }}
            error={!!departmentNameError}
            helperText={departmentNameError}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t('wizard.departments.responsibleEmail')}
            value={currentResponsibleEmail}
            onChange={(e) => {
              setCurrentResponsibleEmail(e.target.value);
              if (responsibleEmailError) setResponsibleEmailError('');
            }}
            error={!!responsibleEmailError}
            helperText={responsibleEmailError}
            sx={{ mb: 2 }}
            aria-label="E-mail do Responsável"
          />

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
            {t('wizard.departments.responsibles')}
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => addResponsibleToList()}
                startIcon={<PersonAdd />}
                aria-label="Adicionar"
              >
                {t('common.add')}
              </Button>
            </Box>

            {newResponsibles.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('wizard.departments.responsiblesAdded')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {newResponsibles.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => removeResponsibleFromList(email)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDepartmentDialog}>{t('wizard.common.back')}</Button>
          <Button variant="contained" onClick={() => addDepartment(false)} aria-label="Salvar">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
