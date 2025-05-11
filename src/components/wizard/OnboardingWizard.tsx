'use client';

import { useState } from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WelcomeStep from './steps/WelcomeStep';
import OrganizationStep from './steps/OrganizationStep';
import UnitStep from './steps/UnitStep';
import DepartmentsStep from './steps/DepartmentsStep';
import EnvironmentsStep from './steps/EnvironmentsStep';
import CompletionStep from './steps/CompletionStep';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t } = useTranslation();
  const steps = [
    t('wizard.welcome.title'),
    t('wizard.organization.title'),
    t('wizard.branch.title'),
    t('wizard.departments.title'),
    t('wizard.environments.title'),
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    organization: {
      name: '',
      employeesCount: '',
      country: '',
      city: '',
      nicheId: '',
    },
    branch: {
      name: '',
    },
    departments: [] as Array<{
      name: string;
      responsibles: Array<{
        email: string;
        status: 'PENDING';
      }>;
    }>,
    environments: [] as Array<{ name: string; position: number }>,
  });

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      try {
        const response = await fetch('/api/wizard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao salvar dados');
        }

        setCompleted(true);
        // Aguarda 2 segundos antes de redirecionar
        setTimeout(onComplete, 2000);
      } catch (error) {
        console.error('Erro ao salvar dados do wizard:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Erro ao salvar os dados. Por favor, tente novamente.'
        );
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const updateFormData = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {completed ? (
          <CompletionStep />
        ) : (
          <>
            {activeStep === 0 && <WelcomeStep onNext={handleNext} />}
            {activeStep === 1 && (
              <OrganizationStep
                data={formData.organization}
                onChange={(data) => updateFormData('organization', data)}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}
            {activeStep === 2 && (
              <UnitStep
                data={formData.branch}
                onChange={(data) => updateFormData('branch', data)}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}
            {activeStep === 3 && (
              <DepartmentsStep
                data={formData.departments}
                onChange={(data) => updateFormData('departments', data)}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}
            {activeStep === 4 && (
              <EnvironmentsStep
                data={formData.environments}
                onChange={(data) => updateFormData('environments', data)}
                onBack={handleBack}
                onNext={handleNext}
                wizardData={formData}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
