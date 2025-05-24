'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { profileService } from '@/services';

interface Profile {
  id: string;
  name: string;
}

export default function ProfilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await profileService.getProfiles();

      if (response.data) {
        setProfiles(response.data);
      } else {
        throw new Error(response.error || 'Erro ao carregar perfis');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar perfis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadProfiles();
    }
  }, [session]);

  const handleOpenDialog = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
      setProfileName(profile.name);
    } else {
      setEditingProfile(null);
      setProfileName('');
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProfile(null);
    setProfileName('');
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!profileName.trim()) {
        setError('Nome é obrigatório');
        return;
      }

      setIsSaving(true);
      const response = editingProfile
        ? await profileService.updateProfile(editingProfile.id, { name: profileName.trim() })
        : await profileService.createProfile({ name: profileName.trim() });

      if (response.data) {
        setSuccessMessage(
          editingProfile ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!'
        );
        handleCloseDialog();
        await loadProfiles();

        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        throw new Error(response.error || 'Erro ao salvar perfil');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (profile: Profile) => {
    setProfileToDelete(profile);
    setOpenDeleteDialog(true);
    setError('');
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setProfileToDelete(null);
    setError('');
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;

    try {
      setIsDeleting(profileToDelete.id);
      const response = await profileService.deleteProfile(profileToDelete.id);

      if (response.data) {
        setSuccessMessage('Perfil excluído com sucesso!');
        handleCloseDeleteDialog();
        await loadProfiles();

        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        throw new Error(response.error || 'Erro ao excluir perfil');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gerenciar Perfis
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Novo Perfil
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.dark' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenDialog(profile)}
                    sx={{
                      color: 'grey.600',
                      '&:hover': {
                        color: '#1976d2'
                      }
                    }}
                    data-testid="edit-button"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenDeleteDialog(profile)}
                    sx={{
                      color: 'grey.600',
                      '&:hover': {
                        color: 'error.main',
                      },
                    }}
                    data-testid="delete-button"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingProfile ? 'Editar Perfil' : 'Novo Perfil'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Perfil"
            type="text"
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={isSaving}
          />
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

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Excluir Perfil</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o perfil "{profileToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting !== null}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={isDeleting !== null}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
