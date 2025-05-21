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
  Autocomplete,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import { countries } from '@/utils/countries';
import { timezones } from '@/utils/timezones';
import { userService } from '@/services';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
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
    phone: '',
    country: '',
    timezone: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/panel/profile');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const fetchUserData = async () => {
        setLoading(true);
        setError('');

        try {
          const response = await userService.getProfile();

          if (response.data) {
            const userData = response.data;

            setUserProfile({
              id: userData.id || (session.user.id as string),
              name: userData.name || session.user.name || '',
              email: userData.email || session.user.email || '',
              phone: userData.phone || '',
              country: userData.country || '',
              timezone: userData.timezone || '',
            });

            setFormData({
              name: userData.name || session.user.name || '',
              phone: userData.phone || '',
              country: userData.country || '',
              timezone: userData.timezone || '',
            });
          } else {
            setError(response.error || t('account.profile.errorMessage'));

            setUserProfile({
              id: session.user.id as string,
              name: session.user.name || '',
              email: session.user.email || '',
              phone: '',
              country: '',
              timezone: '',
            });

            setFormData({
              name: session.user.name || '',
              phone: '',
              country: '',
              timezone: '',
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setError(t('account.profile.errorMessage'));

          setUserProfile({
            id: session.user.id as string,
            name: session.user.name || '',
            email: session.user.email || '',
            phone: '',
            country: '',
            timezone: '',
          });

          setFormData({
            name: session.user.name || '',
            phone: '',
            country: '',
            timezone: '',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [session, status, router, t]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await userService.updateProfile(formData);

      if (response.data) {
        setUserProfile((prev) => ({
          ...prev!,
          name: formData.name,
          phone: formData.phone,
          country: formData.country,
          timezone: formData.timezone,
        }));

        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
          },
        });

        setSnackbar({
          open: true,
          message: response.data.message || t('account.profile.successMessage'),
          severity: 'success',
        });
      } else {
        throw new Error(response.error || t('account.profile.errorMessage'));
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
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || t('account.profile.errorMessage')}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('account.profile.title')}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('account.profile.name')}
                name="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('account.profile.email')}
                value={userProfile.email}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('account.profile.phone')}
                name="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={countries}
                value={formData.country}
                onChange={(_, newValue) => handleChange('country', newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} label={t('account.profile.country')} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={timezones}
                value={formData.timezone}
                onChange={(_, newValue) => handleChange('timezone', newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} label={t('account.profile.timezone')} />
                )}
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ mt: 2 }}
              >
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
