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
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/profiles');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar perfis');
      }
      const data = await response.json();
      setProfiles(data);
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

      const url = editingProfile ? `/api/profiles/${editingProfile.id}` : '/api/profiles';

      const response = await fetch(url, {
        method: editingProfile ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: profileName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar perfil');
      }

      setSuccess(editingProfile ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!');
      handleCloseDialog();
      await loadProfiles();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este perfil?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir perfil');
      }

      setSuccess('Perfil excluído com sucesso!');
      await loadProfiles();
    } catch (error: any) {
      setError(error.message);
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.name}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenDialog(profile)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(profile.id)}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
