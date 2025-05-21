'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PricingPlans from '../../components/PricingPlans';
import MarketNichesSection from '../../components/MarketNichesSection';
import UnitsSection from '../../components/UnitsSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import FAQSection from '../../components/FAQSection';
import CTASection from '../../components/CTASection';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Plan } from '@/services/api.types';

export default function PricingPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (!response.ok) {
          throw new Error('Falha ao carregar planos');
        }
        const data = await response.json();
        console.log('Planos carregados:', data); // Debug
        setPlans(data);
      } catch (err) {
        console.error('Erro ao carregar planos:', err); // Debug
        setError(err instanceof Error ? err.message : 'Erro ao carregar planos');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PricingPlans plans={plans} userIsLoggedIn={!!session?.user} />
      <MarketNichesSection />
      <UnitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
