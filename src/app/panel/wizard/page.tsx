'use client';

import { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/wizard/OnboardingWizard';
import { useSession } from 'next-auth/react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { wizardService, organizationService } from '@/services';
import { WizardStep } from '@/services/api.types';

export default function WizardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [steps, setSteps] = useState<WizardStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWizard = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await organizationService.getCompletedWizardData(session.user.id);
        if (response.data?.hasCompletedWizard) {
          router.replace('/panel/dashboard');
          return;
        }

        // Se não completou, carrega os passos
        const stepsResponse = await wizardService.getSteps();
        if (stepsResponse.data) {
          setSteps(stepsResponse.data);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    checkWizard();
  }, [session, router]);

  if (status === 'loading' || loading) {
    return <LoadingScreen />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <OnboardingWizard
            steps={steps}
            onComplete={() => {
              router.replace('/panel/dashboard');
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
