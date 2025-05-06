'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { Box, Alert, CircularProgress } from '@mui/material';
import CurrentPlanCard from '@/components/account/CurrentPlanCard';
import StatsCard from '@/components/account/StatsCard';
import BillingHistoryCard from '@/components/account/BillingHistoryCard';

export default function BillingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/billing');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Carregar dados do usuário, assinatura e pagamentos
      const fetchData = async () => {
        try {
          // Buscar dados do usuário
          const userResponse = await fetch('/api/user/subscription');
          const userData = await userResponse.json();

          // Buscar histórico de pagamentos
          const paymentsResponse = await fetch('/api/user/payments');
          const paymentsData = await paymentsResponse.json();

          setUserData(userData);
          setPayments(paymentsData.payments || []);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
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

  // Verificar se o usuário tem um plano ativo
  const activeSubscription = userData?.subscriptions?.[0] || null;
  const currentPlan = activeSubscription?.plan || null;

  return (
    <Box>
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
            subscription={activeSubscription}
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
