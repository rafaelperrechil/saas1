'use client';

import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Link } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('auth.forgotPassword.error.invalidEmail')),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage(t('auth.forgotPassword.successMessage'));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('auth.forgotPassword.error.generic'));
        setMessage('');
      }
    } catch (err) {
      setError(t('auth.forgotPassword.error.generic'));
      setMessage('');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
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
        {/* Coluna do formulário */}
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
            />
            {message && (
              <Typography color="success.main" sx={{ mt: 2 }}>
                {message}
              </Typography>
            )}
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, p: 2 }}>
              {t('auth.forgotPassword.submit')}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" passHref>
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
