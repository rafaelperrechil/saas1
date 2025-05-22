'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { authService } from '@/services';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenError(t('auth.resetPassword.error.invalidToken'));
        setIsValidatingToken(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/check-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (!data.valid) {
          setTokenError(t('auth.resetPassword.error.invalidToken'));
        } else {
          setIsTokenValid(true);
        }
      } catch (error) {
        setTokenError(t('auth.resetPassword.error.invalidToken'));
      } finally {
        setIsValidatingToken(false);
      }
    };

    checkToken();
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');

    if (password.length < 6) {
      setFormError(t('auth.resetPassword.error.passwordLength'));
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t('auth.resetPassword.error.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword({
        token: token!,
        password,
        confirmPassword,
        lang: i18n.language,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess(true);
      // Aguarda 2 segundos antes de redirecionar
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setFormError(error.message || t('auth.resetPassword.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <CircularProgress />
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!token || tokenError) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" gutterBottom>
              {t('auth.resetPassword.error.invalidToken')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('auth.resetPassword.error.expiredToken')}
            </Typography>
            <Button fullWidth variant="contained" onClick={() => router.push('/login')}>
              {t('auth.resetPassword.backToLogin')}
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" gutterBottom>
              {t('auth.resetPassword.success.title')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('auth.resetPassword.success.message')}
            </Typography>
            <CircularProgress size={24} />
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            {t('auth.resetPassword.title')}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.resetPassword.newPassword')}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              error={!!formError}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.resetPassword.confirmPassword')}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              error={!!formError}
            />
            {formError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.resetPassword.submit')}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Typography color="primary" variant="body2">
                  {t('auth.resetPassword.backToLogin')}
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
