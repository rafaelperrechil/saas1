'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth.register.error.required'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.register.error.passwordMismatch'));
      return;
    }
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.register.error.invalidEmail'));
      return;
    }
    setIsLoading(true);
    try {
      // Verifica se já existe usuário
      const checkRes = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setError(t('auth.register.error.emailExists'));
        setIsLoading(false);
        return;
      }
      // Cria usuário
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || t('auth.register.error.generic'));
        setIsLoading(false);
        return;
      }
      // Login automático
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (loginResult?.ok) {
        router.replace('/panel/dashboard');
      } else {
        setError(t('auth.register.error.loginAfterRegister'));
      }
    } catch (err) {
      // Exiba mensagens de erro no console apenas em ambiente de desenvolvimento e produção, não em testes
      if (process.env.NODE_ENV !== 'test') {
        console.error('Erro durante o processo de registro:', err);
      }
      setError(t('auth.register.error.generic'));
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
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: 4,
          overflow: 'hidden',
          maxWidth: 900,
          width: '100%',
        }}
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
            {t('auth.register.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('auth.register.subtitle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label={t('auth.register.name')}
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputProps={{ 'data-testid': 'name' }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.register.email')}
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputProps={{ 'data-testid': 'email' }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.register.password')}
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{ 'data-testid': 'password' }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.register.confirmPassword')}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              inputProps={{ 'data-testid': 'confirmPassword' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, p: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.register.submit')}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.register.alreadyHaveAccount')}{' '}
              <Link href="/login" passHref>
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                >
                  {t('auth.register.signIn')}
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
            minHeight: { xs: 300, md: 500 },
            overflow: 'hidden',
            order: { xs: 2, md: 1 },
            borderRadius: { xs: 4, md: 0 },
            mt: { xs: 2, md: 0 },
            mx: { xs: 2, md: 0 },
            mb: { xs: 2, md: 0 },
          }}
        >
          <Box sx={{ textAlign: 'left', px: 2, width: '100%', pt: 6, pl: 4 }}>
            <Typography component="h4" variant="h4" className="text-white font-bold mb-0">
              {t('auth.register.hero.line1')}
            </Typography>
            <Typography component="h4" variant="h4" className="text-white font-bold mb-0">
              {t('auth.register.hero.line2')}
            </Typography>
            <Typography component="h4" variant="h4" className="text-white font-bold">
              {t('auth.register.hero.line3')}
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              right: { xs: 0, md: 10 },
              bottom: 0,
              width: { xs: 280, md: 340 },
              height: { xs: 280, md: 350 },
              zIndex: 1,
            }}
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
