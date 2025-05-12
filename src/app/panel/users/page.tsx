'use client';
import React from 'react';
import { useState } from 'react';
import useSWR, { mutate as mutateGlobal } from 'swr';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Profile {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile: Profile;
  createdAt: string;
}

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  password: string;
  profileId: string;
}

export default function UsersPage() {
  const {
    data: users = [],
    error: usersError,
    mutate: mutateUsers,
  } = useSWR<User[]>('/api/users', fetcher);
  const { data: profiles = [], error: profilesError } = useSWR<Profile[]>('/api/profiles', fetcher);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    profileId: '',
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        password: '',
        profileId: user.profile.id,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        profileId: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      profileId: '',
    });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');

      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar usuário');
      }

      await mutateUsers();
      handleCloseDialog();
      setSuccessMessage(
        selectedUser ? 'Usuário editado com sucesso!' : 'Usuário criado com sucesso!'
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

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleteLoading(true);
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir usuário');
      }

      await mutateUsers();
      handleCloseDeleteDialog();
      setSuccessMessage('Usuário excluído com sucesso!');

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (usersError || profilesError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Erro ao carregar dados
      </Alert>
    );
  }

  if (!users || !profiles) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Usuários
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Usuário
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.profile.name}</TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => handleOpenDialog(user)}
                        color="primary"
                        aria-label="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(user)}
                        color="error"
                        aria-label="Excluir"
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

      {/* Dialog de Criação/Edição */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="user-dialog-title"
      >
        <DialogTitle id="user-dialog-title">
          {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              inputProps={{ 'aria-label': 'Nome' }}
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
              inputProps={{ 'aria-label': 'Email' }}
            />
            <TextField
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={!selectedUser}
              helperText={selectedUser ? 'Deixe em branco para manter a senha atual' : ''}
              inputProps={{ 'aria-label': 'Senha' }}
            />
            <FormControl fullWidth required>
              <InputLabel id="profile-label">Perfil</InputLabel>
              <Select
                labelId="profile-label"
                value={formData.profileId}
                onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                label="Perfil"
                inputProps={{ 'aria-label': 'Perfil' }}
              >
                {profiles.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir o usuário {selectedUser?.name}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleteLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleteLoading}
            startIcon={
              isDeleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />
            }
          >
            {isDeleteLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
