'use client';

import { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WelcomeStep from './steps/WelcomeStep';
import OrganizationStep from './steps/OrganizationStep';
import UnitStep from './steps/UnitStep';
import DepartmentsStep from './steps/DepartmentsStep';
import EnvironmentsStep from './steps/EnvironmentsStep';
import CompletionStep from './steps/CompletionStep';
import api from '@/services/api';
import { signIn, useSession } from 'next-auth/react';
import { wizardService } from '@/services';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    organization: {
      name: '',
      employeesCount: 1,
      country: 'Brasil',
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

  const { data: session } = useSession();

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await api.get('/api/organization/completed-wizard', {
          requiresAuth: true,
        });

        if (response.data && 'hasCompletedWizard' in response.data) {
          setHasCompletedWizard(response.data.hasCompletedWizard);
          if (response.data.organizationData) {
            setFormData((prev) => ({
              ...prev,
              organization: {
                name: response.data.organizationData.name || '',
                employeesCount: Number(response.data.organizationData.employeesCount) || 0,
                country: response.data.organizationData.country || '',
                city: response.data.organizationData.city || '',
                nicheId: response.data.organizationData.nicheId || '',
              },
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados da organização:', error);
      }
    };

    fetchOrganizationData();
  }, []);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      try {
        // Preparar os dados para salvar
        const dataToSave = {
          organization: {
            ...formData.organization,
            employeesCount: Number(formData.organization.employeesCount),
          },
          branch: formData.branch,
          departments: formData.departments.map((dept) => ({
            name: dept.name,
            responsibles: dept.responsibles.map((resp) => ({
              email: resp.email,
              status: resp.status,
            })),
          })),
          environments: formData.environments.map((env, index) => ({
            name: env.name,
            position: index,
          })),
        };

        const response = await wizardService.saveWizardData(dataToSave);
        console.log('saveWizardData', response);
        if (response.error) {
          throw new Error(response.error);
        }

        setCompleted(true);
        // Atualiza a sessão do usuário para garantir que a organização esteja disponível
        //if (session?.user?.email && response.data && 'branch' in response.data) {
        if (session?.user?.email) {
          await signIn('credentials', {
            redirect: false,
            email: session?.user?.email,
            branchId: response?.data?.data?.branch?.id,
            trigger: 'update',
          });
        }
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
    // Se for a seção da organização e já existe wizard completo, não permite atualização
    if (section === 'organization' && hasCompletedWizard) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}>
        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          alternativeLabel={!isMobile}
          sx={{
            '& .MuiStepLabel-root': isMobile
              ? {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1,
                }
              : {},
            '& .MuiStepLabel-labelContainer': isMobile
              ? {
                  m: 0,
                }
              : {},
          }}
        >
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
                readOnly={hasCompletedWizard}
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
