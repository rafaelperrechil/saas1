'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import GoogleIcon from '@mui/icons-material/Google';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
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
      setError('Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
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
        setError('Já existe uma conta com este email');
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
        setError(data.message || 'Erro ao criar conta');
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
        router.replace('/dashboard');
      } else {
        setError('Conta criada, mas erro ao logar. Faça login manualmente.');
      }
    } catch (err) {
      setError('Erro ao criar conta.');
    } finally {
      setIsLoading(false);
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
            Criar Conta
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Repetir Senha"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                mt: 3,
                mb: 2,
                fontWeight: 600,
                fontSize: 16,
                py: 1.5,
                boxShadow: 'none',
                backgroundColor: '#9c27b0 !important',
                color: '#fff !important',
                '&:hover': {
                  backgroundColor: '#7b1fa2 !important',
                },
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Criar conta'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Typography color="primary" variant="body2">
                  Já tem uma conta? Entrar
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
        {/* Coluna da imagem/mensagem */}
        <Box
          sx={{
            flex: 1,
            bgcolor: '#7b1fa2',
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
            <Typography variant="h4" fontWeight={400} sx={{ mb: 3, lineHeight: 1.2 }}>
              Soluções simples <br />
              para manter <br />a excelência
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
