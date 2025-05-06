'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

interface PaymentMethodCardProps {
  stripeCustomerId: string;
  translations?: {
    paymentMethod?: string;
  };
}

// Simulação de informações do cartão (em uma aplicação real seria buscado do Stripe)
interface CardInfo {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export default function PaymentMethodCard({
  stripeCustomerId,
  translations,
}: PaymentMethodCardProps) {
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const text = {
    paymentMethod: translations?.paymentMethod || 'Payment Method',
    noPaymentMethod: 'No payment method saved',
    updatePaymentMethod: 'Update payment method',
    addPaymentMethod: 'Add payment method',
  };

  const handleUpdatePaymentMethod = async () => {
    setLoading(true);

    try {
      // Simulação para verificação do Stripe
      // Na implementação real, chamaria um endpoint da API para criar uma sessão do Stripe
      console.log('Updating payment method for customer:', stripeCustomerId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirecionar para o Stripe na implementação real
      // window.location.href = sessionUrl;
    } catch (error) {
      console.error('Error creating payment session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simular que não existe método de pagamento salvo
  const hasPaymentMethod = false;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {text.paymentMethod}
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          py={3}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <CreditCardIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="textSecondary">{text.noPaymentMethod}</Typography>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={handleUpdatePaymentMethod}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {hasPaymentMethod ? text.updatePaymentMethod : text.addPaymentMethod}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
