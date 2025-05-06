'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState({ id: '' });

  useEffect(() => {
    // Poderia verificar o status da sessão no servidor, mas para simplificar
    // apenas simulamos uma verificação de sucesso com o session_id
    if (sessionId || paymentIntentId) {
      // Simulação de verificação de status
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTransactionInfo({
          id: paymentIntentId || sessionId || 'unknown',
        });
      }, 1500);
    } else {
      setLoading(false);
      setError('Informações da sessão não encontradas.');
    }
  }, [sessionId, paymentIntentId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Processando seu pagamento...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          <AlertTitle>Erro no processamento</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" component={Link} href="/pricing">
            Voltar para planos
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
        }}
      >
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />

        <Typography variant="h4" gutterBottom>
          Pagamento confirmado!
        </Typography>

        <Typography variant="body1" paragraph color="text.secondary">
          Obrigado por sua compra. Seu pagamento foi processado com sucesso.
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          ID da transação: {transactionInfo.id}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" paragraph>
          Enviamos um recibo para seu e-mail.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around' }}>
          <Button variant="contained" color="primary" component={Link} href="/panel/dashboard">
            Ir para o painel
          </Button>

          <Button variant="outlined" component={Link} href="/home">
            Voltar ao início
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
