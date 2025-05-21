'use client';

import { Box } from '@mui/material';
import HeroSection from '@/components/lp/weddings/HeroSection';
import WhyUseSection from '@/components/lp/weddings/WhyUseSection';
import FeaturesSection from '@/components/lp/weddings/FeaturesSection';
import HowItWorksSection from '@/components/lp/weddings/HowItWorksSection';
import TestimonialSection from '@/components/lp/weddings/TestimonialSection';
import PricingPlans from '@/components/PricingPlans';
import FinalCTASection from '@/components/lp/weddings/FinalCTASection';
import Footer from '@/components/lp/weddings/Footer';
import { useSession } from 'next-auth/react';
import { planService } from '@/services';
import { Plan } from '@/services/api.types';
import { useEffect, useState } from 'react';
import { CircularProgress, Typography } from '@mui/material';

type PlanWithAction = Plan & { action: 'current' | 'upgrade' };

export default function WeddingsLandingPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<PlanWithAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await planService.getPlans();
        if (response.error) {
          throw new Error(response.error);
        }

        let plansData: PlanWithAction[] = (response.data || []).map((plan) => ({
          ...plan,
          action: 'upgrade' as const,
        }));

        // Se o usuário estiver logado, verificar se tem uma subscription ativa
        if (session?.user?.id) {
          const currentPlanResponse = await planService.getCurrentPlan();
          const currentPlanId = currentPlanResponse.data?.id;

          // Se o usuário tiver uma subscription ativa, marcar os planos adequadamente
          if (currentPlanId) {
            plansData = plansData.map((plan) => ({
              ...plan,
              action: plan.id === currentPlanId ? 'current' : 'upgrade',
            }));
          }
        }

        setPlans(plansData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [session]);

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
      <Box sx={{ p: 3 }}>
        <Typography color="error">Erro ao carregar planos: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <HeroSection />
      <WhyUseSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialSection />
      <PricingPlans plans={plans} userIsLoggedIn={!!session?.user} />
      <FinalCTASection />
      <Footer />
    </Box>
  );
}
