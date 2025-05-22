'use client';
import React from 'react';
import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Link, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services';
import { useSearchParams } from 'next/navigation';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('auth.forgotPassword.error.invalidEmail')),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Se houver email na URL, preenche o campo
  React.useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setValue('email', email);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.forgotPassword(data.email);

      if (response.data) {
        setMessage(t('auth.forgotPassword.successMessage'));
      } else {
        setError(response.error || t('auth.forgotPassword.error.generic'));
      }
    } catch (err) {
      setError(t('auth.forgotPassword.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: 8,
        bgcolor: '#f7f8fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{ display: 'flex', borderRadius: 4, overflow: 'hidden', maxWidth: 400, width: '100%' }}
      >
        <Box
          sx={{
            flex: 1,
            p: { xs: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography component="h1" variant="h5" fontWeight={700} gutterBottom>
            {t('auth.forgotPassword.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('auth.forgotPassword.subtitle')}
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.forgotPassword.email')}
              autoComplete="email"
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />
            {message && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {message}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, p: 2 }}
              disabled={isLoading}
            >
              {t('auth.forgotPassword.submit')}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login">
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                  {t('auth.forgotPassword.backToLogin')}
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
