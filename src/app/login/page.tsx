'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
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
import Image from 'next/image';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.login.error.required'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('auth.login.error.invalid'));
      } else if (result?.ok) {
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError(t('auth.login.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
        sx={{ display: 'flex', borderRadius: 4, overflow: 'hidden', maxWidth: 900, width: '100%' }}
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
          <Typography component="h1" variant="h5" gutterBottom>
            {t('auth.login.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('auth.login.subtitle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.login.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.login.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, p: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.login.submit')}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link href="/forgot-password" passHref>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                {t('auth.login.forgotPassword')}
              </Typography>
            </Link>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.login.noAccount')}{' '}
              <Link href="/register" passHref>
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                >
                  {t('auth.login.signUp')}
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
        {/* Coluna da imagem/mensagem */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'primary.main',
            color: '#fff',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
            minHeight: 500,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ textAlign: 'left', px: 2, width: '100%', pt: 6, pl: 4 }}>
            <Typography component="h4" variant="h4" className="text-white font-bold mb-0">
              {t('auth.login.hero.line1')}
            </Typography>
            <Typography component="h4" variant="h4" className="text-white font-bold mb-0">
              {t('auth.login.hero.line2')}
            </Typography>
            <Typography component="h4" variant="h4" className="text-white font-bold">
              {t('auth.login.hero.line3')}
            </Typography>
          </Box>
          <Box
            sx={{ position: 'absolute', right: 10, bottom: 0, width: 340, height: 350, zIndex: 1 }}
          >
            <Image
              src="/images/login-woman.png"
              alt="Login Hero"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              fill
              sizes="(max-width: 900px) 100vw, 340px"
              priority
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
