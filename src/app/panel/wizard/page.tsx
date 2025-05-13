'use client';

import { useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/wizard/OnboardingWizard';
import { useSession } from 'next-auth/react';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function WizardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Se o usuário tem uma branch e ela já completou o wizard, redireciona para o dashboard
    if (session?.user?.branch?.wizardCompleted) {
      router.push('/panel/dashboard');
    }
  }, [session, router]);

  // Mostra loading enquanto verifica a sessão
  if (status === 'loading' || session?.user?.branch?.wizardCompleted) {
    return <LoadingScreen />;
  }

  return (
    <Box
      sx={{
        // minHeight: '100vh',
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
