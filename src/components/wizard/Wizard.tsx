'use client';

import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import WelcomeStep from './steps/WelcomeStep';
import OrganizationStep from './steps/OrganizationStep';
import UnitStep from './steps/UnitStep';
import DepartmentsStep from './steps/DepartmentsStep';
import EnvironmentsStep from './steps/EnvironmentsStep';

interface Department {
  id?: string;
  name: string;
  responsibleEmail: string;
}

interface WizardData {
  organization: {
    name: string;
    employeesCount: string;
    country: string;
    city: string;
    nicheId: string;
  };
  branch: {
    name: string;
  };
  departments: Department[];
}

export default function Wizard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    organization: {
      name: '',
      employeesCount: '0',
      country: '',
      city: '',
      nicheId: '',
    },
    branch: {
      name: '',
    },
    departments: [],
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.wizardCompleted) {
      router.push('/panel/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Erro ao carregar dados</Alert>
      </Box>
    );
  }

  const handleNext = async () => {
    if (currentStep === 4) {
      // Último passo - salvar dados e redirecionar
      try {
        // Aqui você pode adicionar a lógica para salvar os dados
        await router.push('/panel/dashboard');
      } catch (error) {
        console.error('Erro ao redirecionar:', error);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleOrganizationData = (data: WizardData['organization']) => {
    setWizardData((prev) => ({
      ...prev,
      organization: data,
    }));
  };

  const handleBranchData = (data: WizardData['branch']) => {
    setWizardData((prev) => ({
      ...prev,
      branch: data,
    }));
  };

  const handleDepartmentsData = (data: Department[]) => {
    setWizardData((prev) => ({
      ...prev,
      departments: data,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <OrganizationStep
            data={wizardData.organization}
            onChange={handleOrganizationData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <UnitStep
            data={wizardData.branch}
            onChange={handleBranchData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <DepartmentsStep
            data={wizardData.departments}
            onChange={handleDepartmentsData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <EnvironmentsStep
            data={[]}
            onChange={() => {}}
            onNext={handleNext}
            onBack={handleBack}
            wizardData={wizardData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {renderStep()}
    </Box>
  );
}
