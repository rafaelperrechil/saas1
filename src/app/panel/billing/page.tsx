'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { Box, Alert, CircularProgress, Typography, Button } from '@mui/material';
import CurrentPlanCard from '@/components/account/CurrentPlanCard';
import StatsCard from '@/components/account/StatsCard';
import BillingHistoryCard from '@/components/account/BillingHistoryCard';
import { checkoutService, planService } from '@/services';
import { CheckoutSession, Plan } from '@/services/api.types';

export default function BillingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [payments, setPayments] = useState<CheckoutSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/panel/billing');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Carregar dados do usuário, assinatura e pagamentos
      const fetchData = async () => {
        try {
          // Buscar plano atual
          const planResponse = await planService.getCurrentPlan();
          if (planResponse.data) {
            setCurrentPlan(planResponse.data);
          } else if (planResponse.error?.includes('404')) {
            // Se não houver assinatura ativa, não é um erro
            setCurrentPlan(null);
          } else {
            setError(planResponse.error || 'Erro ao carregar plano atual');
          }

          // Buscar histórico de pagamentos
          const paymentsResponse = await checkoutService.getCheckoutSessions();
          if (paymentsResponse.data) {
            setPayments(paymentsResponse.data);
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          setError('Erro ao carregar dados. Por favor, tente novamente.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [session, status, router]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('account.billing.title')}
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('account.billing.title')}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('account.billing.subtitle')}
        </Alert>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        {/* Plano atual */}
        <Box sx={{ flex: 1 }}>
          <CurrentPlanCard
            currentPlan={currentPlan}
            translations={{
              currentPlan: t('account.billing.currentPlan'),
              active: t('account.billing.active'),
            }}
          />
        </Box>

        {/* Estatísticas de uso */}
        <Box sx={{ flex: 1 }}>
          <StatsCard
            translations={{
              statistics: 'Estatísticas',
            }}
          />
        </Box>
      </Box>

      {/* Histórico de faturamento */}
      <BillingHistoryCard
        payments={payments}
        translations={{
          billingHistory: t('account.billing.billingHistory'),
          succeeded: t('account.billing.succeeded'),
        }}
      />
    </Box>
  );
}
