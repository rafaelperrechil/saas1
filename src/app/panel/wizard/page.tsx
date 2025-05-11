'use client';

import { useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/wizard/OnboardingWizard';
import { useSession } from 'next-auth/react';

export default function WizardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Se o usuário já completou o wizard, redireciona para o dashboard
    if (session?.user?.wizardCompleted) {
      router.push('/panel/dashboard');
    }
  }, [session, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
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
          <OnboardingWizard onComplete={() => router.push('/panel/templates/new')} />
        </Box>
      </Container>
    </Box>
  );
}
