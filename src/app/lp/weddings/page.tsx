import { Box } from '@mui/material';
import HeroSection from '@/components/lp/weddings/HeroSection';
import WhyUseSection from '@/components/lp/weddings/WhyUseSection';
import FeaturesSection from '@/components/lp/weddings/FeaturesSection';
import HowItWorksSection from '@/components/lp/weddings/HowItWorksSection';
import TestimonialSection from '@/components/lp/weddings/TestimonialSection';
import PricingPlans from '@/components/PricingPlans';
import FinalCTASection from '@/components/lp/weddings/FinalCTASection';
import Footer from '@/components/lp/weddings/Footer';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function WeddingsLandingPage() {
  // Buscar a sessão do usuário
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Buscar todos os planos
  const plansRaw = await prisma.plan.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      includedUnits: true,
      maxUsers: true,
      maxChecklists: true,
      extraUserPrice: true,
      extraUnitPrice: true,
      isCustom: true,
    },
    orderBy: { price: 'asc' },
  });

  // Converter os valores Decimal para number
  let plans = plansRaw.map((plan) => ({
    ...plan,
    price: plan.price.toNumber(),
    extraUserPrice: plan.extraUserPrice?.toNumber() ?? null,
    extraUnitPrice: plan.extraUnitPrice?.toNumber() ?? null,
  }));

  // Se o usuário estiver logado, verificar se tem uma subscription ativa
  if (userId) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
      select: {
        planId: true,
      },
    });

    // Se o usuário tiver uma subscription ativa, marcar os planos adequadamente
    if (activeSubscription) {
      plans = plans.map((plan) => ({
        ...plan,
        action: plan.id === activeSubscription.planId ? 'current' : 'upgrade',
      }));
    } else {
      // Se não tiver subscription ativa, todos os planos são para upgrade
      plans = plans.map((plan) => ({
        ...plan,
        action: 'upgrade',
      }));
    }
  }

  return (
    <Box>
      <HeroSection />
      <WhyUseSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialSection />
      <PricingPlans plans={plans} userIsLoggedIn={!!userId} />
      <FinalCTASection />
      <Footer />
    </Box>
  );
}
