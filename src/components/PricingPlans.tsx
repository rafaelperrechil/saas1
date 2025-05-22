'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Grid, Card, CardContent, Typography, Button, Box, useTheme, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { planService, stripeService } from '@/services';

// Plan type matching Prisma response
interface Plan {
  id: string;
  name: string;
  price: number;
  includedUnits: number;
  maxUsers: number;
  maxChecklists: number | null;
  extraUserPrice: number | null;
  extraUnitPrice: number | null;
  isCustom: boolean;
  action?: 'current' | 'upgrade';
}

export default function PricingPlans({
  plans,
  userIsLoggedIn,
}: {
  plans: Plan[];
  userIsLoggedIn: boolean;
}) {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation();
  const theme = useTheme();

  const handleGetStarted = async (planId: string, action?: string) => {
    // Se o plano é o atual do usuário, não fazer nada
    if (action === 'current') {
      return;
    }

    localStorage.setItem('planid', planId);
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    try {
      // Criar a sessão de checkout diretamente
      const response = await planService.createCheckoutSession(planId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      // Aqui você pode adicionar uma notificação de erro se desejar
    }
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = Number(value);
    if (isNaN(numValue)) return 'N/A';
    return `R$ ${numValue.toFixed(2)}`;
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
        {t('pricing.title')}
      </Typography>
      <Typography variant="subtitle1" textAlign="center" color="text.secondary" mb={6}>
        {t('pricing.subtitle')}
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={3} key={plan.id} sx={{ position: 'relative' }}>
            {plan.action === 'current' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '14px',
                  left: '17px',
                  width: '100%',
                  textAlign: 'center',
                  zIndex: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#FFF',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    bgcolor: 'primary.main',
                    borderRadius: '16px',
                    px: 2,
                    py: 0.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {t('pricing.currentPlan')}
                </Typography>
              </Box>
            )}
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                border:
                  plan.action === 'current' ? `2px solid ${theme.palette.primary.dark}` : undefined,
                boxShadow:
                  plan.action === 'current' ? `0 0 10px ${theme.palette.primary.dark}` : undefined,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  zIndex: 1,
                  cursor: plan.action === 'current' ? 'default' : 'pointer',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(plan.price)}
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {t('pricing.perMonth')}
                  </Typography>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mt: 2 }}>
                  {plan.maxChecklists !== null && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                      <Typography>
                        {t('pricing.maxChecklists')}: <strong>{plan.maxChecklists}</strong>
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography>
                      {t('pricing.maxUsers')}: <strong>{plan.maxUsers}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography>
                      {t('pricing.includedUnits')}: <strong>{plan.includedUnits}</strong>
                    </Typography>
                  </Box>
                  {plan.extraUserPrice !== null && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                      <Typography variant="body2" color="textSecondary">
                        {t('pricing.extraUserPrice')}:{' '}
                        <strong>{formatCurrency(Number(plan.extraUserPrice))}</strong>
                      </Typography>
                    </Box>
                  )}
                  {plan.extraUnitPrice !== null && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                      <Typography>
                        {t('pricing.extraUnitPrice')}:{' '}
                        <strong>{formatCurrency(plan.extraUnitPrice)}</strong>
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant={plan.action === 'current' ? 'outlined' : 'contained'}
                  color={plan.action === 'current' ? 'success' : 'primary'}
                  fullWidth
                  onClick={() => handleGetStarted(plan.id, plan.action)}
                  disabled={plan.action === 'current'}
                >
                  {!userIsLoggedIn
                    ? t('pricing.signInToGetStarted')
                    : plan.action === 'current'
                      ? t('pricing.planActivated')
                      : t('pricing.upgradeNow')}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
