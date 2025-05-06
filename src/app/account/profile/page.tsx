'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/profile');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Carregar dados do usuário
      const fetchUserData = async () => {
        setLoading(true);
        setError('');

        try {
          const response = await fetch('/api/user/profile');

          if (response.ok) {
            const userData = await response.json();

            setUserProfile({
              id: userData.id || (session.user.id as string),
              name: userData.name || session.user.name || '',
              email: userData.email || session.user.email || '',
              company: userData.company || '',
              phone: userData.phone || '',
            });

            setFormData({
              name: userData.name || session.user.name || '',
              company: userData.company || '',
              phone: userData.phone || '',
            });
          } else {
            const errorData = await response.json();
            setError(errorData.error || t('account.profile.errorMessage'));

            // Usar dados da sessão como fallback
            setUserProfile({
              id: session.user.id as string,
              name: session.user.name || '',
              email: session.user.email || '',
              company: '',
              phone: '',
            });

            setFormData({
              name: session.user.name || '',
              company: '',
              phone: '',
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setError(t('account.profile.errorMessage'));

          // Usar dados da sessão como fallback
          setUserProfile({
            id: session.user.id as string,
            name: session.user.name || '',
            email: session.user.email || '',
            company: '',
            phone: '',
          });

          setFormData({
            name: session.user.name || '',
            company: '',
            phone: '',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [session, status, router, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Enviar dados atualizados para o servidor
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar o perfil local
        setUserProfile((prev) => ({
          ...prev!,
          name: formData.name,
          // company e phone serão simulados na interface, mas podem não ser salvos no DB
          company: formData.company,
          phone: formData.phone,
        }));

        // Atualizar a sessão para refletir o novo nome
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
          },
        });

        // Mostrar mensagem do servidor se existir
        setSnackbar({
          open: true,
          message: data.message || t('account.profile.successMessage'),
          severity: 'success',
        });
      } else {
        throw new Error(data.error || t('account.profile.errorMessage'));
      }
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      setError(error.message || t('account.profile.errorMessage'));
      setSnackbar({
        open: true,
        message: error.message || t('account.profile.errorMessage'),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
        <Typography variant="h5">{t('account.profile.personalInfo')}</Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Alert severity="info">{t('account.profile.subtitle')}</Alert>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label={t('account.profile.firstName')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              disabled={saving}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('account.profile.email')}
              value={userProfile?.email}
              variant="outlined"
              margin="normal"
              disabled
              helperText={t('account.profile.emailHelp')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('account.profile.company')}
              name="company"
              value={formData.company}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              disabled={saving}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('account.profile.phone')}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              disabled={saving}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={saving ? null : <SaveIcon />}
            disabled={saving}
            sx={{ minWidth: 150 }}
          >
            {saving ? <CircularProgress size={24} /> : t('account.profile.saveChanges')}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
